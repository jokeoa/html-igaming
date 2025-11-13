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
let userApi = null;

const betAmountInput = document.getElementById('betAmountInput');
const betErrorEl = document.getElementById('betError');
const balanceDisplayEl = document.getElementById('playerTokenBalance');

// jQuery Toast Notification Function
function showToast(title, message, type) {
  const $toast = $('#toastNotification');
  const $title = $('#gameToastTitle');
  const $message = $('#gameToastMessage');
  
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

  betStage: document.getElementById('betStage'),
  gameStage: document.getElementById('gameStage'),
  postGameStage: document.getElementById('postGameStage'),

  placeBetBtn: document.getElementById('placeBetBtn'),
  hitBtn: document.getElementById('hitBtn'),
  standBtn: document.getElementById('standBtn'),
  splitBtn: document.getElementById('splitBtn'),
  playAgainBtn: document.getElementById('playAgainBtn')
};

function getUserApi() {
  if (!userApi && window.htmlCasinoUser) {
    userApi = window.htmlCasinoUser;
  }
  return userApi;
}

function refreshTokenBalance() {
  const api = getUserApi();
  if (!balanceDisplayEl || !api || !api.getUserSnapshot) return;
  const snapshot = api.getUserSnapshot();
  balanceDisplayEl.textContent = snapshot.balance;
}

function hideBetError() {
  if (betErrorEl) {
    betErrorEl.style.display = 'none';
  }
}

function showBetError(message) {
  if (betErrorEl) {
    betErrorEl.textContent = message;
    betErrorEl.style.display = 'block';
  }
}

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
  cardDiv.className = 'card';

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
  elements.playerScore.textContent = `Score: ${playerScore}`;

  if (revealDealer) {
    const dealerScore = calculateScore(dealerHand);
    elements.dealerScore.textContent = `Score: ${dealerScore}`;
  } else {
    elements.dealerScore.textContent = dealerHand.length > 0 ? 'Score: ?' : '';
  }
}

function showMessage(text, type) {
  elements.gameMessage.textContent = text;
  elements.gameMessage.className = `message ${type}`;
  elements.gameMessage.style.display = 'block';
}

function hideMessage() {
  elements.gameMessage.style.display = 'none';
}

function switchStage(stage) {
  elements.betStage.style.display = 'none';
  elements.gameStage.style.display = 'none';
  elements.postGameStage.style.display = 'none';

  if (stage === 'bet') {
    elements.betStage.style.display = 'block';
  } else if (stage === 'playing') {
    elements.gameStage.style.display = 'block';
  } else if (stage === 'finished') {
    elements.postGameStage.style.display = 'block';
  }

  gameState = stage;
}

function canSplit() {
  return playerHand.length === 2 &&
         getCardValue(playerHand[0]) === getCardValue(playerHand[1]);
}

function checkSplitAvailable() {
  elements.splitBtn.style.display = canSplit() ? 'inline-block' : 'none';
}

function startGame() {
  const api = getUserApi();
  if (!api || typeof api.spendTokens !== 'function') {
    showToastMessage('Tokens unavailable', 'We could not access your casino wallet. Try refreshing the page.');
    return;
  }

  const betAmount = Math.floor(Number(betAmountInput ? betAmountInput.value : 0));
  if (!Number.isFinite(betAmount) || betAmount <= 0) {
    showBetError('Enter a positive bet amount.');
    return;
  }

  const spendResult = api.spendTokens(betAmount, { silent: true });
  if (!spendResult || !spendResult.success) {
    showBetError('Not enough tokens for this bet. Top up your balance first.');
    refreshTokenBalance();
    return;
  }

  currentBet = betAmount;
  refreshTokenBalance();
  hideBetError();
  hideMessage();
  createDeck();
  playerHand = [];
  dealerHand = [];

  playerHand.push(dealCard());
  dealerHand.push(dealCard());
  playerHand.push(dealCard());
  dealerHand.push(dealCard());

  renderHand(playerHand, elements.playerCards);
  renderHand(dealerHand, elements.dealerCards, true);
  updateScores();

  switchStage('playing');
  checkSplitAvailable();

  // Show toast for game start
  showToast('Game Started!', 'Good luck! Try to get 21 without going over.', 'start');

  if (calculateScore(playerHand) === 21) {
    stand();
  }
}

function hit() {
  playerHand.push(dealCard());
  renderHand(playerHand, elements.playerCards);
  updateScores();

  elements.splitBtn.style.display = 'none';

  const playerScore = calculateScore(playerHand);
  if (playerScore > 21) {
    endGame('lose', 'Bust! You went over 21');
  } else if (playerScore === 21) {
    stand();
  }
}

function stand() {
  renderHand(dealerHand, elements.dealerCards);
  updateScores(true);

  // Dealer <17
  while (calculateScore(dealerHand) < 17) {
    dealerHand.push(dealCard());
    renderHand(dealerHand, elements.dealerCards);
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
  
  // Show toast based on game outcome
  if (result === 'win') {
    showToast('You Won! 🎉', message, 'win');
  } else if (result === 'lose') {
    showToast('You Lost 😔', message, 'lose');
  } else {
    showToast('Push! 🤝', message, 'push');
  }
  handleBetOutcome(result);
}

function playAgain() {
  elements.playerCards.innerHTML = '';
  elements.dealerCards.innerHTML = '';
  elements.playerScore.textContent = '';
  elements.dealerScore.textContent = '';
  hideMessage();
  switchStage('bet');
  hideBetError();
  currentBet = 0;
  refreshTokenBalance();
}

function handleBetOutcome(result) {
  if (!currentBet) {
    refreshTokenBalance();
    return;
  }

  const api = getUserApi();
  if (!api || typeof api.addTokens !== 'function') {
    currentBet = 0;
    refreshTokenBalance();
    return;
  }

  let payout = 0;
  if (result === 'win') {
    payout = currentBet * 2;
  } else if (result === 'push') {
    payout = currentBet;
  }

  if (payout > 0) {
    api.addTokens(payout, { silent: true });
    showToastMessage('Tokens won', `+${payout} tokens added to your balance.`);
  } else if (result === 'lose') {
    showToastMessage('Tokens lost', `-${currentBet} tokens lost in this round.`);
  }

  currentBet = 0;
  refreshTokenBalance();
}

elements.placeBetBtn.addEventListener('click', startGame);
elements.hitBtn.addEventListener('click', hit);
elements.standBtn.addEventListener('click', stand);
elements.splitBtn.addEventListener('click', split);
elements.playAgainBtn.addEventListener('click', playAgain);

switchStage('bet');

if (betAmountInput) {
  betAmountInput.addEventListener('input', () => {
    hideBetError();
  });
}

if (window.htmlCasinoUser && typeof window.htmlCasinoUser.onChange === 'function') {
  window.htmlCasinoUser.onChange(refreshTokenBalance);
}

setTimeout(refreshTokenBalance, 0);
