// slots.js Slot Machine Game Logic, this was partially based on the Bro Code video "Let's code a beginners Python SLOT MACHINE"

class SlotsGame {
  constructor() {
    // Define slot symbols and their weights (for probability)
    this.symbols = [
      { name: 'cherry', icon: '🍒', weight: 30 },
      { name: 'lemon', icon: '🍋', weight: 25 },
      { name: 'orange', icon: '🍊', weight: 20 },
      { name: 'grape', icon: '🍇', weight: 15 },
      { name: 'star', icon: '⭐', weight: 7 },
      { name: 'seven', icon: '7️⃣', weight: 3 }
    ];

    // Payout multipliers
    this.payouts = {
      threeMatch: {
        cherry: 5,
        lemon: 8,
        orange: 10,
        grape: 15,
        star: 25,
        seven: 50
      },
      twoMatch: {
        cherry: 2,
        lemon: 2,
        orange: 3,
        grape: 4,
        star: 6,
        seven: 10
      }
    };

    // Create weighted symbol pool for realistic slot machine probabilities
    this.symbolPool = this.createSymbolPool();
  }

  // Create weighted symbol pool based on weights
  createSymbolPool() {
    const pool = [];
    for (let symbol of this.symbols) {
      for (let i = 0; i < symbol.weight; i++) {
        pool.push(symbol);
      }
    }
    return pool;
  }

  // Generate random symbol from weighted pool
  getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * this.symbolPool.length);
    return this.symbolPool[randomIndex];
  }

  // Spin the reels (generate 3 symbols)
  spin() {
    const reel1 = this.getRandomSymbol();
    const reel2 = this.getRandomSymbol();
    const reel3 = this.getRandomSymbol();

    return [reel1, reel2, reel3];
  }

  // Check for matching patterns
  checkWin(reels) {
    const symbols = reels.map(reel => reel.name);
    
    // Check for three matching symbols
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      return {
        type: 'threeMatch',
        symbol: symbols[0],
        count: 3
      };
    }

    // Check for two matching symbols
    if (symbols[0] === symbols[1] || symbols[1] === symbols[2] || symbols[0] === symbols[2]) {
      const matchingSymbol = symbols[0] === symbols[1] 
        ? symbols[0] 
        : symbols[1] === symbols[2] 
          ? symbols[1] 
          : symbols[0];
      
      return {
        type: 'twoMatch',
        symbol: matchingSymbol,
        count: 2
      };
    }

    // No match
    return {
      type: 'noMatch',
      symbol: null,
      count: 0
    };
  }

  // Calculate payout based on match type
  calculatePayout(matchResult, betAmount) {
    if (matchResult.type === 'noMatch') {
      return 0;
    }

    const multiplier = this.payouts[matchResult.type][matchResult.symbol];
    return betAmount * multiplier;
  }

  // Play a round
  play(betAmount) {
    // Validate bet amount
    if (betAmount <= 0) {
      return { error: 'Bet amount must be positive' };
    }

    // Spin the reels
    const reels = this.spin();

    // Check for win
    const matchResult = this.checkWin(reels);

    // Calculate payout
    const payout = this.calculatePayout(matchResult, betAmount);

    // Calculate net result (payout - bet)
    const netResult = payout - betAmount;

    // Determine result message
    let message;
    if (matchResult.type === 'threeMatch') {
      message = `🎉 JACKPOT! Three ${matchResult.symbol}s! You won ${payout} chips!`;
    } else if (matchResult.type === 'twoMatch') {
      message = `🎊 Two ${matchResult.symbol}s! You won ${payout} chips!`;
    } else {
      message = `😔 No match. You lost ${betAmount} chips.`;
    }

    return {
      reels: reels.map(reel => ({
        name: reel.name,
        icon: reel.icon
      })),
      matchResult: {
        type: matchResult.type,
        symbol: matchResult.symbol,
        count: matchResult.count
      },
      betAmount,
      payout,
      netResult,
      message,
      isWin: payout > 0
    };
  }

  // Get paytable information
  getPaytable() {
    return {
      symbols: this.symbols.map(s => ({
        name: s.name,
        icon: s.icon
      })),
      payouts: {
        threeMatch: Object.entries(this.payouts.threeMatch).map(([symbol, mult]) => ({
          symbol,
          multiplier: mult,
          description: `Three ${symbol}s: ${mult}x bet`
        })),
        twoMatch: Object.entries(this.payouts.twoMatch).map(([symbol, mult]) => ({
          symbol,
          multiplier: mult,
          description: `Two ${symbol}s: ${mult}x bet`
        }))
      }
    };
  }

  // Get symbol probabilities (for transparency)
  getSymbolProbabilities() {
    const totalWeight = this.symbols.reduce((sum, s) => sum + s.weight, 0);
    
    return this.symbols.map(symbol => ({
      name: symbol.name,
      icon: symbol.icon,
      probability: ((symbol.weight / totalWeight) * 100).toFixed(2) + '%',
      weight: symbol.weight
    }));
  }

  // Simulate multiple spins (for testing/statistics)
  simulate(spins = 1000) {
    const results = {
      totalSpins: spins,
      wins: 0,
      losses: 0,
      threeMatches: 0,
      twoMatches: 0,
      symbolFrequency: {}
    };

    // Initialize symbol frequency counter
    this.symbols.forEach(s => {
      results.symbolFrequency[s.name] = 0;
    });

    for (let i = 0; i < spins; i++) {
      const reels = this.spin();
      const matchResult = this.checkWin(reels);

      // Count symbols
      reels.forEach(reel => {
        results.symbolFrequency[reel.name]++;
      });

      // Count results
      if (matchResult.type === 'threeMatch') {
        results.threeMatches++;
        results.wins++;
      } else if (matchResult.type === 'twoMatch') {
        results.twoMatches++;
        results.wins++;
      } else {
        results.losses++;
      }
    }

    // Calculate percentages
    results.winRate = ((results.wins / spins) * 100).toFixed(2) + '%';
    results.lossRate = ((results.losses / spins) * 100).toFixed(2) + '%';

    return results;
  }
}

// Export for use in Node.js backend
module.exports = SlotsGame;