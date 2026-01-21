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

        // Try to turn
        if (this.nextDir.x !== 0 || this.nextDir.y !== 0) {
            if (this.canMove(this.nextDir)) {
                this.dir = this.nextDir;
                this.nextDir = { x: 0, y: 0 };
            }
        }

        // Try to move
        if (this.canMove(this.dir)) {
            this.x += this.dir.x * this.speed;
            this.y += this.dir.y * this.speed;
            
            // Handle wrapping (tunnel)
            if (this.x < -8) this.x = this.game.canvas.width;
            if (this.x > this.game.canvas.width) this.x = -8;
        } else {
            // Snap to grid if stuck
           // this.alignToGrid();
        }

        this.checkCollisions();
    }

    // Check if we can move in a direction from current position
    canMove(direction) {
        // We only check if aligned to grid for turning
        const tolerance = 4; // allow sloppy turning
        const isAlignedX = (this.x % 16) < tolerance || (this.x % 16) > 16 - tolerance;
        const isAlignedY = (this.y % 16) < tolerance || (this.y % 16) > 16 - tolerance;

        if (!isAlignedX && direction.x === 0) return false; // Can't turn Y if not aligned X
        if (!isAlignedY && direction.y === 0) return false; // Can't turn X if not aligned Y

        // Basic wall check of the target tile
        // Calculate center point + lookahead
        let nextX = this.x + direction.x * 16;
        let nextY = this.y + direction.y * 16;
        
        // Convert to grid
        let gridX = Math.floor((nextX + 8) / 16);
        let gridY = Math.floor((nextY + 8) / 16);

        if (this.game.board.isWall(gridX, gridY)) return false;
        
        return true;
    }

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
