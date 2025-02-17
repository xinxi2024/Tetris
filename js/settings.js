class Settings {
    constructor() {
        // 默认设置
        this.defaultSettings = {
            bgColor: '#000000',
            bgImage: null,
            blockColors: {
                I: '#00f0f0',
                J: '#0000f0',
                L: '#f0a000',
                O: '#f0f000',
                S: '#00f000',
                T: '#a000f0',
                Z: '#f00000'
            },
            initialSpeed: 500,
            bgMusic: true,
            soundEffects: true,
            volume: 0.5
        };

        // 音效资源
        this.sounds = {
            move: new Audio('js/assets/sounds/move.mp3'),
            rotate: new Audio('js/assets/sounds/rotate.mp3'),
            drop: new Audio('js/assets/sounds/drop.mp3'),
            clear: new Audio('js/assets/sounds/clear.mp3'),
            gameOver: new Audio('js/assets/sounds/gameover.mp3'),
            bgMusic: new Audio('js/assets/sounds/bgmusic.mp3')
        };

        // 初始化设置
        this.currentSettings = {...this.defaultSettings};
        this.loadSettings();
        this.initializeUI();
        this.setupBgMusic();
        this.initAudio();
    }

    // 初始化UI事件
    initializeUI() {
        // 获取设置相关的DOM元素
        const modal = document.getElementById('settingsModal');
        const settingsBtn = document.getElementById('settingsBtn');
        const saveBtn = document.getElementById('saveSettings');
        
        // 背景设置
        const bgColorInput = document.getElementById('bgColor');
        const bgImageInput = document.getElementById('bgImage');
        
        // 音效设置
        const bgMusicCheckbox = document.getElementById('bgMusic');
        const soundEffectsCheckbox = document.getElementById('soundEffects');
        
        // 速度设置
        const speedInput = document.getElementById('speed');

        // 显示设置面板
        settingsBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            this.updateSettingsUI();
        });

        // 保存设置
        saveBtn.addEventListener('click', () => {
            this.saveSettings();
            modal.style.display = 'none';
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // 背景图片上传
        bgImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.currentSettings.bgImage = e.target.result;
                    this.applyBackgroundImage();
                };
                reader.readAsDataURL(file);
            }
        });

        // 其他设置变更
        bgColorInput.addEventListener('change', (e) => {
            this.currentSettings.bgColor = e.target.value;
            this.applyBackgroundColor();
        });

        speedInput.addEventListener('input', (e) => {
            this.currentSettings.initialSpeed = 1000 - e.target.value;
        });

        bgMusicCheckbox.addEventListener('change', (e) => {
            this.currentSettings.bgMusic = e.target.checked;
            this.toggleBgMusic();
        });

        soundEffectsCheckbox.addEventListener('change', (e) => {
            this.currentSettings.soundEffects = e.target.checked;
        });
    }

    // 更新设置UI显示
    updateSettingsUI() {
        document.getElementById('bgColor').value = this.currentSettings.bgColor;
        document.getElementById('speed').value = 1000 - this.currentSettings.initialSpeed;
        document.getElementById('bgMusic').checked = this.currentSettings.bgMusic;
        document.getElementById('soundEffects').checked = this.currentSettings.soundEffects;
    }

    // 保存设置到本地存储
    saveSettings() {
        localStorage.setItem('tetrisSettings', JSON.stringify(this.currentSettings));
        this.applySettings();
    }

    // 从本地存储加载设置
    loadSettings() {
        const savedSettings = localStorage.getItem('tetrisSettings');
        if (savedSettings) {
            this.currentSettings = {...this.defaultSettings, ...JSON.parse(savedSettings)};
        }
        this.applySettings();
    }

    // 应用设置
    applySettings() {
        this.applyBackgroundColor();
        this.applyBackgroundImage();
        this.toggleBgMusic();
    }

    // 应用背景颜色
    applyBackgroundColor() {
        const gameCanvas = document.getElementById('gameCanvas');
        gameCanvas.style.backgroundColor = this.currentSettings.bgColor;
    }

    // 应用背景图片
    applyBackgroundImage() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (this.currentSettings.bgImage) {
            gameCanvas.style.backgroundImage = `url(${this.currentSettings.bgImage})`;
            gameCanvas.style.backgroundSize = 'cover';
        } else {
            gameCanvas.style.backgroundImage = 'none';
        }
    }

    // 设置背景音乐
    setupBgMusic() {
        this.sounds.bgMusic.loop = true;
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.currentSettings.volume;
        });
    }

    // 切换背景音乐
    toggleBgMusic() {
        if (this.currentSettings.bgMusic) {
            this.sounds.bgMusic.play().catch(() => {
                // 处理自动播放限制
                console.log('Background music autoplay prevented');
            });
        } else {
            this.sounds.bgMusic.pause();
        }
    }

    // 播放音效
    playSound(soundName) {
        if (this.currentSettings.soundEffects && this.sounds[soundName]) {
            // 克隆音频对象以支持重叠播放
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.currentSettings.volume;
            sound.play().catch(() => {
                console.log(`Sound ${soundName} play prevented`);
            });
        }
    }

    // 初始化音频
    initAudio() {
        // 检查音频文件是否正确加载
        Object.entries(this.sounds).forEach(([name, audio]) => {
            audio.addEventListener('error', () => {
                console.error(`Error loading sound: ${name}`);
            });
            
            // 预加载音频
            audio.load();
        });

        // 添加用户交互时启用音频的处理
        document.addEventListener('click', () => {
            if (this.currentSettings.bgMusic) {
                this.sounds.bgMusic.play().catch(error => {
                    console.log('Background music play prevented:', error);
                });
            }
        }, { once: true });
    }
} 