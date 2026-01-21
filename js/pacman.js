class Pacman {
    constructor(game, x, y) {
        this.game = game;
        this.x = x * 16; // Pixel position
        this.y = y * 16;
        this.speed = 2; // Pixels per frame
        this.dir = { x: 0, y: 0 }; // Current movement direction
        this.nextDir = { x: 0, y: 0 }; // Queued direction
        this.radius = 6;
        this.mouthOpen = 0;
        this.mouthSpeed = 0.2;
    }

    handleInput(key) {
        switch(key) {
            case 'ArrowUp': this.nextDir = { x: 0, y: -1 }; break;
            case 'ArrowDown': this.nextDir = { x: 0, y: 1 }; break;
            case 'ArrowLeft': this.nextDir = { x: -1, y: 0 }; break;
            case 'ArrowRight': this.nextDir = { x: 1, y: 0 }; break;
        }
    }

    update() {
        // Animate mouth
        this.mouthOpen += this.mouthSpeed;
        if (this.mouthOpen > 1 || this.mouthOpen < 0) this.mouthSpeed = -this.mouthSpeed;

        // 1. Handle Immediate Reversal (Classic Pacman behavior)
        if (this.nextDir.x !== 0 || this.nextDir.y !== 0) {
            // Case A: Reversing
            if (this.nextDir.x === -this.dir.x && this.nextDir.y === -this.dir.y) {
                this.dir = this.nextDir;
                this.nextDir = { x: 0, y: 0 };
            }
            // Case B: Starting from Stop
            else if (this.dir.x === 0 && this.dir.y === 0) {
                 if (!this.isWallBlocking(this.nextDir)) {
                    this.dir = this.nextDir;
                    this.nextDir = { x: 0, y: 0 };
                }
            }
        }

        // 2. Calculate Center of nearest tile
        let center = {
            x: Math.round(this.x / 16) * 16,
            y: Math.round(this.y / 16) * 16
        };

        // 3. Check if we are at center OR will cross it this frame
        // (We use >= and <= to handle exact landing too)
        let distSincePixel = Math.abs(this.x - center.x) + Math.abs(this.y - center.y);
        // If we are moving towards center and distance is less than speed, we cross it.
        // Or if we are exactly there (dist=0)
        
        // Simplified: Are we aligned enough to make a decision?
        // If we simply execute movement, where do we end up?
        let nextPos = {
            x: this.x + this.dir.x * this.speed,
            y: this.y + this.dir.y * this.speed
        };

        // Detection: Did we cross 'center' between (this.x,this.y) and nextPos?
        // Check X axis crossing
        let crossedX = (this.dir.x > 0 && this.x <= center.x && nextPos.x >= center.x) ||
                       (this.dir.x < 0 && this.x >= center.x && nextPos.x <= center.x);
        // Check Y axis crossing
        let crossedY = (this.dir.y > 0 && this.y <= center.y && nextPos.y >= center.y) ||
                       (this.dir.y < 0 && this.y >= center.y && nextPos.y <= center.y);

        if (crossedX || crossedY) {
            // WE HIT A TILE CENTER!
            // Snap position exactly to center to run logic
            this.x = center.x;
            this.y = center.y;

            // Decision Time
            // a. Try to Turn
            if (this.nextDir.x !== 0 || this.nextDir.y !== 0) {
                if (!this.isWallBlocking(this.nextDir)) {
                    this.dir = this.nextDir;
                    this.nextDir = { x: 0, y: 0 };
                }
            }
            
            // b. Check if blocked ahead
            if (this.isWallBlocking(this.dir)) {
                // Stop here
                this.checkCollisions(); // Check dot at this center
                return; 
            }
        }

        // Apply Movement
        this.x += this.dir.x * this.speed;
        this.y += this.dir.y * this.speed;

        // Tunnel Wrapping
        if (this.x < -8) this.x = this.game.canvas.width;
        if (this.x > this.game.canvas.width) this.x = -8;

        this.checkCollisions();
    }

    // Helper: is there a wall in this direction from CURRENT ALIGNED position?
    isWallBlocking(direction) {
        let nextX = this.x + direction.x * 16;
        let nextY = this.y + direction.y * 16;
        
        let gridX = Math.floor((nextX + 8) / 16);
        let gridY = Math.floor((nextY + 8) / 16);

        return this.game.board.isWall(gridX, gridY);
    }
    
    // Legacy support or strict check helper
    // Not used in new update loop but kept if needed
    canMove(direction) { return !this.isWallBlocking(direction); }

    checkCollisions() {
        // Center of pacman
        let gridX = Math.floor((this.x + 8) / 16);
        let gridY = Math.floor((this.y + 8) / 16);

        // Check interactions with board elements
        const cell = this.game.board.grid[gridY] && this.game.board.grid[gridY][gridX];
        if (cell === 0) { // Dot
            this.game.board.grid[gridY][gridX] = 3; // Eat it
            this.game.score += 10;
        } else if (cell === 2) { // Power pellet
            this.game.board.grid[gridY][gridX] = 3;
            this.game.score += 50;
            // TODO: Frighten ghosts
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        
        let angle = 0;
        if (this.dir.x === 1) angle = 0;
        if (this.dir.x === -1) angle = Math.PI;
        if (this.dir.y === -1) angle = -Math.PI/2;
        if (this.dir.y === 1) angle = Math.PI/2;

        const mouthSize = 0.2 * (Math.abs(this.mouthOpen) + 0.1);
        
        ctx.save();
        ctx.translate(this.x + 8, this.y + 8);
        ctx.rotate(angle);
        ctx.arc(0, 0, this.radius + 1, mouthSize * Math.PI, (2 - mouthSize) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.restore();
    }
}
