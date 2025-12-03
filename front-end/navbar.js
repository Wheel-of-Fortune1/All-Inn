// Used in most pages where the user is logged in, displays their chips, the profile and logout button, and the home button.
class CasinoNavbar {
    constructor() {
        this.username = null;
        this.chips = 0;
        console.log('CasinoNavbar constructor called');
        this.init();
    }

    async init() {
        console.log('CasinoNavbar init started');
        await this.loadUserData();
        console.log('User data loaded:', { username: this.username, chips: this.chips });
        this.render();
        console.log('Navbar rendered');
        this.startChipUpdater();
    }

    async loadUserData() {
        try {

            // Get current user from session 

            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            const user = await response.json();

            if (user && user.username && user.role !== 'guest') {
                this.username = user.username;

                // Fetch user's chip balance from backend

                const playerResponse = await fetch(`/api/database/data/players/${this.username}`);
                const data = await playerResponse.json();
                this.chips = data.chips || 0;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Display the navigation bar

    render() {

        // Check if navbar already exists

        if (document.querySelector('.casino-navbar')) {
            return;
        }

        // Create navbar HTML

        const navbar = document.createElement('nav');
        navbar.className = 'casino-navbar';
        navbar.innerHTML = `
            <a href="home.html" class="navbar-logo">
                🎰 All-Inn Casino
            </a>
            
            <div class="navbar-center">
                ${this.username ? `
                    <div class="chip-display">
                        💰 <span id="navbar-chips">${this.formatChips(this.chips)}</span>
                    </div>
                    <span class="navbar-username">👤 ${this.username}</span>
                ` : ''}
            </div>
            
            <div class="navbar-right">
                ${this.username ? `
                    <a href="profile.html" class="navbar-btn">📊 Profile</a>
                    <button id="logout-btn" class="navbar-btn">🚪 Logout</button>
                ` : `
                    <a href="index.html" class="navbar-btn">🔐 Login</a>
                `}
            </div>
        `;

        // Insert at the beginning of body

        if (document.body.firstChild) {
            document.body.insertBefore(navbar, document.body.firstChild);
        } else {
            document.body.appendChild(navbar);
        }

        // Calls the logout method when players click the logout button.

        if (this.username) {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        }
    }

    // Formats comma number values

    formatChips(amount) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    async updateChips() {
        if (!this.username) return;

        try {
            const response = await fetch(`/api/database/data/players/${this.username}`);
            const data = await response.json();
            this.chips = data.chips || 0;

            const chipsDisplay = document.getElementById('navbar-chips');
            if (chipsDisplay) {
                chipsDisplay.textContent = this.formatChips(this.chips);
            }
        } catch (error) {
            console.error('Error updating chips:', error);
        }
    }

    // Update chips every 5 seconds

    startChipUpdater() {
        setInterval(() => this.updateChips(), 5000);
    }

    // User can logout by calling the server side logout method.

    logout() {
        fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            window.location.href = 'index.html';
        }).catch(() => {
            window.location.href = 'index.html';
        });
    }

}

// Initialize navbar when DOM is loaded

document.addEventListener('DOMContentLoaded', () => {
    window.casinoNavbar = new CasinoNavbar();
});