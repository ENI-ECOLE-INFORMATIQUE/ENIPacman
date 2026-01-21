const Storage = {
    saveScore: (score, name, levelName, difficulty) => {
        // Global Scores (simulated as shared local storage for this demo)
        let globalScores = JSON.parse(localStorage.getItem('pacman_global_scores')) || [];
        globalScores.push({ name, score, level: levelName, difficulty: difficulty, date: new Date().toISOString() });
        globalScores.sort((a, b) => b.score - a.score);
        globalScores = globalScores.slice(0, 10);
        localStorage.setItem('pacman_global_scores', JSON.stringify(globalScores));

        // Personal Scores
        let personalScores = JSON.parse(localStorage.getItem(`pacman_scores_${name}`)) || [];
        personalScores.push({ score, level: levelName, difficulty: difficulty, date: new Date().toISOString() });
        personalScores.sort((a, b) => b.score - a.score);
        personalScores = personalScores.slice(0, 10);
        localStorage.setItem(`pacman_scores_${name}`, JSON.stringify(personalScores));
    },

    getGlobalHighScores: () => {
        return JSON.parse(localStorage.getItem('pacman_global_scores')) || [];
    },

    getHighestScore: () => {
        const scores = JSON.parse(localStorage.getItem('pacman_global_scores')) || [];
        return scores.length > 0 ? scores[0].score : 0;
    },

    // Level Management
    saveLevel: (name, data) => {
        let levels = JSON.parse(localStorage.getItem('pacman_custom_levels')) || {};
        levels[name] = data;
        localStorage.setItem('pacman_custom_levels', JSON.stringify(levels));
        alert(`Niveau "${name}" sauvegardé !`);
    },

    getLevels: () => {
        const levels = JSON.parse(localStorage.getItem('pacman_custom_levels')) || {};
        return Object.keys(levels);
    },

    getLevel: (name) => {
        const levels = JSON.parse(localStorage.getItem('pacman_custom_levels')) || {};
        return levels[name];
    }
};

// Auto-update high score display on load
document.addEventListener('DOMContentLoaded', () => {
    const highScoreEl = document.getElementById('high-score');
    if (highScoreEl) {
        highScoreEl.innerText = Storage.getHighestScore();
    }
});
