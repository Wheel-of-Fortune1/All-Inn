// blackjack.js: crazy blackjack 
import { getRandomInt } from "../utils/random.js";

class BlackjackGame {
  constructor() {
    this.deck = [];
    this.playerHand = [];
    this.dealerHand = [];
    this.gameActive = false;
  }

  // Create and shuffle the deck 
  createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.deck = [];

    for (let suit of suits) {
      for (let value of values) {
        this.deck.push({ suit, value });
      }
    }
    this.shuffleDeck();
  }

  // Fisher yates shuffle algorithm (this algorithm is from an 8 year old stack overflow post, worth a look)
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = getRandomInt(0, i + 1);
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // Draw a card from the deck
  drawCard() {
    if (this.deck.length === 0) {
      this.createDeck();
    }
    return this.deck.pop();
  }

  // Calculate hand value (Aces count as 1 or 11)
  calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
      if (card.value === 'A') {
        aces++;
        value += 11;
      } else if (['J', 'Q', 'K'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    // Adjust for aces if value exceeds 21
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  // Initialize new game
  startGame(betAmount) {
    this.createDeck();
    this.playerHand = [];
    this.dealerHand = [];
    this.gameActive = true;

// Deal initial cards
    this.playerHand.push(this.drawCard());
    this.dealerHand.push(this.drawCard());
    this.playerHand.push(this.drawCard());
    this.dealerHand.push(this.drawCard());

    const playerValue = this.calculateHandValue(this.playerHand);
    
    return {
      playerHand: this.playerHand,
      dealerHand: [this.dealerHand[0], { hidden: true }], // Hide dealer's second card
      playerValue,
      dealerValue: this.calculateHandValue([this.dealerHand[0]]),
      gameActive: this.gameActive,
      betAmount
    };
  }

  // Player hit
  hit() {
    if (!this.gameActive) {
      return { error: 'Game is not active' };
    }

    const newCard = this.drawCard();
    this.playerHand.push(newCard);
    const playerValue = this.calculateHandValue(this.playerHand);

    // Check for busssst
    if (playerValue > 21) {
      this.gameActive = false;
      return {
        playerHand: this.playerHand,
        playerValue,
        bust: true,
        gameActive: false,
        result: 'dealer_win',
        message: 'Player busts! Dealer wins.'
      };
    }

    return {
      playerHand: this.playerHand,
      playerValue,
      gameActive: true
    };
  }

  // Player stands: so dealer turn
  stand() {
    if (!this.gameActive) {
      return { error: 'Game is not active' };
    }

    this.gameActive = false;
    let dealerValue = this.calculateHandValue(this.dealerHand);

    // Dealer draws until 17 or higher
    while (dealerValue < 17) {
      this.dealerHand.push(this.drawCard());
      dealerValue = this.calculateHandValue(this.dealerHand);
    }

    const playerValue = this.calculateHandValue(this.playerHand);

    // Determine vic royale
    let result, message, payout = 0;

    if (dealerValue > 21) {
      result = 'player_win';
      message = 'Dealer busts! You win!';
      payout = 2; // 1:1 payout (returns bet + winnings)
    } else if (playerValue > dealerValue) {
      result = 'player_win';
      message = 'You win!';
      payout = 2;
    } else if (dealerValue > playerValue) {
      result = 'dealer_win';
      message = 'Dealer wins!';
      payout = 0;
    } else {
      result = 'push';
      message = 'Push! It\'s a tie.';
      payout = 1; // Return bet
    }

    return {
      playerHand: this.playerHand,
      dealerHand: this.dealerHand,
      playerValue,
      dealerValue,
      result,
      message,
      payout,
      gameActive: false
    };
  }

  // get current game state
  getGameState() {
    return {
      playerHand: this.playerHand,
      dealerHand: this.gameActive 
        ? [this.dealerHand[0], { hidden: true }]
        : this.dealerHand,
      playerValue: this.calculateHandValue(this.playerHand),
      dealerValue: this.gameActive 
        ? this.calculateHandValue([this.dealerHand[0]])
        : this.calculateHandValue(this.dealerHand),
      gameActive: this.gameActive
    };
  }
}

// Export for use in Node.js backend
export default BlackjackGame;