// On profile page initialize, fills in the profile with the data from all games and from general data.

async function loadProfile() {
    try {

        // Get the currently logged in user.

        const sessionResponse = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        const user = await sessionResponse.json();

        if (!user || !user.username || user.role === 'guest') {
            window.location.href = 'index.html';
            return;
        }

        const username = user.username;

        // Fetch data from all tables

        const [playerResponse, blackjackResponse, rouletteResponse, slotsResponse] = await Promise.all([
            fetch(`/api/database/data/players/${username}`),
            fetch(`/api/database/data/blackjack/${username}`),
            fetch(`/api/database/data/roulette/${username}`),
            fetch(`/api/database/data/slots/${username}`)
        ]);

        const player = await playerResponse.json();
        const blackjack = await blackjackResponse.json();
        const roulette = await rouletteResponse.json();
        const slots = await slotsResponse.json();

        // Create the profile container

        const container = document.getElementById('profileContainer');
        container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">👤</div>
                <h1>${player.username}</h1>
                <p class="profile-subtitle">Casino Player</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>💰 Total Chips</h3>
                    <div class="value">${formatNumber(player.chips || 0)}</div>
                </div>
                <div class="stat-card">
                    <h3>🎮 Games Played</h3>
                    <div class="value">${calculateTotalGames(blackjack, roulette, slots)}</div>
                </div>
                <div class="stat-card">
                    <h3>🏆 Total Wins</h3>
                    <div class="value">${calculateTotalWins(blackjack, roulette, slots)}</div>
                </div>
                <div class="stat-card">
                    <h3>📊 Win Rate</h3>
                    <div class="value">${calculateWinRate(blackjack, roulette, slots)}%</div>
                </div>
            </div>

            <div class="game-stats">
                <h2>Game Statistics</h2>

                <div class="game-section">
                    <h3>🃏 Blackjack</h3>
                    <div class="game-stats-row">
                        <div class="game-stat-item">
                            <div class="label">Wins</div>
                            <div class="value">${blackjack.wins || 0}</div>
                        </div>
                        <div class="game-stat-item">
                            <div class="label">Losses</div>
                            <div class="value">${blackjack.losses || 0}</div>
                        </div>
                        <div class="game-stat-item">
                            <div class="label">Chips Won</div>
                            <div class="value">${formatNumber(blackjack.chipswon || 0)}</div>
                        </div>
                    </div>
                </div>

                <div class="game-section">
                    <h3>🎯 Roulette</h3>
                    <div class="game-stats-row">
                        <div class="game-stat-item">
                            <div class="label">Wins</div>
                            <div class="value">${roulette.wins || 0}</div>
                        </div>
                        <div class="game-stat-item">
                            <div class="label">Losses</div>
                            <div class="value">${roulette.losses || 0}</div>
                        </div>
                        <div class="game-stat-item">
                            <div class="label">Chips Won</div>
                            <div class="value">${formatNumber(roulette.chipswon || 0)}</div>
                        </div>
                    </div>
                </div>

                <div class="game-section">
                    <h3>🎰 Slots</h3>
                    <div class="game-stats-row">
                        <div class="game-stat-item">
                            <div class="label">Wins</div>
                            <div class="value">${slots.wins || 0}</div>
                        </div>
                        <div class="game-stat-item">
                            <div class="label">Losses</div>
                            <div class="value">${slots.losses || 0}</div>
                        </div>
                        <div class="game-stat-item">
                            <div class="label">Chips Won</div>
                            <div class="value">${formatNumber(slots.chipswon || 0)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <a href="home.html" class="back-btn">← Back to Casino</a>
        `;
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileContainer').innerHTML = `
            <div class="loading">Error loading profile. Please try again.</div>
            <a href="home.html" class="back-btn">← Back to Casino</a>
        `;
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


// Sum wins and loses to get total games played.

function calculateTotalGames(blackjack, roulette, slots) {
    const blackjackGames = (blackjack.wins || 0) + (blackjack.losses || 0);
    const rouletteGames = (roulette.wins || 0) + (roulette.losses || 0);
    const slotsGames = (slots.wins || 0) + (slots.losses || 0);
    return blackjackGames + rouletteGames + slotsGames;
}

// Return total wins by summing wins for each game.

function calculateTotalWins(blackjack, roulette, slots) {
    return (blackjack.wins || 0) + (roulette.wins || 0) + (slots.wins || 0);
}

// Get total W/L ratio by summing game wins and dividing by game losses.

function calculateWinRate(blackjack, roulette, slots) {
    const wins = calculateTotalWins(blackjack, roulette, slots);
    const total = calculateTotalGames(blackjack, roulette, slots);
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
}

document.addEventListener('DOMContentLoaded', loadProfile);