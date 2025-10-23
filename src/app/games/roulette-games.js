class User {
    constructor() {
        if (User.instance) {
            return User.instance;
        }
        User.instance = this;
    }
    addBet(amount) {
        this.balance -= amount;
        this.totalWagered += amount;
        this.save();
        return this.balance;
    }
    addWinnings(amount) {
        this.balance += amount;
        if (amount > 0) this.wins++;
        else this.losses++;
        this.save();
        return this.balance;
    }
    save() {
        this.setCookie('rouletteBalance', this.balance, 30);
        localStorage.setItem('rouletteUser', JSON.stringify({
            balance: this.balance,
            totalWagered: this.totalWagered,
            wins: this.wins,
            losses: this.losses
        }));
    }
    load() {
        const saved = localStorage.getItem('rouletteUser');
        if (saved) {
            const data = JSON.parse(saved);
            this.balance = data.balance || 0;
            this.totalWagered = data.totalWagered || 0;
            this.wins = data.wins || 0;
            this.losses = data.losses || 0;
        } else {
            this.balance = 0;
            this.totalWagered = 0;
            this.wins = 0;
            this.losses = 0;
        }
    }
    setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    }
    getCookie(name) {
        return document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || '';
    }
    static getInstance() {
        return User.instance || new User();
    }
}

class RouletteGame {
    constructor() {
        this.user = User.getInstance();
        this.user.load();
        this.currentChip = 10;
        this.bets = [];
        this.numbers = Array.from({length: 37}, (_, i) => i);
        this.isSpinning = false;
        this.wheelCanvas = null;
        this.wheelCtx = null;
        this.init();
    }
    init() {
        this.wheelCanvas = document.getElementById('wheelCanvas');
        this.wheelCtx = this.wheelCanvas.getContext('2d');
        this.drawWheel();
        this.updateDisplay();
        this.buildBetTable();
        this.setupEvents();
    }
    updateDisplay() {
        document.getElementById('balance').textContent = this.user.balance.toFixed(0);
        document.getElementById('currentBet').textContent = this.currentChip;
        document.getElementById('totalBet').textContent = `Total Bet: $${this.getTotalBet()}`;
    }
    drawWheel() {
        const canvas = this.wheelCanvas;
        const ctx = this.wheelCtx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 170;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const angleStep = (Math.PI * 2) / 37;
        
        this.numbers.forEach((num, index) => {
            const startAngle = index * angleStep;
            const endAngle = (index + 1) * angleStep;
            const isZero = num === 0;
            const isRed = !isZero && [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num);
            ctx.fillStyle = isZero ? '#016d29' : (isRed ? '#e0080b' : '#000');
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + angleStep / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.font = num === 0 ? 'bold 22px Geist' : 'bold 18px Geist';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(num.toString(), radius * 0.65, 0);
            ctx.restore();
        });
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
        ctx.strokeStyle = '#000';
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
    buildBetTable() {
        const table = document.getElementById('betTable');
        table.innerHTML = '';
        this.numbers.forEach(num => {
            const cell = document.createElement('div');
            cell.className = 'bet-cell';
            cell.dataset.number = num;
            cell.textContent = num;
            cell.addEventListener('click', (e) => this.placeBet(num, e));
            table.appendChild(cell);
        });
    }
    setupEvents() {
        document.querySelectorAll('.chip-btn:not(.clear-btn)').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentChip = parseInt(btn.dataset.chip);
                this.updateDisplay();
            });
        });
        document.querySelector('.clear-btn').addEventListener('click', () => {
            document.querySelectorAll('.bet-cell').forEach(cell => cell.classList.remove('bet-placed'));
            this.bets = [];
            this.updateDisplay();
        });
        document.getElementById('spinBtn').addEventListener('click', () => this.spinWheel());
        document.getElementById('quickSpin')?.addEventListener('click', () => this.spinWheel());
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.spinWheel();
                    break;
                case 'Escape':
                    document.querySelector('.clear-btn').click();
                    break;
                case 'c':
                case 'C':
                    document.querySelector('.clear-btn').click();
                    break;
            }
        });
    }
    placeBet(number, event) {
        if (this.currentChip > this.user.balance || this.isSpinning) {
            document.getElementById('resultMessage').textContent = 'Insufficient funds or wheel spinning!';
            this.playSound('lose');
            return;
        }
        this.user.addBet(this.currentChip);
        this.bets.push({number, amount: this.currentChip});
        event.target.classList.add('bet-placed');
        
        this.updateDisplay();
    }
    getTotalBet() {
        return this.bets.reduce((sum, bet) => sum + bet.amount, 0);
    }
    spinWheel() {
        if (this.bets.length === 0) {
            document.getElementById('resultMessage').textContent = 'Place your bets first!';
            return;
        }
        this.isSpinning = true;
        const btn = document.getElementById('spinBtn');
        btn.disabled = true;
        btn.style.opacity = '0.7';
        document.getElementById('resultMessage').textContent = 'SPINNING...';
        const spins = 5 + Math.random() * 3;
        const finalRotation = spins * 360 + Math.random() * 360;
        
        let start = 0;
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
        let winnings = 0;
        this.bets.forEach(bet => {
            if (bet.number === result) winnings += bet.amount * 35;
        });
        this.user.addWinnings(winnings);
        this.updateDisplay();
        if (winnings > 0) {
            document.getElementById('resultMessage').textContent = `${result} | +$${winnings.toLocaleString()}`;
            this.playSound('win');
        } else {
            document.getElementById('resultMessage').textContent = `${result} | Loss`;
            this.playSound('lose');
        }
        document.querySelectorAll('.bet-cell').forEach(cell => cell.classList.remove('bet-placed'));
        this.bets = [];
        document.getElementById('spinBtn').disabled = false;
        document.getElementById('spinBtn').style.opacity = '1';
        this.isSpinning = false;
        
        setTimeout(() => {
            this.wheelCanvas.style.transform = 'rotate(0deg)';
        }, 200);
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