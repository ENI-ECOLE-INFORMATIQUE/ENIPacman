class Ghost {
    constructor(game, x, y, color) {
        this.game = game;
        this.startX = x * 16;
        this.startY = y * 16;
        this.x = this.startX;
        this.y = this.startY;
        this.color = color;
        this.speed = 1.5; // Base speed, will be modified by difficulty
        this.dir = { x: 0, y: 0 };
        
        // AI State
        this.mode = 'SCATTER'; // SCATTER, CHASE, FRIGHTENED
        this.scatterTarget = { x: 0, y: 0 }; // Corner
        
        // Movement state
        this.isExitingHouse = true; // Use simple logic to leave box first
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.dir = { x: 0, y: 0 };
        this.isExitingHouse = true;
    }

    update(difficultyInfo) {
        // Adjust speed based on difficulty and mode
        let currentSpeed = this.speed * difficultyInfo.speedMultiplier;
        if (this.mode === 'FRIGHTENED') currentSpeed *= 0.6;

        // Move
        if (this.canMove(this.dir)) {
            this.x += this.dir.x * currentSpeed;
            this.y += this.dir.y * currentSpeed;
            
             // Wrap
            if (this.x < -8) this.x = this.game.canvas.width;
            if (this.x > this.game.canvas.width) this.x = -8;
        }

        // Decision making at intersections or if stuck
        if (this.isCentered()) {
            this.makeDecision();
        }
    }

    isCentered() {
        // approximate center of tile
        return Math.abs((this.x % 16) - 0) < 1.5 && Math.abs((this.y % 16) - 0) < 1.5;
    }

    makeDecision() {
        const possibleDirs = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }   // Right
        ];

        // Filter valid moves (not into walls, and usually not reversing direction)
        const validMoves = possibleDirs.filter(d => {
            // Cannot reverse immediately unless dead/frightened (simplified: just don't reverse)
            if (d.x === -this.dir.x && d.y === -this.dir.y && this.dir.x !== 0 && this.dir.y !== 0) return false;
            return this.canMove(d);
        });

        if (validMoves.length === 0) {
            // Dead end (shouldn't happen often in pacman), reverse allowed
            const reverse = { x: -this.dir.x, y: -this.dir.y };
            if (this.canMove(reverse)) this.dir = reverse;
            return;
        }

        // Choose best direction based on target
        let target = this.getTarget();
        
        // Sort valid moves by distance to target
        validMoves.sort((a, b) => {
            const posA = { x: this.x + a.x * 16, y: this.y + a.y * 16 };
            const posB = { x: this.x + b.x * 16, y: this.y + b.y * 16 };
            const distA = this.getDistSq(posA, target);
            const distB = this.getDistSq(posB, target);
            return distA - distB;
        });

        // Pick best
        this.dir = validMoves[0];
    }

    getTarget() {
        if (this.mode === 'SCATTER') {
            return this.scatterTarget;
        } else if (this.mode === 'CHASE') {
            // Basic simplistic chase: target is pacman
            return { x: this.game.pacman.x, y: this.game.pacman.y };
        } else {
            // Frightened: random target (simulated by random large number)
            return { x: Math.random() * 500, y: Math.random() * 500 };
        }
    }

    getDistSq(p1, p2) {
        return (p1.x - p2.x)**2 + (p1.y - p2.y)**2;
    }

    canMove(direction) {
        // Snap for checking
        let startX = Math.round(this.x / 16) * 16;
        let startY = Math.round(this.y / 16) * 16;
        
        let nextX = startX + direction.x * 16;
        let nextY = startY + direction.y * 16;
        
        let gridX = Math.floor((nextX + 8) / 16);
        let gridY = Math.floor((nextY + 8) / 16);

        if (this.game.board.isWall(gridX, gridY)) return false;
        return true;
    }

    draw(ctx) {
        ctx.fillStyle = this.mode === 'FRIGHTENED' ? '#0000FF' : this.color;
        ctx.beginPath();
        const x = this.x + 8;
        const y = this.y + 8;
        
        // Dome
        ctx.arc(x, y - 2, 7, Math.PI, 0);
        ctx.lineTo(x + 7, y + 7);
        // Feet (simplified)
        ctx.lineTo(x - 7, y + 7);
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 3, y - 4, 2, 0, Math.PI * 2);
        ctx.arc(x + 3, y - 4, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x - 3 + this.dir.x, y - 4 + this.dir.y, 1, 0, Math.PI * 2);
        ctx.arc(x + 3 + this.dir.x, y - 4 + this.dir.y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}
