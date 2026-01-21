class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.grid = [];
        this.width = 0;
        this.height = 0;
        this.cellSize = 16; // 16x16 pixels per cell
        this.dotsLeft = 0;
    }

    load(levelData) {
        this.width = levelData.width;
        this.height = levelData.height;
        this.grid = levelData.layout;
        this.countDots();
    }

    countDots() {
        this.dotsLeft = 0;
        for (let row of this.grid) {
            for (let cell of row) {
                if (cell === 0 || cell === 2) {
                    this.dotsLeft++;
                }
            }
        }
    }

    draw() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.drawCell(x, y, this.grid[y][x]);
            }
        }
    }

    drawCell(x, y, type) {
        const posX = x * this.cellSize;
        const posY = y * this.cellSize;
        
        // Clear cell background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(posX, posY, this.cellSize, this.cellSize);

        switch (type) {
            case 1: // Wall
                this.ctx.fillStyle = '#191970';
                this.ctx.fillRect(posX, posY, this.cellSize, this.cellSize);
                // Simple inner border for detail
                this.ctx.strokeStyle = '#0000FF'; // Slightly brighter blue
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(posX + 4, posY + 4, this.cellSize - 8, this.cellSize - 8);
                break;
            case 0: // Dot
                this.ctx.fillStyle = '#FFB8AE'; // Pinkish white
                this.ctx.fillRect(posX + 6, posY + 6, 4, 4);
                break;
            case 2: // Super Dot
                this.ctx.fillStyle = '#FFB8AE';
                this.ctx.beginPath();
                this.ctx.arc(posX + 8, posY + 8, 6, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 3: // Empty (no dot)
            case 4: // Ghost Spawn
            case 5: // Pacman Spawn
                // Draw nothing (black background)
                break;
        }
    }

    // Helpers for collision
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
        return this.grid[y][x] === 1;
    }
}
