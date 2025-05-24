class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.playerScoreElement = document.getElementById('playerScore');
        this.cpuScoreElement = document.getElementById('cpuScore');
        this.player1Label = document.getElementById('player1Label');
        this.player2Label = document.getElementById('player2Label');
        this.startButton = document.getElementById('startButton');
        this.resetButton = document.getElementById('resetButton');
        this.pvpModeButton = document.getElementById('pvpMode');
        this.pvcModeButton = document.getElementById('pvcMode');
        this.pvcInstructions = document.getElementById('pvcInstructions');
        this.pvpInstructions = document.getElementById('pvpInstructions');

        // Game constants
        this.paddleWidth = 15;
        this.paddleHeight = 100;
        this.ballSize = 15;
        this.paddleSpeed = 8;
        this.initialBallSpeed = 5;

        // Game state
        this.playerScore = 0;
        this.cpuScore = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.animationId = null;
        this.mouseY = 0;
        this.isMouseControl = false;
        this.particles = [];
        this.explosionColors = ['#00fffc', '#ff00ff', '#ffffff'];
        this.isPvPMode = false; // New game mode state

        // Initialize game objects
        this.initGameObjects();
        this.setupEventListeners();
        this.draw();
    }

    initGameObjects() {
        this.playerPaddle = {
            x: 30,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            dy: 0
        };

        this.cpuPaddle = {
            x: this.canvas.width - 30 - this.paddleWidth,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            dy: 0
        };

        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: this.ballSize,
            dx: this.initialBallSpeed,
            dy: this.initialBallSpeed
        };
    } setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.startButton.addEventListener('click', () => this.startGame());
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.pvpModeButton.addEventListener('click', () => this.switchToPvP());
        this.pvcModeButton.addEventListener('click', () => this.switchToPvC());
    } handleKeyDown(e) {
        if (this.isPvPMode) {
            // PvP mode: Player 1 uses W/S, Player 2 uses Arrow Up/Down
            switch (e.key.toLowerCase()) {
                case 'w':
                    this.playerPaddle.dy = -this.paddleSpeed;
                    this.isMouseControl = false;
                    break;
                case 's':
                    this.playerPaddle.dy = this.paddleSpeed;
                    this.isMouseControl = false;
                    break;
                case 'arrowup':
                    this.cpuPaddle.dy = -this.paddleSpeed;
                    break;
                case 'arrowdown':
                    this.cpuPaddle.dy = this.paddleSpeed;
                    break;
            }
        } else {
            // PvC mode: Player uses Arrow Up/Down or mouse
            switch (e.key) {
                case 'ArrowUp':
                    this.playerPaddle.dy = -this.paddleSpeed;
                    this.isMouseControl = false;
                    break;
                case 'ArrowDown':
                    this.playerPaddle.dy = this.paddleSpeed;
                    this.isMouseControl = false;
                    break;
            }
        }
    } handleKeyUp(e) {
        if (this.isPvPMode) {
            // PvP mode key releases
            if (e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 's') {
                this.playerPaddle.dy = 0;
            }
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                this.cpuPaddle.dy = 0;
            }
        } else {
            // PvC mode key releases
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                this.playerPaddle.dy = 0;
            }
        }
    } handleMouseMove(e) {
        // Only allow mouse control in PvC mode
        if (!this.isPvPMode) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = e.clientY - rect.top;
            this.isMouseControl = true;
        }
    }

    switchToPvP() {
        this.isPvPMode = true;
        this.isMouseControl = false;
        this.resetGame();

        // Update UI
        this.pvpModeButton.classList.add('active');
        this.pvcModeButton.classList.remove('active');
        this.player1Label.textContent = 'PLAYER 1';
        this.player2Label.textContent = 'PLAYER 2';
        this.pvcInstructions.classList.add('hidden');
        this.pvpInstructions.classList.remove('hidden');
    }

    switchToPvC() {
        this.isPvPMode = false;
        this.resetGame();

        // Update UI
        this.pvcModeButton.classList.add('active');
        this.pvpModeButton.classList.remove('active');
        this.player1Label.textContent = 'PLAYER 1';
        this.player2Label.textContent = 'CPU';
        this.pvpInstructions.classList.add('hidden');
        this.pvcInstructions.classList.remove('hidden');
    }

    drawPaddle(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);

        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.shadowBlur = 0;
    }

    drawBall(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawNet() {
        this.ctx.strokeStyle = '#00fffc';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawField() {
        this.ctx.strokeStyle = '#00fffc';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 50, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#00fffc';
        this.ctx.font = '48px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50); this.ctx.font = '24px Orbitron';
        let winner;
        if (this.isPvPMode) {
            winner = this.playerScore > this.cpuScore ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!';
        } else {
            winner = this.playerScore > this.cpuScore ? 'PLAYER WINS!' : 'CPU WINS!';
        }
        this.ctx.fillText(winner, this.canvas.width / 2, this.canvas.height / 2 + 20);

        this.ctx.font = '16px Orbitron';
        this.ctx.fillText('Click RESET to play again', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawField();
        this.drawNet();

        this.drawPaddle(this.playerPaddle.x, this.playerPaddle.y, this.playerPaddle.width, this.playerPaddle.height, '#00fffc');
        this.drawPaddle(this.cpuPaddle.x, this.cpuPaddle.y, this.cpuPaddle.width, this.cpuPaddle.height, '#ff00ff');

        this.drawBall(this.ball.x, this.ball.y, this.ball.size, '#ffffff');

        // Draw particles
        this.drawParticles();

        this.playerScoreElement.textContent = this.playerScore;
        this.cpuScoreElement.textContent = this.cpuScore;

        if (this.gameOver) {
            this.drawGameOver();
        }
    }

    update() {
        if (!this.gameRunning || this.gameOver) return;

        // Update particles
        this.updateParticles();

        // Move player paddle
        if (this.isMouseControl) {
            this.playerPaddle.y = this.mouseY - this.playerPaddle.height / 2;
        } else {
            this.playerPaddle.y += this.playerPaddle.dy;
        }        // Boundary check for player paddle
        if (this.playerPaddle.y < 0) {
            this.playerPaddle.y = 0;
        } else if (this.playerPaddle.y + this.playerPaddle.height > this.canvas.height) {
            this.playerPaddle.y = this.canvas.height - this.playerPaddle.height;
        }

        // Move CPU paddle (AI in PvC mode, Player 2 controls in PvP mode)
        if (!this.isPvPMode) {
            // AI control
            const cpuPaddleCenter = this.cpuPaddle.y + this.cpuPaddle.height / 2;
            if (cpuPaddleCenter < this.ball.y - 10) {
                this.cpuPaddle.dy = this.paddleSpeed * 0.7;
            } else if (cpuPaddleCenter > this.ball.y + 10) {
                this.cpuPaddle.dy = -this.paddleSpeed * 0.7;
            } else {
                this.cpuPaddle.dy = 0;
            }
        }
        // In PvP mode, cpuPaddle.dy is controlled directly by key events

        this.cpuPaddle.y += this.cpuPaddle.dy;

        // Boundary check for CPU paddle
        if (this.cpuPaddle.y < 0) {
            this.cpuPaddle.y = 0;
        } else if (this.cpuPaddle.y + this.cpuPaddle.height > this.canvas.height) {
            this.cpuPaddle.y = this.canvas.height - this.cpuPaddle.height;
        }

        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with top and bottom walls
        if (this.ball.y - this.ball.size < 0 || this.ball.y + this.ball.size > this.canvas.height) {
            this.ball.dy = -this.ball.dy;
        }

        // Ball collision with paddles
        if (
            this.ball.x - this.ball.size < this.playerPaddle.x + this.playerPaddle.width &&
            this.ball.x + this.ball.size > this.playerPaddle.x &&
            this.ball.y + this.ball.size > this.playerPaddle.y &&
            this.ball.y - this.ball.size < this.playerPaddle.y + this.playerPaddle.height
        ) {
            const hitPosition = (this.ball.y - (this.playerPaddle.y + this.playerPaddle.height / 2)) / (this.playerPaddle.height / 2);
            this.ball.dx = Math.abs(this.ball.dx) * 1.05;
            this.ball.dy = hitPosition * 7;

            // Create explosion at contact point
            this.createExplosion(this.ball.x, this.ball.y, '#00fffc');
        }

        if (
            this.ball.x + this.ball.size > this.cpuPaddle.x &&
            this.ball.x - this.ball.size < this.cpuPaddle.x + this.cpuPaddle.width &&
            this.ball.y + this.ball.size > this.cpuPaddle.y &&
            this.ball.y - this.ball.size < this.cpuPaddle.y + this.cpuPaddle.height
        ) {
            const hitPosition = (this.ball.y - (this.cpuPaddle.y + this.cpuPaddle.height / 2)) / (this.cpuPaddle.height / 2);
            this.ball.dx = -Math.abs(this.ball.dx) * 1.05;
            this.ball.dy = hitPosition * 7;

            // Create explosion at contact point
            this.createExplosion(this.ball.x, this.ball.y, '#ff00ff');
        }

        // Ball out of bounds (score)
        if (this.ball.x - this.ball.size < 0) {
            this.cpuScore++;
            if (this.cpuScore >= 10) {
                this.gameOver = true;
                this.gameRunning = false;
            }
            this.resetBall();
            this.ball.dx = -this.initialBallSpeed;
        } else if (this.ball.x + this.ball.size > this.canvas.width) {
            this.playerScore++;
            if (this.playerScore >= 10) {
                this.gameOver = true;
                this.gameRunning = false;
            }
            this.resetBall();
            this.ball.dx = this.initialBallSpeed;
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;

        const angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
        this.ball.dx = this.initialBallSpeed * (this.ball.dx > 0 ? 1 : -1);
        this.ball.dy = Math.sin(angle) * this.initialBallSpeed;

        this.gameRunning = false;
        setTimeout(() => {
            this.gameRunning = true;
        }, 1000);
    } resetGame() {
        this.playerScore = 0;
        this.cpuScore = 0;
        this.resetBall();
        this.playerPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.playerPaddle.dy = 0; // Reset paddle movement
        this.cpuPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.cpuPaddle.dy = 0; // Reset paddle movement
        this.gameRunning = false;
        this.gameOver = false;
        this.startButton.classList.add('pulse');
        this.particles = []; // Clear particles on reset
    }

    gameLoop() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.startButton.classList.remove('pulse');
            if (!this.animationId) {
                this.gameLoop();
            }
        }
    }

    createExplosion(x, y, color) {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = Math.random() * 3 + 1;
            const size = Math.random() * 3 + 1;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.drawBall(p.x, p.y, p.size, p.color);
        });
        this.ctx.globalAlpha = 1.0;
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
}); 