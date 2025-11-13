const suits = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660'
};

const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let communityCards = [];
let pot = 0;
let playerChips = 1000;
let dealerChips = 1000;
let currentBet = 0;
let dealerBet = 0;
let playerBet = 0;
let gamePhase = 'preflop'; // preflop, flop, turn, river, showdown
let gameState = 'bet';

// jQuery Toast Notification Function
function showToast(title, message, type) {
  const $toast = $('#toastNotification');
  const $title = $('#toastTitle');
  const $message = $('#toastMessage');
  
  $toast.removeClass('toast-win toast-lose toast-start toast-push hiding');
  $toast.addClass('toast-' + type);
  
  $title.text(title);
  $message.text(message);
  
  $toast.fadeIn(300);
  
  setTimeout(() => {
    $toast.addClass('hiding');
    setTimeout(() => {
      $toast.fadeOut(300, () => {
        $toast.removeClass('hiding');
      });
    }, 300);
  }, 3000);
}

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
  communityCards: document.getElementById('communityCards'),
  playerHand: document.getElementById('playerHand'),
  dealerHand: document.getElementById('dealerHand'),
  gameMessage: document.getElementById('gameMessage'),
  potDisplay: document.getElementById('potDisplay'),
  playerChips: document.getElementById('playerChips'),
  dealerChips: document.getElementById('dealerChips'),

  betStage: document.getElementById('betStage'),
  gameStage: document.getElementById('gameStage'),
  postGameStage: document.getElementById('postGameStage'),

  placeBetBtn: document.getElementById('placeBetBtn'),
  foldBtn: document.getElementById('foldBtn'),
  checkBtn: document.getElementById('checkBtn'),
  callBtn: document.getElementById('callBtn'),
  raiseBtn: document.getElementById('raiseBtn'),
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

function renderHand(hand, container, hideCards = false) {
  container.innerHTML = '';
  hand.forEach((card) => {
    const cardElement = createCardElement(card, hideCards);
    container.appendChild(cardElement);
  });
}

function updateChips() {
  elements.playerChips.textContent = `Chips: $${playerChips}`;
  elements.dealerChips.textContent = `Chips: $${dealerChips}`;
  elements.potDisplay.textContent = `Pot: $${pot}`;
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

// Poker hand evaluation
function getCardRank(card) {
  const ranks = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
  return ranks[card.value];
}

function evaluateHand(playerCards, community) {
  const allCards = [...playerCards, ...community];
  const sortedCards = allCards.sort((a, b) => getCardRank(b) - getCardRank(a));
  
  // Check for flush
  const suitCounts = {};
  allCards.forEach(card => {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });
  const isFlush = Object.values(suitCounts).some(count => count >= 5);
  
  // Check for straight
  const ranks = sortedCards.map(card => getCardRank(card));
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
  let isStraight = false;
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
      isStraight = true;
      break;
    }
  }
  
  // Count card frequencies
  const rankCounts = {};
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const maxRank = Math.max(...ranks);
  
  // Determine hand strength
  if (isStraight && isFlush) return { rank: 8, name: 'Straight Flush', value: maxRank };
  if (counts[0] === 4) return { rank: 7, name: 'Four of a Kind', value: maxRank };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 6, name: 'Full House', value: maxRank };
  if (isFlush) return { rank: 5, name: 'Flush', value: maxRank };
  if (isStraight) return { rank: 4, name: 'Straight', value: maxRank };
  if (counts[0] === 3) return { rank: 3, name: 'Three of a Kind', value: maxRank };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 2, name: 'Two Pair', value: maxRank };
  if (counts[0] === 2) return { rank: 1, name: 'One Pair', value: maxRank };
  return { rank: 0, name: 'High Card', value: maxRank };
}

function compareHands() {
  const playerResult = evaluateHand(playerHand, communityCards);
  const dealerResult = evaluateHand(dealerHand, communityCards);
  
  elements.playerHand.textContent = playerResult.name;
  elements.dealerHand.textContent = dealerResult.name;
  
  if (playerResult.rank > dealerResult.rank) {
    return 'player';
  } else if (playerResult.rank < dealerResult.rank) {
    return 'dealer';
  } else {
    if (playerResult.value > dealerResult.value) {
      return 'player';
    } else if (playerResult.value < dealerResult.value) {
      return 'dealer';
    }
    return 'tie';
  }
}

function startGame() {
  if (playerChips < 10) {
    showToast('Not Enough Chips', 'You need at least $10 to play', 'lose');
    return;
  }
  
  hideMessage();
  createDeck();
  playerHand = [];
  dealerHand = [];
  communityCards = [];
  pot = 0;
  currentBet = 10;
  playerBet = 10;
  dealerBet = 10;
  gamePhase = 'preflop';
  
  // Blinds
  playerChips -= 10;
  dealerChips -= 10;
  pot = 20;

  // Deal hole cards
  playerHand.push(dealCard());
  dealerHand.push(dealCard());
  playerHand.push(dealCard());
  dealerHand.push(dealCard());

  renderHand(playerHand, elements.playerCards);
  renderHand(dealerHand, elements.dealerCards, true);
  elements.communityCards.innerHTML = '';
  elements.playerHand.textContent = '';
  elements.dealerHand.textContent = '';
  
  updateChips();
  switchStage('playing');
  updateButtons();

  showToast('Game Started!', 'Pre-flop betting round. Good luck!', 'start');
}

function updateButtons() {
  const needToCall = dealerBet > playerBet;
  
  if (needToCall) {
    elements.checkBtn.style.display = 'none';
    elements.callBtn.style.display = 'inline-block';
    elements.callBtn.textContent = `Call ($${dealerBet - playerBet})`;
  } else {
    elements.checkBtn.style.display = 'inline-block';
    elements.callBtn.style.display = 'none';
  }
}

function dealCommunityCards() {
  if (gamePhase === 'preflop') {
    // Flop - 3 cards
    communityCards.push(dealCard());
    communityCards.push(dealCard());
    communityCards.push(dealCard());
    gamePhase = 'flop';
    showToast('Flop', 'Three community cards revealed!', 'start');
  } else if (gamePhase === 'flop') {
    // Turn - 1 card
    communityCards.push(dealCard());
    gamePhase = 'turn';
    showToast('Turn', 'Fourth community card revealed!', 'start');
  } else if (gamePhase === 'turn') {
    // River - 1 card
    communityCards.push(dealCard());
    gamePhase = 'river';
    showToast('River', 'Final community card revealed!', 'start');
  } else {
    // Showdown
    showdown();
    return;
  }
  
  renderHand(communityCards, elements.communityCards);
  
  // Reset bets for new round
  playerBet = 0;
  dealerBet = 0;
  
  // Dealer action
  dealerAction();
}

function dealerAction() {
  // Simple AI: random actions
  const action = Math.random();
  
  if (action < 0.3) {
    // Check
    dealerBet = 0;
    showToast('Dealer Checks', 'Dealer passes the action to you', 'push');
  } else if (action < 0.7) {
    // Call
    dealerBet = playerBet;
  } else {
    // Raise
    const raiseAmount = 20;
    if (dealerChips >= raiseAmount) {
      dealerBet += raiseAmount;
      dealerChips -= raiseAmount;
      pot += raiseAmount;
      updateChips();
      showToast('Dealer Raises!', `Dealer raises by $${raiseAmount}`, 'start');
    }
  }
  
  updateButtons();
}

function fold() {
  showMessage('You folded. Dealer wins!', 'lose');
  dealerChips += pot;
  pot = 0;
  updateChips();
  switchStage('finished');
  showToast('You Folded', 'Dealer wins the pot', 'lose');
}

function check() {
  if (dealerBet > playerBet) {
    showToast('Cannot Check', 'You must call or fold', 'lose');
    return;
  }
  
  dealCommunityCards();
}

function call() {
  const callAmount = dealerBet - playerBet;
  
  if (playerChips < callAmount) {
    showToast('Not Enough Chips', 'You cannot afford to call', 'lose');
    return;
  }
  
  playerChips -= callAmount;
  pot += callAmount;
  playerBet = dealerBet;
  updateChips();
  
  dealCommunityCards();
}

function raise() {
  const raiseAmount = 10;
  
  if (playerChips < raiseAmount) {
    showToast('Not Enough Chips', 'You cannot afford to raise', 'lose');
    return;
  }
  
  playerChips -= raiseAmount;
  pot += raiseAmount;
  playerBet += raiseAmount;
  updateChips();
  
  showToast('You Raised!', `You raise by $${raiseAmount}`, 'start');
  
  // Dealer responds
  const dealerResponse = Math.random();
  
  if (dealerResponse < 0.2) {
    // Dealer folds
    showMessage('Dealer folds. You win!', 'win');
    playerChips += pot;
    pot = 0;
    updateChips();
    switchStage('finished');
    showToast('Dealer Folds!', 'You win the pot!', 'win');
  } else if (dealerResponse < 0.7) {
    // Dealer calls
    if (dealerChips >= raiseAmount) {
      dealerChips -= raiseAmount;
      pot += raiseAmount;
      dealerBet = playerBet;
      updateChips();
      dealCommunityCards();
    } else {
      showdown();
    }
  } else {
    // Dealer re-raises
    const reraiseAmount = 20;
    if (dealerChips >= reraiseAmount) {
      dealerChips -= reraiseAmount;
      pot += reraiseAmount;
      dealerBet += reraiseAmount;
      updateChips();
      updateButtons();
      showToast('Dealer Re-raises!', `Dealer re-raises by $${reraiseAmount}`, 'start');
    } else {
      dealCommunityCards();
    }
  }
}

function showdown() {
  renderHand(dealerHand, elements.dealerCards, false);
  
  const winner = compareHands();
  
  if (winner === 'player') {
    showMessage(`You win with ${elements.playerHand.textContent}!`, 'win');
    playerChips += pot;
    showToast('You Win! 🎉', `${elements.playerHand.textContent} beats ${elements.dealerHand.textContent}`, 'win');
  } else if (winner === 'dealer') {
    showMessage(`Dealer wins with ${elements.dealerHand.textContent}!`, 'lose');
    dealerChips += pot;
    showToast('Dealer Wins', `${elements.dealerHand.textContent} beats ${elements.playerHand.textContent}`, 'lose');
  } else {
    showMessage('It\'s a tie! Pot split.', 'push');
    const halfPot = Math.floor(pot / 2);
    playerChips += halfPot;
    dealerChips += halfPot;
    showToast('Tie! 🤝', 'Pot is split between players', 'push');
  }
  
  pot = 0;
  updateChips();
  switchStage('finished');
}

function playAgain() {
  elements.playerCards.innerHTML = '';
  elements.dealerCards.innerHTML = '';
  elements.communityCards.innerHTML = '';
  elements.playerHand.textContent = '';
  elements.dealerHand.textContent = '';
  hideMessage();
  
  if (playerChips < 10) {
    showToast('Game Over', 'You ran out of chips!', 'lose');
    playerChips = 1000;
    dealerChips = 1000;
    updateChips();
  }
  
  switchStage('bet');
}

elements.placeBetBtn.addEventListener('click', startGame);
elements.foldBtn.addEventListener('click', fold);
elements.checkBtn.addEventListener('click', check);
elements.callBtn.addEventListener('click', call);
elements.raiseBtn.addEventListener('click', raise);
elements.playAgainBtn.addEventListener('click', playAgain);

switchStage('bet');
updateChips();