// roulette.js Roulette Game ferda

// Gets random function made in random.js

import { getRandomInt } from "../utils/random.js";


class RouletteGame {
  constructor() {
    // Define roulette wheel numbers and colors
    this.redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    this.blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    this.greenNumbers = [0];
    
    // Bet types and their payout multipliers
    this.betTypes = {
      number: 35,      // Single number (0-36)
      red: 1,        // Red color
      black: 1,        // Black color
      even: 1,      // Even numbers
      odd: 1,      // Odd numbers
      low: 1,         // 1-18
      high: 1,         // 19-36
      dozen1: 2,     // 1-12
      dozen2: 2,       // 13-24
      dozen3: 2,       // 25-36
      column1: 2,       // 1, 4, 7, 10...34
      column2: 2,       // 2, 5, 8, 11...35
      column3: 2        // 3, 6, 9, 12...36
    };
  }

  // Get the color of a number
  getColor(number) {
    if (this.redNumbers.includes(number)) return 'red';
    if (this.blackNumbers.includes(number)) return 'black';
    return 'green';
  }

  // Spin the wheel and generate result
  spin() {
    const result = getRandomInt(0,37); // 0-36
    const color = this.getColor(result);
    
    return {
      number: result,
      color,
      isEven: result !== 0 && result % 2 === 0,
      isOdd: result !== 0 && result % 2 !== 0
    };
  }

  // Check if a bet wins
  checkBet(betType, betValue, spinResult) {
    const { number, color, isEven, isOdd } = spinResult;

    switch (betType) {
      case 'number':
        return number === betValue;
      
      case 'red':
        return color === 'red';
      
      case 'black':
        return color === 'black';
      
      case 'even':
        return isEven;
      
      case 'odd':
        return isOdd;
      
      case 'low':
        return number >= 1 && number <= 18;
      
      case 'high':
        return number >= 19 && number <= 36;
      
      case 'dozen1':
        return number >= 1 && number <= 12;
      
      case 'dozen2':
        return number >= 13 && number <= 24;
      
      case 'dozen3':
        return number >= 25 && number <= 36;
      
      case 'column1':
        return number > 0 && number % 3 === 1;
      
      case 'column2':
        return number > 0 && number % 3 === 2;
      
      case 'column3':
        return number > 0 && number % 3 === 0;
      
      default:
        return false;
    }
  }

  // Calculate payout based on bet type
  calculatePayout(betType, betAmount) {
    const multiplier = this.betTypes[betType] || 0;
    return betAmount * multiplier + betAmount; // Winnings + original bet returned
  }

  // Place bet and play round
  placeBet(bets) {
    // Validate bets format: [{ type, value, amount }, ...]
    if (!Array.isArray(bets) || bets.length === 0) {
      return { error: 'Invalid bet format' };
    }

    // Calculate total bet amount
    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);

    // Spin the wheel
    const spinResult = this.spin();

    // Check each bet and calculate winnings
    let totalWinnings = 0;
    const betResults = bets.map(bet => {
      const won = this.checkBet(bet.type, bet.value, spinResult);
      const payout = won ? this.calculatePayout(bet.type, bet.amount) : 0;
      totalWinnings += payout;

      return {
        betType: bet.type,
        betValue: bet.value,
        betAmount: bet.amount,
        won,
        payout
      };
    });

    // Calculate net result (winnings - total bet)
    const netResult = totalWinnings - totalBet;

    return {
      spinResult: {
        number: spinResult.number,
        color: spinResult.color
      },
      betResults,
      totalBet,
      totalWinnings,
      netResult,
      message: netResult > 0 
        ? `You won ${totalWinnings} chips!` 
        : netResult === 0 
          ? 'Break even!'
          : `You lost ${totalBet} chips.`
    };
  }

  // Quick play: single bet 
  //this is for when players dont choose different combinations fo nu,bers/ colors. 
  quickPlay(betType, betValue, betAmount) {
    const bet = { type: betType, value: betValue, amount: betAmount };
    return this.placeBet([bet]);
  }

  // Get available bet types info
  getBetTypes() {
    return {
      betTypes: Object.keys(this.betTypes).map(type => ({
        type,
        payout: `${this.betTypes[type]}:1`,
        multiplier: this.betTypes[type]
      })),
      wheelNumbers: {
        red: this.redNumbers,
        black: this.blackNumbers,
        green: this.greenNumbers
      }
    };
  }

  // Validate bet before placing
  validateBet(betType, betValue, betAmount) {
    // Check bet type exists
    if (!this.betTypes[betType]) {
      return { valid: false, error: 'Invalid bet type' };
    }

    // Check bet amount is positive
    if (betAmount <= 0) {
      return { valid: false, error: 'Bet amount must be positive' };
    }

    // Validate bet value for number bets
    if (betType === 'number' && (betValue < 0 || betValue > 36)) {
      return { valid: false, error: 'Number must be between 0 and 36' };
    }

    return { valid: true };
  }
}

// Export for use in Node.js backend
export default RouletteGame;