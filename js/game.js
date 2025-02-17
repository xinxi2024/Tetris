class Game {
    constructor(gameCanvas, nextCanvas) {
        // 初始化画布
        this.gameCanvas = gameCanvas;
        this.nextCanvas = nextCanvas;
        this.ctx = gameCanvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        
        // 设置游戏画布大小
        this.gameCanvas.width = 300;
        this.gameCanvas.height = 600;
        this.nextCanvas.width = 100;
        this.nextCanvas.height = 100;
        
        // 游戏配置
        this.blockSize = 30; // 每个方块的大小
        this.cols = 10;      // 游戏区域列数
        this.rows = 20;      // 游戏区域行数
        
        // 游戏状态
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        
        // 游戏速度
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        
        // 初始化事件监听
        this.initializeEventListeners();

        this.settings = new Settings();
        this.effects = {
            particles: [],
            ghostPiece: null,
            flashLines: [],
            comboCount: 0,
            comboTimer: 0,
            shake: {
                intensity: 0,
                duration: 0
            }
        };
        
        // 绘制初始空游戏板
        this.draw();
    }

    // 初始化键盘事件监听
    initializeEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (this.gameOver || this.isPaused) return;
            
            switch(event.code) {
                case 'ArrowLeft':
                    this.moveCurrentPiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.moveCurrentPiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.moveCurrentPiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotateCurrentPiece();
                    break;
                case 'Space':
                    this.hardDrop();
                    break;
            }
        });
    }

    // 开始游戏
    start() {
        this.reset();
        this.generateNewPiece();
        this.gameLoop();
    }

    // 重置游戏状态
    reset() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        this.currentPiece = null;
        this.nextPiece = null;
    }

    // 生成新方块
    generateNewPiece() {
        this.currentPiece = this.nextPiece || Tetromino.randomTetromino();
        this.nextPiece = Tetromino.randomTetromino();
        
        // 检查游戏是否结束
        if (this.checkCollision(this.currentPiece)) {
            this.gameOver = true;
        }
    }

    // 碰撞检测
    checkCollision(piece, offsetX = 0, offsetY = 0) {
        const positions = piece.getOccupiedPositions();
        
        for (const pos of positions) {
            const newX = pos.x + offsetX;
            const newY = pos.y + offsetY;
            
            // 检查边界
            if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                return true;
            }
            
            // 检查与其他方块的碰撞
            if (newY >= 0 && this.board[newY][newX] !== null) {
                return true;
            }
        }
        
        return false;
    }

    // 移动当前方块
    moveCurrentPiece(dx, dy) {
        if (!this.currentPiece) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            if (dx !== 0) {
                this.settings.playSound('move');
            }
            return true;
        }
        
        // 如果是向下移动发生碰撞，则固定方块
        if (dy > 0) {
            this.lockPiece();
            this.settings.playSound('drop');
            this.clearLines();
            this.generateNewPiece();
        }
        
        return false;
    }

    // 旋转当前方块
    rotateCurrentPiece() {
        if (!this.currentPiece) return;
        
        const originalRotation = this.currentPiece.rotation;
        this.currentPiece.rotate();
        
        // 如果旋转后发生碰撞，则恢复原来的旋转状态
        if (this.checkCollision(this.currentPiece)) {
            this.currentPiece.rotation = originalRotation;
        }
        if (!this.checkCollision(this.currentPiece)) {
            this.settings.playSound('rotate');
        }
    }

    // 固定方块到游戏板
    lockPiece() {
        const positions = this.currentPiece.getOccupiedPositions();
        for (const pos of positions) {
            if (pos.y >= 0) {
                this.board[pos.y][pos.x] = {
                    type: this.currentPiece.type,
                    color: this.currentPiece.color
                };
            }
        }
    }

    // 清除完整的行
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== null)) {
                this.createClearLineEffect(row);
                this.addFlashEffect(row);
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(null));
                linesCleared++;
                row++;
            }
        }
        
        if (linesCleared > 0) {
            this.settings.playSound('clear');
            this.effects.comboCount++;
            this.effects.comboTimer = 1000;
            if (linesCleared >= 4) {
                this.addShakeEffect(8, 300);
            }
            this.updateScore(linesCleared);
        } else {
            this.effects.comboCount = 0;
        }
    }

    // 创建消行特效
    createClearLineEffect(row) {
        for (let col = 0; col < this.cols; col++) {
            for (let i = 0; i < 5; i++) {
                this.effects.particles.push({
                    x: col * this.blockSize + this.blockSize / 2,
                    y: row * this.blockSize + this.blockSize / 2,
                    dx: (Math.random() - 0.5) * 10,
                    dy: (Math.random() - 0.5) * 10,
                    size: Math.random() * 5 + 2,
                    alpha: 1,
                    color: this.board[row][col].color
                });
            }
        }
    }

    // 更新分数
    updateScore(linesCleared) {
        const linePoints = [0, 100, 300, 500, 800]; // 0,1,2,3,4行的分数
        this.score += linePoints[linesCleared] * this.level;
        
        // 更新等级
        this.level = Math.floor(this.score / 1000) + 1;
        // 更新下落速度
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
    }

    // 硬降（直接下落到底部）
    hardDrop() {
        while (this.moveCurrentPiece(0, 1)) {
            // 继续下落直到不能下落
        }
    }

    // 绘制游戏状态
    draw() {
        // 应用震动效果
        if (this.effects.shake.duration > 0) {
            const intensity = this.effects.shake.intensity * (this.effects.shake.duration / 300);
            this.ctx.save();
            this.ctx.translate(
                Math.random() * intensity - intensity / 2,
                Math.random() * intensity - intensity / 2
            );
        }

        // 清空画布
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        // 绘制幽灵方块
        if (this.effects.ghostPiece) {
            this.ctx.globalAlpha = 0.3;
            this.drawPiece(this.effects.ghostPiece, this.ctx);
            this.ctx.globalAlpha = 1;
        }

        // 绘制游戏板
        this.drawBoard();
        
        // 绘制当前方块
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        
        // 绘制下一个方块
        if (this.nextPiece) {
            this.drawNextPiece();
        }
        
        // 绘制粒子特效
        this.effects.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 绘制游戏结束状态
        if (this.gameOver) {
            this.settings.playSound('gameOver');
            this.drawGameOver();
        }

        // 绘制闪光效果
        this.effects.flashLines.forEach(flash => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flash.alpha})`;
            this.ctx.fillRect(
                0,
                flash.row * this.blockSize,
                this.gameCanvas.width,
                this.blockSize
            );
        });

        // 绘制连击提示
        if (this.effects.comboCount > 1 && this.effects.comboTimer > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.effects.comboTimer / 1000})`;
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `${this.effects.comboCount} COMBO!`,
                this.gameCanvas.width / 2,
                this.gameCanvas.height / 2
            );
        }

        // 恢复震动变换
        if (this.effects.shake.duration > 0) {
            this.ctx.restore();
        }
    }

    // 绘制游戏板
    drawBoard() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell) {
                    this.drawBlock(col, row, cell.color, this.ctx);
                }
            }
        }
    }

    // 绘制方块
    drawPiece(piece, context) {
        const shape = piece.getCurrentShape();
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.drawBlock(piece.x + col, piece.y + row, piece.color, context);
                }
            }
        }
    }

    // 绘制单个方块
    drawBlock(x, y, color, context) {
        const size = this.blockSize - 1;
        const xPos = x * this.blockSize;
        const yPos = y * this.blockSize;

        // 主体颜色
        context.fillStyle = color;
        context.fillRect(xPos, yPos, size, size);

        // 添加高光效果
        const gradient = context.createLinearGradient(xPos, yPos, xPos + size, yPos + size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        context.fillStyle = gradient;
        context.fillRect(xPos, yPos, size, size);

        // 添加边缘阴影
        context.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        context.strokeRect(xPos, yPos, size, size);
    }

    // 绘制下一个方块预览
    drawNextPiece() {
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * this.blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * this.blockSize) / 2;
        
        this.nextCtx.save();
        this.nextCtx.translate(offsetX, offsetY);
        this.drawPiece(this.nextPiece, this.nextCtx);
        this.nextCtx.restore();
    }

    // 绘制游戏结束画面
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', this.gameCanvas.width / 2, this.gameCanvas.height / 2);
        this.ctx.fillText(`得分: ${this.score}`, this.gameCanvas.width / 2, this.gameCanvas.height / 2 + 40);
    }

    // 游戏主循环
    gameLoop(timestamp = 0) {
        if (!this.gameOver && !this.isPaused) {
            // 处理方块下落
            if (timestamp - this.lastDropTime > this.dropInterval) {
                this.moveCurrentPiece(0, 1);
                this.lastDropTime = timestamp;
            }
            
            this.updateEffects();
            this.draw();
        }
        
        // 继续游戏循环
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    // 暂停/继续游戏
    togglePause() {
        this.isPaused = !this.isPaused;
    }

    // 更新和绘制特效
    updateEffects() {
        // 更新粒子
        this.effects.particles = this.effects.particles.filter(particle => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.alpha -= 0.02;
            return particle.alpha > 0;
        });

        // 更新闪光效果
        this.effects.flashLines = this.effects.flashLines.filter(flash => {
            flash.alpha -= 0.05;
            return flash.alpha > 0;
        });

        // 更新连击计时器
        if (this.effects.comboTimer > 0) {
            this.effects.comboTimer -= 16; // 假设 60fps
        }

        // 更新震动效果
        if (this.effects.shake.duration > 0) {
            this.effects.shake.duration -= 16;
        }

        // 更新幽灵方块
        if (this.currentPiece) {
            this.updateGhostPiece();
        }
    }

    // 更新幽灵方块位置
    updateGhostPiece() {
        this.effects.ghostPiece = this.currentPiece.clone();
        while (!this.checkCollision(this.effects.ghostPiece, 0, 1)) {
            this.effects.ghostPiece.y++;
        }
    }

    // 添加闪光效果
    addFlashEffect(row) {
        this.effects.flashLines.push({
            row,
            alpha: 1
        });
    }

    // 添加震动效果
    addShakeEffect(intensity = 5, duration = 200) {
        this.effects.shake = {
            intensity,
            duration
        };
    }
} 