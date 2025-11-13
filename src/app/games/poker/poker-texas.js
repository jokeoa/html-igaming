// jQuery Toast Notification Function
function showToast(title, message, type) {
  if (typeof $ === 'undefined') {
    console.log(`Toast: ${title} - ${message}`);
    return;
  }

  const $toast = $('#toastNotification');
  const $title = $('#toastTitle');
  const $message = $('#toastMessage');

  // Remove all type classes
  $toast.removeClass('toast-win toast-lose toast-start toast-push hiding');

  // Add appropriate class based on type
  $toast.addClass('toast-' + type);

  // Set content
  $title.text(title);
  $message.text(message);

  // Show toast
  $toast.fadeIn(300);

  // Auto hide after 3 seconds
  setTimeout(() => {
    $toast.addClass('hiding');
    setTimeout(() => {
      $toast.fadeOut(300, () => {
        $toast.removeClass('hiding');
      });
    }, 300);
  }, 3000);
}

// Close toast on button click
$(document).ready(function() {
  $('#toastClose').on('click', function() {
    const $toast = $('#toastNotification');
    $toast.addClass('hiding');
    setTimeout(() => {
      $toast.fadeOut(300, () => {
        $toast.removeClass('hiding');
      });
    }, 300);
  });
});

// Poker Game Variables
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const rankValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

let deck = [];
let playerHand = [];
let dealerHand = [];
let communityCards = [];
let pot = 0;
let currentBet = 0;
let playerBet = 0;
let dealerBet = 0;
let gameStage = 'bet'; // bet, preflop, flop, turn, river, showdown
let smallBlind = 10;
let bigBlind = 20;

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
  if (typeof BalanceManager !== 'undefined') {
    BalanceManager.updateBalanceDisplay();
    updateBalanceDisplays();
  }

  // Quick bet buttons
  document.querySelectorAll('.bet-quick-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const amount = parseFloat(this.getAttribute('data-amount'));
      const betInput = document.getElementById('betAmount');
      if (betInput) betInput.value = amount;
    });
  });

  // Place bet button
  const placeBetBtn = document.getElementById('placeBetBtn');
  if (placeBetBtn) {
    placeBetBtn.addEventListener('click', startGame);
  }

  // Game action buttons
  const checkBtn = document.getElementById('checkBtn');
  const callBtn = document.getElementById('callBtn');
  const raiseBtn = document.getElementById('raiseBtn');
  const foldBtn = document.getElementById('foldBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');

  if (checkBtn) checkBtn.addEventListener('click', handleCheck);
  if (callBtn) callBtn.addEventListener('click', handleCall);
  if (raiseBtn) raiseBtn.addEventListener('click', handleRaise);
  if (foldBtn) foldBtn.addEventListener('click', handleFold);
  if (playAgainBtn) playAgainBtn.addEventListener('click', resetGame);
});

// Update balance displays
function updateBalanceDisplays() {
  if (typeof BalanceManager === 'undefined') return;

  const balance = BalanceManager.getBalance() || 0;
  const balanceFormatted = '$' + balance.toFixed(2);

  BalanceManager.updateBalanceDisplay();

  const userBalanceEl = document.getElementById('userBalance');
  if (userBalanceEl) {
    userBalanceEl.textContent = balanceFormatted;
  }

  const navBalance = document.getElementById('userBalanceNav');
  if (navBalance) {
    navBalance.textContent = balanceFormatted;
  }

  if (typeof $ !== 'undefined') {
    $('.user-balance, #userBalance').text(balanceFormatted);
  }
}

// Update pot display
function updatePotDisplay() {
  const potEl = document.getElementById('potAmount');
  if (potEl) {
    potEl.textContent = '$' + pot.toFixed(0);
  }
}

// Create and shuffle deck
function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Deal a card
function dealCard() {
  return deck.pop();
}

// Render card
function renderCard(card, hidden = false) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card-item';

  if (hidden) {
    cardDiv.classList.add('card-back');
    cardDiv.innerHTML = `
      <div class="card-inner">
        <div class="card-pattern"></div>
      </div>
    `;
  } else {
    const isRed = card.suit === '♥' || card.suit === '♦';
    cardDiv.classList.add(isRed ? 'card-red' : 'card-black');
    cardDiv.innerHTML = `
      <div class="card-corner-top">${card.rank}${card.suit}</div>
      <div class="card-center">${card.suit}</div>
      <div class="card-corner-bottom">${card.rank}${card.suit}</div>
    `;
  }

  return cardDiv;
}

// Display cards
function displayCards() {
  // Player cards
  const playerCardsEl = document.getElementById('playerCards');
  if (playerCardsEl) {
    playerCardsEl.innerHTML = '';
    playerHand.forEach(card => {
      playerCardsEl.appendChild(renderCard(card, false));
    });
  }

  // Dealer cards
  const dealerCardsEl = document.getElementById('dealerCards');
  if (dealerCardsEl) {
    dealerCardsEl.innerHTML = '';
    dealerHand.forEach((card, index) => {
      const hidden = gameStage !== 'showdown';
      dealerCardsEl.appendChild(renderCard(card, hidden));
    });
  }

  // Community cards
  const communityCardsEl = document.getElementById('communityCards');
  if (communityCardsEl) {
    communityCardsEl.innerHTML = '';
    communityCards.forEach(card => {
      communityCardsEl.appendChild(renderCard(card, false));
    });
  }
}

// Start game
function startGame() {
  const betInput = document.getElementById('betAmount');
  const betAmount = parseFloat(betInput.value) || bigBlind;

  if (betAmount < bigBlind) {
    showToast('Invalid Bet', `Minimum bet is $${bigBlind}`, 'lose');
    return;
  }

  if (typeof BalanceManager === 'undefined') {
    alert('Balance system not loaded. Please refresh the page.');
    return;
  }

  if (!BalanceManager.canAfford(betAmount)) {
    showToast('Insufficient Balance', 'Please deposit more funds to play.', 'lose');
    return;
  }

  // Deduct bet
  BalanceManager.subtractBalance(betAmount);
  updateBalanceDisplays();

  // Initialize game
  pot = betAmount;
  playerBet = betAmount;
  dealerBet = bigBlind;
  pot += dealerBet;
  currentBet = betAmount;

  createDeck();
  playerHand = [dealCard(), dealCard()];
  dealerHand = [dealCard(), dealCard()];
  communityCards = [];

  gameStage = 'preflop';

  updatePotDisplay();
  displayCards();
  updateGameStage();

  // Switch UI
  document.getElementById('betStage').classList.add('d-none');
  document.getElementById('gameStage').classList.remove('d-none');

  showToast('Game Started!', 'Pre-flop: Check your cards', 'start');
}

// Update game stage text
function updateGameStage() {
  const stageText = document.getElementById('gameStageText');
  const stageDesc = document.getElementById('gameStageDescription');

  const stages = {
    'preflop': ['Pre-Flop', 'Check your hole cards'],
    'flop': ['Flop', '3 community cards revealed'],
    'turn': ['Turn', '4th community card revealed'],
    'river': ['River', '5th and final community card revealed'],
    'showdown': ['Showdown', 'Best hand wins!']
  };

  if (stages[gameStage]) {
    if (stageText) stageText.textContent = stages[gameStage][0];
    if (stageDesc) stageDesc.textContent = stages[gameStage][1];
  }

  // Update call button
  const callBtn = document.getElementById('callBtn');
  const callAmount = document.getElementById('callAmount');
  if (currentBet > playerBet) {
    const toCall = currentBet - playerBet;
    if (callAmount) callAmount.textContent = '$' + toCall.toFixed(0);
    if (callBtn) callBtn.style.display = 'inline-block';
  } else {
    if (callBtn) callBtn.style.display = 'none';
  }

  // Show/hide check button
  const checkBtn = document.getElementById('checkBtn');
  if (checkBtn) {
    checkBtn.style.display = (currentBet === playerBet) ? 'inline-block' : 'none';
  }
}

// Handle check
function handleCheck() {
  if (currentBet !== playerBet) {
    showToast('Cannot Check', 'You must call or fold', 'lose');
    return;
  }

  // Dealer action (simplified AI)
  dealerAction();
  advanceStage();
}

// Handle call
function handleCall() {
  const toCall = currentBet - playerBet;

  if (toCall <= 0) {
    handleCheck();
    return;
  }

  if (typeof BalanceManager === 'undefined') return;

  if (!BalanceManager.canAfford(toCall)) {
    showToast('Insufficient Balance', 'Not enough funds to call', 'lose');
    return;
  }

  BalanceManager.subtractBalance(toCall);
  playerBet += toCall;
  pot += toCall;

  updateBalanceDisplays();
  updatePotDisplay();

  showToast('Called', `You called $${toCall.toFixed(0)}`, 'start');

  dealerAction();
  advanceStage();
}

// Handle raise
function handleRaise() {
  const raiseAmount = bigBlind * 2;
  const totalToAdd = (currentBet - playerBet) + raiseAmount;

  if (typeof BalanceManager === 'undefined') return;

  if (!BalanceManager.canAfford(totalToAdd)) {
    showToast('Insufficient Balance', 'Not enough funds to raise', 'lose');
    return;
  }

  BalanceManager.subtractBalance(totalToAdd);
  playerBet += totalToAdd;
  currentBet = playerBet;
  pot += totalToAdd;

  updateBalanceDisplays();
  updatePotDisplay();

  showToast('Raised', `You raised $${raiseAmount.toFixed(0)}`, 'start');

  // Dealer decides to call or fold
  if (Math.random() > 0.3) {
    // Dealer calls
    const dealerToCall = currentBet - dealerBet;
    dealerBet += dealerToCall;
    pot += dealerToCall;
    updatePotDisplay();
    advanceStage();
  } else {
    // Dealer folds
    endGame('win', 'Dealer folded!');
  }
}

// Handle fold
function handleFold() {
  endGame('lose', 'You folded');
}

// Dealer action (simplified AI)
function dealerAction() {
  if (currentBet > dealerBet) {
    // Dealer decides whether to call
    if (Math.random() > 0.4) {
      const toCall = currentBet - dealerBet;
      dealerBet += toCall;
      pot += toCall;
      updatePotDisplay();
    } else {
      endGame('win', 'Dealer folded!');
      return false;
    }
  } else {
    // Dealer decides whether to raise
    if (Math.random() > 0.7) {
      const raiseAmount = bigBlind;
      dealerBet += raiseAmount;
      currentBet = dealerBet;
      pot += raiseAmount;
      updatePotDisplay();
      updateGameStage();
      showToast('Dealer Raised', `Dealer raised $${raiseAmount}`, 'push');
    }
  }
  return true;
}

// Advance to next stage
function advanceStage() {
  const stages = ['preflop', 'flop', 'turn', 'river', 'showdown'];
  const currentIndex = stages.indexOf(gameStage);

  if (currentIndex < stages.length - 1) {
    gameStage = stages[currentIndex + 1];

    // Deal community cards
    if (gameStage === 'flop') {
      communityCards.push(dealCard(), dealCard(), dealCard());
    } else if (gameStage === 'turn') {
      communityCards.push(dealCard());
    } else if (gameStage === 'river') {
      communityCards.push(dealCard());
    } else if (gameStage === 'showdown') {
      determineWinner();
      return;
    }

    displayCards();
    updateGameStage();
  }
}

// Evaluate poker hand
function evaluateHand(hand, community) {
  const allCards = [...hand, ...community];
  const sortedCards = allCards.sort((a, b) => rankValues[b.rank] - rankValues[a.rank]);

  // Check for flush
  const suitCounts = {};
  allCards.forEach(card => {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });
  const hasFlush = Object.values(suitCounts).some(count => count >= 5);

  // Check for straight
  const uniqueRanks = [...new Set(sortedCards.map(c => rankValues[c.rank]))].sort((a, b) => b - a);
  let hasStraight = false;
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
      hasStraight = true;
      break;
    }
  }

  // Count ranks
  const rankCounts = {};
  sortedCards.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  // Determine hand ranking
  if (hasStraight && hasFlush) return { rank: 8, name: 'Straight Flush' };
  if (counts[0] === 4) return { rank: 7, name: 'Four of a Kind' };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 6, name: 'Full House' };
  if (hasFlush) return { rank: 5, name: 'Flush' };
  if (hasStraight) return { rank: 4, name: 'Straight' };
  if (counts[0] === 3) return { rank: 3, name: 'Three of a Kind' };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 2, name: 'Two Pair' };
  if (counts[0] === 2) return { rank: 1, name: 'Pair' };
  return { rank: 0, name: 'High Card: ' + sortedCards[0].rank };
}

// Determine winner
function determineWinner() {
  gameStage = 'showdown';
  displayCards();

  const playerHandRank = evaluateHand(playerHand, communityCards);
  const dealerHandRank = evaluateHand(dealerHand, communityCards);

  // Display hands
  const playerHandEl = document.getElementById('playerHand');
  const dealerHandEl = document.getElementById('dealerHand');

  if (playerHandEl) playerHandEl.textContent = playerHandRank.name;
  if (dealerHandEl) dealerHandEl.textContent = dealerHandRank.name;

  setTimeout(() => {
    if (playerHandRank.rank > dealerHandRank.rank) {
      endGame('win', `You win with ${playerHandRank.name}!`);
    } else if (dealerHandRank.rank > playerHandRank.rank) {
      endGame('lose', `Dealer wins with ${dealerHandRank.name}`);
    } else {
      endGame('push', 'Push! It\'s a tie');
    }
  }, 1500);
}

// End game
function endGame(result, message) {
  if (typeof BalanceManager !== 'undefined') {
    if (result === 'win') {
      BalanceManager.addBalance(pot);
      showToast('You Won! 🎉', message + ` You won $${pot.toFixed(0)}!`, 'win');
    } else if (result === 'push') {
      BalanceManager.addBalance(playerBet);
      showToast('Push', message, 'push');
    } else {
      showToast('You Lost', message, 'lose');
    }
    updateBalanceDisplays();
  }

  // Switch UI
  document.getElementById('gameStage').classList.add('d-none');
  document.getElementById('postGameStage').classList.remove('d-none');
}

// Reset game
function resetGame() {
  pot = 0;
  currentBet = 0;
  playerBet = 0;
  dealerBet = 0;
  gameStage = 'bet';
  playerHand = [];
  dealerHand = [];
  communityCards = [];

  updatePotDisplay();
  displayCards();

  document.getElementById('playerHand').textContent = '';
  document.getElementById('dealerHand').textContent = '';

  document.getElementById('betStage').classList.remove('d-none');
  document.getElementById('gameStage').classList.add('d-none');
  document.getElementById('postGameStage').classList.add('d-none');

  updateBalanceDisplays();
}
