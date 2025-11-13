const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

class RouletteGame {
    constructor() {
        this.numbers = Array.from({length: 37}, (_, i) => i);
        this.isSpinning = false;
        this.wheelCanvas = null;
        this.wheelCtx = null;
        this.currentBet = 0;
        this.currentChoice = 'red';
        this.userApi = null;
        this.unsubscribeUserChange = null;
        this.balanceEl = document.getElementById('rouletteTokenBalance');
        this.betAmountInput = document.getElementById('rouletteBetAmount');
        this.betChoiceSelect = document.getElementById('rouletteBetChoice');
        this.betErrorEl = document.getElementById('rouletteBetError');
        this.resultMessageEl = document.getElementById('resultMessage');
        this.init();
        this.refreshBalance();
    }

    getUserApi() {
        if (!this.userApi && window.htmlCasinoUser) {
            this.userApi = window.htmlCasinoUser;
        }

        if (this.userApi && !this.unsubscribeUserChange && typeof this.userApi.onChange === 'function') {
            this.unsubscribeUserChange = this.userApi.onChange(() => this.refreshBalance());
        }

        return this.userApi;
    }

    refreshBalance() {
        const api = this.getUserApi();
        if (!this.balanceEl || !api || typeof api.getUserSnapshot !== 'function') return;
        const snapshot = api.getUserSnapshot();
        this.balanceEl.textContent = snapshot.balance;
    }

    hideBetError() {
        if (this.betErrorEl) {
            this.betErrorEl.style.display = 'none';
        }
    }

    showBetError(message) {
        if (this.betErrorEl) {
            this.betErrorEl.textContent = message;
            this.betErrorEl.style.display = 'block';
        }
    }

    getColorForNumber(number) {
        if (number === 0) return 'green';
        return RED_NUMBERS.has(number) ? 'red' : 'black';
    }

    init() {
        this.wheelCanvas = document.getElementById('wheelCanvas');
        this.wheelCtx = this.wheelCanvas.getContext('2d');
        this.drawWheel();
        this.setupEvents();
        this.getUserApi();
        this.hideBetError();
    }

    drawWheel() {
        const canvas = this.wheelCanvas;
        const ctx = this.wheelCtx;
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

        this.numbers.forEach((num, index) => {
            const startAngle = index * angleStep;
            const endAngle = (index + 1) * angleStep;
            const isZero = num === 0;
            const isRed = !isZero && RED_NUMBERS.has(num);
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

    setupEvents() {
        document.getElementById('spinBtn').addEventListener('click', () => this.spinWheel());
        document.getElementById('quickSpin').addEventListener('click', () => this.spinWheel());
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.spinWheel();
            }
        });
        if (this.betAmountInput) {
            this.betAmountInput.addEventListener('input', () => this.hideBetError());
        }
        if (this.betChoiceSelect) {
            this.betChoiceSelect.addEventListener('change', () => this.hideBetError());
        }
    }

    spinWheel() {
        if (this.isSpinning) return;

        const api = this.getUserApi();
        if (!api || typeof api.spendTokens !== 'function') {
            showToastMessage('Tokens unavailable', 'We could not access your casino wallet. Try refreshing the page.');
            return;
        }

        const betAmount = Math.floor(Number(this.betAmountInput ? this.betAmountInput.value : 0));
        if (!Number.isFinite(betAmount) || betAmount <= 0) {
            this.showBetError('Enter a positive bet amount.');
            return;
        }

        const spendResult = api.spendTokens(betAmount, { silent: true });
        if (!spendResult || !spendResult.success) {
            this.showBetError('Not enough tokens for this bet.');
            this.refreshBalance();
            return;
        }

        this.currentBet = betAmount;
        this.currentChoice = this.betChoiceSelect ? this.betChoiceSelect.value : 'red';
        this.hideBetError();
        this.refreshBalance();

        this.isSpinning = true;
        const btn = document.getElementById('spinBtn');
        btn.disabled = true;
        btn.style.opacity = '0.7';
        if (this.resultMessageEl) {
            this.resultMessageEl.textContent = 'SPINNING...';
            this.resultMessageEl.classList.remove('win-animation');
        } else {
            document.getElementById('resultMessage').textContent = 'SPINNING...';
        }
        const spins = 5 + Math.random() * 3;
        const finalRotation = spins * 360 + Math.random() * 360;

        const duration = 4500;
        const startTime = performance.now();
        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const rotation = finalRotation * easeOut;
            this.wheelCanvas.style.transform = `rotate(${rotation}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
        this.playSound('spin');
        setTimeout(() => this.processResult(finalRotation % 360), 4500);
    }

    processResult(finalAngle) {
        const normalizedRad = (360 - finalAngle) * Math.PI / 180;
        const angleStep = (Math.PI * 2) / 37;
        const resultIndex = Math.floor(normalizedRad / angleStep) % 37;
        const result = this.numbers[resultIndex];
        const color = this.getColorForNumber(result);
        if (this.resultMessageEl) {
            this.resultMessageEl.textContent = `Result: ${result} (${color.toUpperCase()})`;
        } else {
            document.getElementById('resultMessage').textContent = `Result: ${result}`;
        }
        this.playSound(Math.random() > 0.5 ? 'win' : 'lose');
        document.getElementById('spinBtn').disabled = false;
        document.getElementById('spinBtn').style.opacity = '1';
        this.isSpinning = false;

        setTimeout(() => {
            this.wheelCanvas.style.transform = 'rotate(0deg)';
        }, 200);

        this.handleBetOutcome(result);
    }

    handleBetOutcome(result) {
        if (!this.currentBet) {
            this.refreshBalance();
            return;
        }

        const api = this.getUserApi();
        if (!api || typeof api.addTokens !== 'function') {
            this.currentBet = 0;
            this.refreshBalance();
            return;
        }

        const color = this.getColorForNumber(result);
        let payout = 0;

        if ((this.currentChoice === 'red' || this.currentChoice === 'black') && color === this.currentChoice) {
            payout = this.currentBet * 2;
        } else if (this.currentChoice === 'green' && color === 'green') {
            payout = this.currentBet * 15;
        }

        if (payout > 0) {
            api.addTokens(payout, { silent: true });
            if (typeof showToastMessage === 'function') {
                showToastMessage('Roulette win!', `+${payout} tokens added to your balance.`);
            }
            if (this.resultMessageEl) {
                this.resultMessageEl.classList.add('win-animation');
                setTimeout(() => this.resultMessageEl && this.resultMessageEl.classList.remove('win-animation'), 800);
            }
        } else {
            if (typeof showToastMessage === 'function') {
                showToastMessage('Roulette loss', `-${this.currentBet} tokens lost on this spin.`);
            }
        }

        this.currentBet = 0;
        this.refreshBalance();
    }

    playSound(type) {
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
}

document.addEventListener('DOMContentLoaded', () => {
    new RouletteGame();
});