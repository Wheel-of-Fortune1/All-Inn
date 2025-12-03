document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sortContainer = document.querySelector('.sort-container');
    const leaderboardList = document.getElementById('leaderboardList');
    const scoreLabel = document.getElementById('scoreLabel');

    let currentCategory = 'players';
    let currentSort = 'chips';
    let currentUsername = null;

    // Get current logged-in user
    async function getCurrentUser() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            const user = await response.json();
            if (user && user.username && user.role !== 'guest') {
                currentUsername = user.username;
            }
        } catch (error) {
            console.error('Error getting current user:', error);
        }
    }

    (async function () {
        await getCurrentUser();
        updateSortButtons();
        loadLeaderboard();
    })();


    const sortOptions = {
        players: [
            { value: 'chips', label: 'Chips' }
        ],
        blackjack: [
            { value: 'wins', label: 'Wins' },
            { value: 'losses', label: 'Losses' },
            { value: 'chipswon', label: 'Chips Won' }
        ],
        roulette: [
            { value: 'wins', label: 'Wins' },
            { value: 'losses', label: 'Losses' },
            { value: 'chipswon', label: 'Chips Won' }
        ],
        slots: [
            { value: 'wins', label: 'Wins' },
            { value: 'losses', label: 'Losses' },
            { value: 'chipswon', label: 'Chips Won' }
        ]
    };

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            tabButtons.forEach(b => b.classList.remove('active'));

            this.classList.add('active');

            currentCategory = this.dataset.category;

            updateSortButtons();
            loadLeaderboard();
        });
    });

    function updateSortButtons() {
        const options = sortOptions[currentCategory];

        const existingButtons = sortContainer.querySelectorAll('.sort-btn');
        existingButtons.forEach(btn => btn.remove());

        currentSort = options[0].value;

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'sort-btn';
            btn.dataset.sort = option.value;
            btn.textContent = option.label;

            if (option.value === currentSort) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', function () {
               
                sortContainer.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));

                this.classList.add('active');

                currentSort = this.dataset.sort;

                scoreLabel.textContent = option.label;

                loadLeaderboard();
            });

            sortContainer.appendChild(btn);
        });

        scoreLabel.textContent = options[0].label;
    }

    updateSortButtons();

    loadLeaderboard();

    async function loadLeaderboard() {
        leaderboardList.innerHTML = '<div class="loading">Loading leaderboard...</div>';

        try {
            console.log("Loading leaderboard:", currentCategory, currentSort);

            const response = await fetch(`/api/database/lb/${currentCategory}/${currentSort}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                leaderboardList.innerHTML = '<div class="loading">No players yet. Be the first!</div>';
                return;
            }

            displayLeaderboard(data);

        } catch (error) {
            console.error('Error loading leaderboard:', error);
            leaderboardList.innerHTML = '<div class="error">Failed to load leaderboard. Please try again.</div>';
        }
    }

    function displayLeaderboard(players) {
        leaderboardList.innerHTML = '';

        players.forEach((player, index) => {
            const rank = index + 1;
            const item = document.createElement('div');
            item.className = 'leaderboard-item';

            // Check if this is the current logged-in player
            const isCurrentPlayer = currentUsername && player.username === currentUsername;

            // Add special styling for top 3
            if (rank === 1) {
                item.classList.add('top-1');
            } else if (rank === 2) {
                item.classList.add('top-2');
            } else if (rank === 3) {
                item.classList.add('top-3');
            }

            // Highlight current player (overrides top 3 styling if needed)
            if (isCurrentPlayer) {
                item.classList.add('current-player');
            }

            // Add medal emoji for top 3
            let medal = '';
            if (rank === 1) medal = '🥇 ';
            else if (rank === 2) medal = '🥈 ';
            else if (rank === 3) medal = '🥉 ';

    
            const youIndicator = isCurrentPlayer ? ' <span style="color: #6366f1; font-weight: 700;">(YOU)</span>' : '';

            item.innerHTML = `
            <div class="rank">${medal}${rank}</div>
            <div class="username">${escapeHtml(player.username)}${youIndicator}</div>
            <div class="score">${formatScore(player.score)}</div>
        `;

            leaderboardList.appendChild(item);
        });
    }

    function formatScore(score) {
        // Format numbers with commas
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function escapeHtml(text) {
        // Prevent XSS by escaping HTML
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});