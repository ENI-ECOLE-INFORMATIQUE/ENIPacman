document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    const palette = document.getElementById('palette');
    const jsonOutput = document.getElementById('json-output');
    const fileInput = document.getElementById('file-input');
    
    // Default Grid (Standard Size)
    // 28 tiles wide x 31 tiles high
    const width = 28;
    const height = 31;
    const cellSize = 16;

    // Initialize Empty Grid
    let grid = Array(height).fill().map(() => Array(width).fill(1)); // Fill with walls by default

    // Selection state
    let currentTool = 1;
    let isDrawing = false;

    // Palette Click
    palette.addEventListener('click', (e) => {
        const tool = e.target.closest('.tool');
        if (!tool) return;
        
        document.querySelectorAll('.tool').forEach(t => t.classList.remove('selected'));
        tool.classList.add('selected');
        currentTool = parseInt(tool.dataset.type);
    });

    // Canvas Interaction
    function getTilePos(e) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        return { x, y };
    }

    function paint(e) {
        const { x, y } = getTilePos(e);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            grid[y][x] = currentTool;
            draw();
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        paint(e);
    });
    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) paint(e);
    });
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);

    // Draw Function (Mirroring Board.js logic roughly)
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                drawCell(x, y, grid[y][x]);
            }
        }
    }

    function drawCell(x, y, type) {
        const posX = x * cellSize;
        const posY = y * cellSize;

        // Background
        ctx.fillStyle = '#000';
        ctx.fillRect(posX, posY, cellSize, cellSize);

        // Grid lines for editor (subtle)
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(posX, posY, cellSize, cellSize);

        switch (type) {
            case 1: // Wall
                ctx.fillStyle = '#191970';
                ctx.fillRect(posX, posY, cellSize, cellSize);
                ctx.strokeStyle = '#0000FF';
                ctx.lineWidth = 1;
                ctx.strokeRect(posX + 4, posY + 4, cellSize - 8, cellSize - 8);
                break;
            case 0: // Dot
                ctx.fillStyle = '#FFB8AE';
                ctx.fillRect(posX + 6, posY + 6, 4, 4);
                break;
            case 2: // Super Dot
                ctx.fillStyle = '#FFB8AE';
                ctx.beginPath();
                ctx.arc(posX + 8, posY + 8, 6, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 4: // Ghost
                ctx.fillStyle = 'red';
                ctx.fillText('F', posX + 4, posY + 12);
                break;
            case 5: // Pacman
                ctx.fillStyle = 'yellow';
                ctx.fillText('P', posX + 4, posY + 12);
                break;
        }
    }

    // Export
    document.getElementById('export-btn').addEventListener('click', () => {
        const data = {
            width: width,
            height: height,
            layout: grid
        };
        const json = JSON.stringify(data, null, 2);
        jsonOutput.value = json;
        
        // Trigger download
        const blob = new Blob([json], {type: "application/json"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "level.json";
        link.click();
    });

    // Import
    document.getElementById('import-btn').addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.layout && data.width && data.height) {
                    grid = data.layout;
                    draw();
                    jsonOutput.value = "Niveau chargé avec succès !";
                } else {
                    alert("Format JSON invalide !");
                }
            } catch (err) {
                alert("Erreur de parsing JSON");
            }
        };
        reader.readAsText(file);
    });

    // Initial Draw
    draw();
});
