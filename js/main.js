// Main Entry Point
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const menuOverlay = document.getElementById('menu-overlay');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const highScoreList = document.getElementById('high-score-list');

    // Leaderboard Open
    leaderboardBtn.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        leaderboardOverlay.classList.remove('hidden');
        
        // Populate
        const scores = Storage.getGlobalHighScores();
        highScoreList.innerHTML = '';
        if (scores.length === 0) {
            highScoreList.innerHTML = '<li>Aucun score enregistré</li>';
        } else {
            scores.forEach((s, index) => {
                const li = document.createElement('li');
                li.innerText = `${index + 1}. ${s.name} - ${s.score}`;
                highScoreList.appendChild(li);
            });
        }
    });

    // Leaderboard Close
    closeLeaderboardBtn.addEventListener('click', () => {
        leaderboardOverlay.classList.add('hidden');
        menuOverlay.style.display = 'flex';
    });

    // Restart logic (from Game Over)
    const restartBtn = document.getElementById('restart-btn');
    const menuReturnBtn = document.getElementById('menu-btn');
    
    if(restartBtn) {
        restartBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
    if(menuReturnBtn) {
       menuReturnBtn.addEventListener('click', () => {
            window.location.reload();
       });
    }

    const homeBtn = document.getElementById('home-btn');
    if(homeBtn) {
        homeBtn.addEventListener('click', () => {
            if(confirm("Retourner au menu principal ? La partie sera perdue.")) {
                window.location.reload();
            }
        });
    }

    startBtn.addEventListener('click', () => {
        const playerName = document.getElementById('player-name').value || "Player";
        // Hide menu
        menuOverlay.style.display = 'none';
        
        // Start Game
        const game = new Game('game-canvas');
        game.start('levels/default.json');
    });
});
