document.addEventListener('DOMContentLoaded', () => {
    // 获取画布元素
    const gameCanvas = document.getElementById('gameCanvas');
    const nextCanvas = document.getElementById('nextCanvas');
    
    // 初始化游戏实例
    const game = new Game(gameCanvas, nextCanvas);
    
    // 获取按钮元素
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    
    // 开始游戏按钮
    startBtn.addEventListener('click', () => {
        game.start();
        startBtn.textContent = '重新开始';
    });
    
    // 暂停按钮
    pauseBtn.addEventListener('click', () => {
        game.togglePause();
        pauseBtn.textContent = game.isPaused ? '继续' : '暂停';
    });
    
    // 更新分数和等级显示
    function updateDisplay() {
        scoreElement.textContent = game.score;
        levelElement.textContent = game.level;
        requestAnimationFrame(updateDisplay);
    }
    
    // 开始更新显示
    updateDisplay();

    // 移动端控制
    const mobileControls = {
        leftBtn: document.getElementById('leftBtn'),
        rightBtn: document.getElementById('rightBtn'),
        downBtn: document.getElementById('downBtn'),
        rotateBtn: document.getElementById('rotateBtn'),
        dropBtn: document.getElementById('dropBtn')
    };

    // 按钮控制
    mobileControls.leftBtn.addEventListener('click', () => {
        if (!game.gameOver && !game.isPaused) {
            game.moveCurrentPiece(-1, 0);
        }
    });

    mobileControls.rightBtn.addEventListener('click', () => {
        if (!game.gameOver && !game.isPaused) {
            game.moveCurrentPiece(1, 0);
        }
    });

    mobileControls.downBtn.addEventListener('click', () => {
        if (!game.gameOver && !game.isPaused) {
            game.moveCurrentPiece(0, 1);
        }
    });

    mobileControls.rotateBtn.addEventListener('click', () => {
        if (!game.gameOver && !game.isPaused) {
            game.rotateCurrentPiece();
        }
    });

    mobileControls.dropBtn.addEventListener('click', () => {
        if (!game.gameOver && !game.isPaused) {
            game.hardDrop();
        }
    });

    // 添加触摸滑动控制
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30; // 最小滑动距离

    gameCanvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    gameCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // 防止页面滚动
    });

    gameCanvas.addEventListener('touchend', (e) => {
        if (game.gameOver || game.isPaused) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // 判断滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    game.moveCurrentPiece(1, 0); // 右滑
                } else {
                    game.moveCurrentPiece(-1, 0); // 左滑
                }
            }
        } else {
            // 垂直滑动
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    game.moveCurrentPiece(0, 1); // 下滑
                } else {
                    game.rotateCurrentPiece(); // 上滑旋转
                }
            }
        }
    });
}); 