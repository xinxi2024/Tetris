class Tetromino {
    // 定义所有方块形状
    static SHAPES = {
        I: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        J: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        L: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        O: [
            [1, 1],
            [1, 1]
        ],
        S: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        T: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        Z: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ]
    };

    // 定义方块颜色
    static COLORS = {
        I: '#00f0f0',
        J: '#0000f0',
        L: '#f0a000',
        O: '#f0f000',
        S: '#00f000',
        T: '#a000f0',
        Z: '#f00000'
    };

    constructor(type) {
        this.type = type;
        this.shape = Tetromino.SHAPES[type];
        this.color = Tetromino.COLORS[type];
        this.x = 3;  // 初始 x 位置
        this.y = 0;  // 初始 y 位置
        this.rotation = 0;  // 当前旋转状态
    }

    // 获取当前形状的矩阵
    getCurrentShape() {
        return this.rotateMatrix(this.shape, this.rotation);
    }

    // 矩阵旋转
    rotateMatrix(matrix, times = 1) {
        let rotated = matrix;
        for (let i = 0; i < times % 4; i++) {
            rotated = this.rotate90Degrees(rotated);
        }
        return rotated;
    }

    // 90度旋转矩阵
    rotate90Degrees(matrix) {
        const N = matrix.length;
        const rotated = Array.from({ length: N }, () => Array(N).fill(0));
        
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                rotated[j][N - 1 - i] = matrix[i][j];
            }
        }
        return rotated;
    }

    // 向左移动
    moveLeft() {
        this.x--;
    }

    // 向右移动
    moveRight() {
        this.x++;
    }

    // 向下移动
    moveDown() {
        this.y++;
    }

    // 旋转
    rotate() {
        this.rotation = (this.rotation + 1) % 4;
    }

    // 获取所有实际占用的格子坐标
    getOccupiedPositions() {
        const positions = [];
        const shape = this.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    positions.push({
                        x: this.x + col,
                        y: this.y + row
                    });
                }
            }
        }
        
        return positions;
    }

    // 克隆当前方块
    clone() {
        const cloned = new Tetromino(this.type);
        cloned.x = this.x;
        cloned.y = this.y;
        cloned.rotation = this.rotation;
        return cloned;
    }

    // 随机生成一个新方块
    static randomTetromino() {
        const types = Object.keys(Tetromino.SHAPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        return new Tetromino(randomType);
    }
} 