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

// Roulette Game Variables
const numbers = Array.from({length: 37}, (_, i) => i);
let isSpinning = false;
let wheelCanvas = null;
let wheelCtx = null;
let currentBet = 0;

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize canvas
  wheelCanvas = document.getElementById('wheelCanvas');
  if (wheelCanvas) {
    wheelCtx = wheelCanvas.getContext('2d');
    drawWheel();
  }

  // Initialize balance display
  if (typeof BalanceManager !== 'undefined') {
    BalanceManager.updateBalanceDisplay();

    // Update user name
    const userName = BalanceManager.getUserName() || 'Guest User';
    const userNameEl = document.getElementById('userNameDisplay');
    if (userNameEl) {
      userNameEl.textContent = userName;
    }

    // Update balance in multiple locations
    updateBalanceDisplays();

    // Quick bet buttons
    document.querySelectorAll('.bet-quick-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const amount = parseFloat(this.getAttribute('data-amount'));
        const betInput = document.getElementById('betAmount');
        if (betInput) betInput.value = amount;
      });
    });
  }

  // Setup event listeners
  const spinBtn = document.getElementById('spinBtn');
  const quickSpinBtn = document.getElementById('quickSpin');

  if (spinBtn) {
    spinBtn.addEventListener('click', spinWheel);
  }

  if (quickSpinBtn) {
    quickSpinBtn.addEventListener('click', spinWheel);
  }

  // Keyboard control
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !isSpinning) {
      e.preventDefault();
      spinWheel();
    }
  });
});

// Draw the roulette wheel
function drawWheel() {
  if (!wheelCanvas || !wheelCtx) return;

  const canvas = wheelCanvas;
  const ctx = wheelCtx;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 170;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const angleStep = (Math.PI * 2) / 37;

  // Theme-aware colors for readability
  const computedStyle = getComputedStyle(document.body);
  const gold = '#ffd700';
  const black = '#000000';
  const white = computedStyle.color || '#ffffff';
  const red = '#e0080b';
  const green = '#016d29';

  numbers.forEach((num, index) => {
    const startAngle = index * angleStep;
    const endAngle = (index + 1) * angleStep;
    const isZero = num === 0;
    const isRed = !isZero && [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num);
    ctx.fillStyle = isZero ? green : (isRed ? red : black);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + angleStep / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Ensure readable text on both light/dark themes
    ctx.fillStyle = white;
    ctx.font = num === 0 ? 'bold 22px Geist' : 'bold 18px Geist';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(num.toString(), radius * 0.65, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
  ctx.fillStyle = gold;
  ctx.fill();
  ctx.strokeStyle = black;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,215,0,0.9)';
  ctx.font = 'bold 16px Geist';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CLASSIC', centerX, centerY - 5);
  ctx.font = 'bold 14px Geist';
  ctx.fillText('ROULETTE', centerX, centerY + 15);
}

// Update balance displays
function updateBalanceDisplays() {
  if (typeof BalanceManager === 'undefined') return;

  const balance = BalanceManager.getBalance() || 0;
  const balanceFormatted = '$' + balance.toFixed(2);

  // Update balance display
  BalanceManager.updateBalanceDisplay();

  // Explicitly update balance elements
  const userBalanceEl = document.getElementById('userBalance');
  if (userBalanceEl) {
    userBalanceEl.textContent = balanceFormatted;
  }

  // Update nav balance
  const navBalance = document.getElementById('userBalanceNav');
  if (navBalance) {
    navBalance.textContent = balanceFormatted;
  }

  // Also update via jQuery if available
  if (typeof $ !== 'undefined') {
    $('.user-balance, #userBalance').text(balanceFormatted);
  }
}

// Spin the wheel
function spinWheel() {
  if (isSpinning) return;

  // Get bet amount
  const betInput = document.getElementById('betAmount');
  const betAmount = parseFloat(betInput.value) || 10;

  // Check if BalanceManager exists
  if (typeof BalanceManager === 'undefined') {
    alert('Balance system not loaded. Please refresh the page.');
    return;
  }

  // Check if user can afford the bet
  if (!BalanceManager.canAfford(betAmount)) {
    showToast('Insufficient Balance', 'Please deposit more funds to play.', 'lose');
    return;
  }

  // Deduct bet from balance
  currentBet = betAmount;
  BalanceManager.subtractBalance(betAmount);

  // Force update balance display
  updateBalanceDisplays();

  isSpinning = true;
  const btn = document.getElementById('spinBtn');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }

  const resultMessageEl = document.getElementById('resultMessage');
  if (resultMessageEl) {
    resultMessageEl.textContent = `SPINNING... (Bet: $${betAmount.toFixed(2)})`;
  }

  const spins = 5 + Math.random() * 3;
  const finalRotation = spins * 360 + Math.random() * 360;

  const duration = 4500;
  const startTime = performance.now();
  const animate = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const rotation = finalRotation * easeOut;
    if (wheelCanvas) {
      wheelCanvas.style.transform = `rotate(${rotation}deg)`;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
  playSound('spin');
  setTimeout(() => processResult(finalRotation % 360), 4500);
}

// Process result
function processResult(finalAngle) {
  const normalizedRad = (360 - finalAngle) * Math.PI / 180;
  const angleStep = (Math.PI * 2) / 37;
  const resultIndex = Math.floor(normalizedRad / angleStep) % 37;
  const result = numbers[resultIndex];

  // Determine win/loss (simplified: win on even numbers, lose on odd and 0)
  const isWin = result !== 0 && result % 2 === 0;
  let balanceChange = 0;
  let resultMessage = `Result: ${result}`;

  if (typeof BalanceManager !== 'undefined' && currentBet > 0) {
    let finalBalance = 0;

    if (isWin) {
      // Win: get bet back + win amount (2x bet)
      balanceChange = currentBet * 2;
      BalanceManager.addBalance(balanceChange);
      finalBalance = BalanceManager.getBalance() || 0;
      resultMessage += ` - WIN! You won $${balanceChange.toFixed(2)}!`;
      playSound('win');
      showToast('You Won! 🎉', `Result: ${result}. You won $${balanceChange.toFixed(2)}!`, 'win');
    } else {
      // Lose: bet already deducted
      finalBalance = BalanceManager.getBalance() || 0;
      resultMessage += ` - LOSE! You lost $${currentBet.toFixed(2)}.`;
      playSound('lose');
      showToast('You Lost 😔', `Result: ${result}. You lost $${currentBet.toFixed(2)}.`, 'lose');
    }

    // Force update balance display after result
    updateBalanceDisplays();

    currentBet = 0;
  } else {
    playSound(Math.random() > 0.5 ? 'win' : 'lose');
  }

  const resultMessageEl = document.getElementById('resultMessage');
  if (resultMessageEl) {
    resultMessageEl.textContent = resultMessage;
  }

  const btn = document.getElementById('spinBtn');
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
  }

  isSpinning = false;

  setTimeout(() => {
    if (wheelCanvas) {
      wheelCanvas.style.transform = 'rotate(0deg)';
    }
  }, 200);
}

// Play sound
function playSound(type) {
  if (!window.audioContext) {
    window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  const ctx = window.audioContext;

  try {
    switch(type) {
      case 'spin':
        const spinOsc = ctx.createOscillator();
        const spinGain = ctx.createGain();
        spinOsc.connect(spinGain);
        spinGain.connect(ctx.destination);
        spinOsc.frequency.setValueAtTime(200, ctx.currentTime);
        spinOsc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 2);
        spinOsc.type = 'sawtooth';
        spinGain.gain.setValueAtTime(0.2, ctx.currentTime);
        spinGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
        spinOsc.start(ctx.currentTime);
        spinOsc.stop(ctx.currentTime + 2);
        break;

      case 'win':
        const frequencies = [523.25, 659.25, 783.99];
        frequencies.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          const startTime = ctx.currentTime + (index * 0.1);
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
          osc.start(startTime);
          osc.stop(startTime + 0.5);
        });
        break;

      case 'lose':
        const loseOsc = ctx.createOscillator();
        const loseGain = ctx.createGain();
        loseOsc.connect(loseGain);
        loseGain.connect(ctx.destination);
        loseOsc.frequency.setValueAtTime(400, ctx.currentTime);
        loseOsc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
        loseOsc.type = 'sine';
        loseGain.gain.setValueAtTime(0.3, ctx.currentTime);
        loseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        loseOsc.start(ctx.currentTime);
        loseOsc.stop(ctx.currentTime + 0.3);
        break;
    }
  } catch (e) {
    console.log('Audio error:', e);
  }
}
