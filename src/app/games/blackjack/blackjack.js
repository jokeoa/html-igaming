const suits = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660'
};

const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameState = 'bet';
let currentBet = 0;

// jQuery Toast Notification Function
function showToast(title, message, type) {
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

const elements = {
  playerCards: document.getElementById('playerCards'),
  dealerCards: document.getElementById('dealerCards'),
  playerScore: document.getElementById('playerScore'),
  dealerScore: document.getElementById('dealerScore'),
  gameMessage: document.getElementById('gameMessage'),
  gameMessageText: document.getElementById('gameMessageText'),

  betStage: document.getElementById('betStage'),
  gameStage: document.getElementById('gameStage'),
  postGameStage: document.getElementById('postGameStage'),

  placeBetBtn: document.getElementById('placeBetBtn'),
  hitBtn: document.getElementById('hitBtn'),
  standBtn: document.getElementById('standBtn'),
  splitBtn: document.getElementById('splitBtn'),
  playAgainBtn: document.getElementById('playAgainBtn')
};

function createDeck() {
  deck = [];
  for (let suit in suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  shuffleDeck();
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealCard() {
  return deck.pop();
}

function createCardElement(card, hidden = false) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'playing-card';

  if (hidden) {
    cardDiv.classList.add('back');
    cardDiv.innerHTML = '<div class="card-value">?</div>';
    return cardDiv;
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  if (isRed) cardDiv.classList.add('red');

  cardDiv.innerHTML = `
    <div class="card-value">${card.value}</div>
    <div class="card-suit">${suits[card.suit]}</div>
    <div class="card-value">${card.value}</div>
  `;

  return cardDiv;
}

function getCardValue(card) {
  if (card.value === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  return parseInt(card.value);
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;

  for (let card of hand) {
    let value = getCardValue(card);
    score += value;
    if (card.value === 'A') aces++;
  }

  // Ace 11->1
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
}

function renderHand(hand, container, hideFirst = false) {
  container.innerHTML = '';
  hand.forEach((card, index) => {
    const cardElement = createCardElement(card, hideFirst && index === 0);
    container.appendChild(cardElement);
  });
}

function updateScores(revealDealer = false) {
  const playerScore = calculateScore(playerHand);
  if (elements.playerScore) {
    elements.playerScore.textContent = `Score: ${playerScore}`;
  }

  if (revealDealer) {
    const dealerScore = calculateScore(dealerHand);
    if (elements.dealerScore) {
      elements.dealerScore.textContent = `Score: ${dealerScore}`;
    }
  } else {
    if (elements.dealerScore) {
      elements.dealerScore.textContent = dealerHand.length > 0 ? 'Score: ?' : '';
    }
  }
}

function showMessage(text, type) {
  if (!elements.gameMessage || !elements.gameMessageText) return;
  
  elements.gameMessageText.textContent = text;
  
  // Remove all alert classes
  elements.gameMessage.classList.remove('alert-success', 'alert-danger', 'alert-warning', 'd-none');
  
  // Add appropriate Bootstrap alert class
  if (type === 'win') {
    elements.gameMessage.classList.add('alert-success');
  } else if (type === 'lose') {
    elements.gameMessage.classList.add('alert-danger');
  } else {
    elements.gameMessage.classList.add('alert-warning');
  }
  
  // Show the alert
  elements.gameMessage.classList.remove('d-none');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideMessage();
  }, 5000);
}

function hideMessage() {
  if (elements.gameMessage) {
    elements.gameMessage.classList.add('d-none');
  }
}

function switchStage(stage) {
  // Hide all stages using Bootstrap classes
  if (elements.betStage) {
    elements.betStage.classList.remove('d-block');
    elements.betStage.classList.add('d-none');
  }
  if (elements.gameStage) {
    elements.gameStage.classList.remove('d-block');
    elements.gameStage.classList.add('d-none');
  }
  if (elements.postGameStage) {
    elements.postGameStage.classList.remove('d-block');
    elements.postGameStage.classList.add('d-none');
  }

  // Show the appropriate stage
  if (stage === 'bet' && elements.betStage) {
    elements.betStage.classList.remove('d-none');
    elements.betStage.classList.add('d-block');
  } else if (stage === 'playing' && elements.gameStage) {
    elements.gameStage.classList.remove('d-none');
    elements.gameStage.classList.add('d-block');
  } else if (stage === 'finished' && elements.postGameStage) {
    elements.postGameStage.classList.remove('d-none');
    elements.postGameStage.classList.add('d-block');
  }

  gameState = stage;
}

function canSplit() {
  return playerHand.length === 2 &&
         getCardValue(playerHand[0]) === getCardValue(playerHand[1]);
}

function checkSplitAvailable() {
  if (elements.splitBtn) {
    if (canSplit()) {
      elements.splitBtn.classList.remove('d-none');
      elements.splitBtn.style.display = 'inline-block';
    } else {
      elements.splitBtn.classList.add('d-none');
      elements.splitBtn.style.display = 'none';
    }
  }
}

function startGame() {
  // Get bet amount
  const betInput = document.getElementById('betAmount');
  const betAmount = parseFloat(betInput.value) || 10;
  
  // Check if user can afford the bet
  if (!BalanceManager.canAfford(betAmount)) {
    showToast('Insufficient Balance', 'Please deposit more funds to play.', 'lose');
    return;
  }
  
  // Deduct bet from balance
  currentBet = betAmount;
  BalanceManager.subtractBalance(betAmount);
  
  // Force update balance display
  const balance = BalanceManager.getBalance() || 0;
  BalanceManager.updateBalanceDisplay();
  
  // Explicitly update balance elements
  const userBalanceEl = document.getElementById('userBalance');
  if (userBalanceEl) {
    userBalanceEl.textContent = '$' + balance.toFixed(2);
  }
  
  // Update nav balance
  const navBalance = document.getElementById('userBalanceNav');
  if (navBalance) {
    navBalance.textContent = '$' + balance.toFixed(2);
  }
  
  // Also update via jQuery if available
  if (typeof $ !== 'undefined') {
    $('.user-balance, #userBalance').text('$' + balance.toFixed(2));
  }
  
  hideMessage();
  createDeck();
  playerHand = [];
  dealerHand = [];

  playerHand.push(dealCard());
  dealerHand.push(dealCard());
  playerHand.push(dealCard());
  dealerHand.push(dealCard());

  if (elements.playerCards) renderHand(playerHand, elements.playerCards);
  if (elements.dealerCards) renderHand(dealerHand, elements.dealerCards, true);
  updateScores();

  switchStage('playing');
  checkSplitAvailable();

  // Show toast for game start
  showToast('Game Started!', `Bet placed: $${betAmount.toFixed(2)}. Good luck!`, 'start');

  if (calculateScore(playerHand) === 21) {
    stand();
  }
}

function hit() {
  playerHand.push(dealCard());
  if (elements.playerCards) renderHand(playerHand, elements.playerCards);
  updateScores();

  if (elements.splitBtn) {
    elements.splitBtn.classList.add('d-none');
    elements.splitBtn.style.display = 'none';
  }

  const playerScore = calculateScore(playerHand);
  if (playerScore > 21) {
    endGame('lose', 'Bust! You went over 21');
  } else if (playerScore === 21) {
    stand();
  }
}

function stand() {
  if (elements.dealerCards) renderHand(dealerHand, elements.dealerCards);
  updateScores(true);

  // Dealer <17
  while (calculateScore(dealerHand) < 17) {
    dealerHand.push(dealCard());
    if (elements.dealerCards) renderHand(dealerHand, elements.dealerCards);
    updateScores(true);
  }

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  if (dealerScore > 21) {
    endGame('win', 'Dealer busts! You win!');
  } else if (playerScore > dealerScore) {
    endGame('win', 'You win!');
  } else if (playerScore < dealerScore) {
    endGame('lose', 'Dealer wins!');
  } else {
    endGame('push', 'Push! It\'s a tie');
  }
}

function split() {
  if (!canSplit()) return;

  alert('Split functionality: Each hand plays separately. Simplified version - coming soon!');
}

function endGame(result, message) {
  showMessage(message, result === 'win' ? 'win' : result === 'lose' ? 'lose' : 'push');
  switchStage('finished');
  
  // Handle balance updates based on game result
  let balanceChange = 0;
  let finalBalance = 0;
  
  if (result === 'win') {
    // Win: get bet back + win amount (2x bet)
    balanceChange = currentBet * 2;
    BalanceManager.addBalance(balanceChange);
    finalBalance = BalanceManager.getBalance() || 0;
    showToast('You Won! 🎉', `${message} You won $${balanceChange.toFixed(2)}!`, 'win');
  } else if (result === 'lose') {
    // Lose: bet already deducted, show loss
    finalBalance = BalanceManager.getBalance() || 0;
    showToast('You Lost 😔', `${message} You lost $${currentBet.toFixed(2)}.`, 'lose');
  } else {
    // Push: return bet
    balanceChange = currentBet;
    BalanceManager.addBalance(balanceChange);
    finalBalance = BalanceManager.getBalance() || 0;
    showToast('Push! 🤝', `${message} Your bet of $${currentBet.toFixed(2)} was returned.`, 'push');
  }
  
  // Force update balance display after result
  BalanceManager.updateBalanceDisplay();
  
  // Explicitly update balance elements
  const userBalanceEl = document.getElementById('userBalance');
  if (userBalanceEl) {
    userBalanceEl.textContent = '$' + finalBalance.toFixed(2);
  }
  
  // Update nav balance
  const navBalance = document.getElementById('userBalanceNav');
  if (navBalance) {
    navBalance.textContent = '$' + finalBalance.toFixed(2);
  }
  
  // Also update via jQuery if available
  if (typeof $ !== 'undefined') {
    $('.user-balance, #userBalance').text('$' + finalBalance.toFixed(2));
  }
  
  currentBet = 0;
}

function playAgain() {
  if (elements.playerCards) elements.playerCards.innerHTML = '';
  if (elements.dealerCards) elements.dealerCards.innerHTML = '';
  if (elements.playerScore) elements.playerScore.textContent = '';
  if (elements.dealerScore) elements.dealerScore.textContent = '';
  hideMessage();
  currentBet = 0;
  switchStage('bet');
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize balance display
  if (typeof BalanceManager !== 'undefined') {
    BalanceManager.updateBalanceDisplay();
    
    // Quick bet buttons
    document.querySelectorAll('.bet-quick-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const amount = parseFloat(this.getAttribute('data-amount'));
        const betInput = document.getElementById('betAmount');
        if (betInput) betInput.value = amount;
      });
    });
  }

  // Add event listeners only if elements exist
  if (elements.placeBetBtn) {
    elements.placeBetBtn.addEventListener('click', startGame);
  }
  if (elements.hitBtn) {
    elements.hitBtn.addEventListener('click', hit);
  }
  if (elements.standBtn) {
    elements.standBtn.addEventListener('click', stand);
  }
  if (elements.splitBtn) {
    elements.splitBtn.addEventListener('click', split);
  }
  if (elements.playAgainBtn) {
    elements.playAgainBtn.addEventListener('click', playAgain);
  }

  // Initialize game stage
  switchStage('bet');
});
