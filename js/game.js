class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.board = new Board(this.ctx);
        this.lastTime = 0;
        this.isRunning = false;
        
        // Bind loop
        this.loop = this.loop.bind(this);
    }

    async start(levelSource) {
        try {
            this.currentLevelName = "Défaut"; // Default name
            if (levelSource.startsWith('local:')) {
                const name = levelSource.replace('local:', '');
                this.currentLevelName = name;
                this.levelData = Storage.getLevel(name);
                if (!this.levelData) throw new Error("Level not found in storage");
            } else {
                const response = await fetch(levelSource);
                this.levelData = await response.json();
            }
            
            // Resize canvas to fit level
            this.canvas.width = this.levelData.width * 16;
            this.canvas.height = this.levelData.height * 16;
            
            this.initGame();

            // Input listeners
            window.addEventListener('keydown', (e) => {
                if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
                    e.preventDefault();
                    if(this.pacman) this.pacman.handleInput(e.code);
                }
                if(e.code === "Space") {
                    e.preventDefault();
                    this.restart();
                }
            });

            this.isRunning = true;
            this.score = 0;
            requestAnimationFrame(this.loop);
            
            console.log("Game Started");
        } catch (error) {
            console.error("Failed to load level:", error);
        }
    }

    restart() {
        this.score = 0;
        this.initGame();
        this.isRunning = true;
        this.lastTime = performance.now();
        document.getElementById('game-over-overlay').classList.add('hidden');
        requestAnimationFrame(this.loop);
    }

    initGame() {
        this.board.load(this.levelData);
        
        // Find spawn point
        let spawnX = 1, spawnY = 1;
        this.ghosts = [];
        const ghostColors = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852']; // Blinky, Pinky, Inky, Clyde
        let ghostIndex = 0;

        for(let y=0; y<this.board.height; y++) {
            for(let x=0; x<this.board.width; x++) {
                if (this.board.grid[y][x] === 5) {
                    spawnX = x;
                    spawnY = y;
                    this.board.grid[y][x] = 3; // Clear spawn marker
                } else if (this.board.grid[y][x] === 4) {
                    // Spawn ghost
                    let color = ghostColors[ghostIndex % ghostColors.length];
                    let ghost = new Ghost(this, x, y, color);
                    // Assign scatter corners based on index
                    switch(ghostIndex % 4) {
                        case 0: ghost.scatterTarget = {x: this.canvas.width, y: 0}; break; // Top Right
                        case 1: ghost.scatterTarget = {x: 0, y: 0}; break; // Top Left
                        case 2: ghost.scatterTarget = {x: this.canvas.width, y: this.canvas.height}; break; // Bottom Right
                        case 3: ghost.scatterTarget = {x: 0, y: this.canvas.height}; break; // Bottom Left
                    }
                    this.ghosts.push(ghost);
                    this.board.grid[y][x] = 3;
                    ghostIndex++;
                }
            }
        }

        this.pacman = new Pacman(this, spawnX, spawnY);
        
        // Difficulty Settings
        this.difficultyLevel = document.getElementById('difficulty-select').value;
        this.setupDifficulty();

        this.globalMode = 'SCATTER';
        this.modeTimer = 0;
    }

    setupDifficulty() {
        // Base config
        this.difficultyConfig = {
            speedMultiplier: 1.0,
            scatterDuration: 7000,
            chaseDuration: 20000
        };

        if (this.difficultyLevel === 'easy') {
            this.difficultyConfig.speedMultiplier = 0.8;
            this.difficultyConfig.chaseDuration = 10000; // Shorter chase
        } else if (this.difficultyLevel === 'hard') {
            this.difficultyConfig.speedMultiplier = 1.2;
            this.difficultyConfig.scatterDuration = 5000; // Shorter scatter
        }
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();
        
        // Update UI
        document.getElementById('current-score').innerText = this.score;

        requestAnimationFrame(this.loop);
    }

    update(deltaTime) {
        if (!this.pacman) return;
        this.pacman.update();

        // Update Ghost Modes (Scatter/Chase cycling)
        this.modeTimer += deltaTime;
        let limit = this.globalMode === 'SCATTER' ? this.difficultyConfig.scatterDuration : this.difficultyConfig.chaseDuration;
        if (this.modeTimer > limit) {
            this.modeTimer = 0;
            this.globalMode = this.globalMode === 'SCATTER' ? 'CHASE' : 'SCATTER';
            // Sync all ghosts to global mode unless frightened
            this.ghosts.forEach(g => {
                if(g.mode !== 'FRIGHTENED') g.mode = this.globalMode;
            });
        }

        this.ghosts.forEach(g => {
            g.update(this.difficultyConfig);
            // Collision with Pacman
            if (Math.abs(g.x - this.pacman.x) < 10 && Math.abs(g.y - this.pacman.y) < 10) {
                if (g.mode === 'FRIGHTENED') {
                    // Eat ghost
                    g.reset(); // Send to house (simplified reset)
                    g.mode = this.globalMode;
                    this.score += 200; // TODO Multiplier
                } else {
                    // Die
                    this.gameOver();
                }
            }
        });
        
        // Win condition?
        if (this.board.dotsLeft === 0) {
            this.victory();
        }
    }

    victory() {
        this.isRunning = false;
        const overlay = document.getElementById('game-over-overlay');
        overlay.classList.remove('hidden');
        document.getElementById('game-over-title').innerText = "VICTOIRE !";
        document.getElementById('game-over-title').style.color = "#00FF00";
        document.getElementById('final-score').innerText = this.score;
        Storage.saveScore(this.score, document.getElementById('player-name').value || "Player", this.currentLevelName, this.difficultyLevel);
    }

    gameOver() {
        this.isRunning = false;
        const overlay = document.getElementById('game-over-overlay');
        overlay.classList.remove('hidden');
        document.getElementById('game-over-title').innerText = "GAME OVER";
        document.getElementById('game-over-title').style.color = "red";
        document.getElementById('final-score').innerText = this.score;
        Storage.saveScore(this.score, document.getElementById('player-name').value || "Player", this.currentLevelName, this.difficultyLevel);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.board.draw();
        if (this.pacman) this.pacman.draw(this.ctx);
        this.ghosts.forEach(g => g.draw(this.ctx));
    }
}
