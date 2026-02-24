// Tetris Game - fully playable classic Tetris
const TetrisGameApp = () => {
    const COLS = 10, ROWS = 20, CELL = 24;
    const canvasRef = React.useRef(null);
    const nextRef = React.useRef(null);
    const gameRef = React.useRef(null);
    const [score, setScore] = React.useState(0);
    const [level, setLevel] = React.useState(1);
    const [lines, setLines] = React.useState(0);
    const [gameOver, setGameOver] = React.useState(false);
    const [started, setStarted] = React.useState(false);
    const [highScore, setHighScore] = React.useState(() => { try { return parseInt(localStorage.getItem('macos_tetris_high') || '0'); } catch(e) { return 0; } });

    const PIECES = [
        { shape: [[1,1,1,1]], color: '#00BCD4' },           // I
        { shape: [[1,1],[1,1]], color: '#FFD60A' },          // O
        { shape: [[0,1,0],[1,1,1]], color: '#AF52DE' },      // T
        { shape: [[1,0],[1,0],[1,1]], color: '#FF9500' },     // L
        { shape: [[0,1],[0,1],[1,1]], color: '#007AFF' },     // J
        { shape: [[0,1,1],[1,1,0]], color: '#34C759' },       // S
        { shape: [[1,1,0],[0,1,1]], color: '#FF3B30' },       // Z
    ];

    const rotate = (matrix) => matrix[0].map((_, i) => matrix.map(r => r[i]).reverse());

    const initGame = () => {
        const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        const piece = PIECES[Math.floor(Math.random() * PIECES.length)];
        const next = PIECES[Math.floor(Math.random() * PIECES.length)];
        gameRef.current = {
            board, piece: piece.shape, color: piece.color,
            nextPiece: next, px: Math.floor(COLS / 2) - 1, py: 0,
            score: 0, level: 1, lines: 0, running: true, interval: null,
        };
        setScore(0); setLevel(1); setLines(0); setGameOver(false); setStarted(true);
        const g = gameRef.current;
        if (g.interval) clearInterval(g.interval);
        g.interval = setInterval(() => drop(), getSpeed(1));
    };

    const getSpeed = (lvl) => Math.max(100, 800 - (lvl - 1) * 70);

    const collides = (board, shape, px, py) => {
        for (let r = 0; r < shape.length; r++)
            for (let c = 0; c < shape[r].length; c++)
                if (shape[r][c]) {
                    const nx = px + c, ny = py + r;
                    if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                    if (ny >= 0 && board[ny][nx]) return true;
                }
        return false;
    };

    const merge = (board, shape, color, px, py) => {
        const b = board.map(r => [...r]);
        for (let r = 0; r < shape.length; r++)
            for (let c = 0; c < shape[r].length; c++)
                if (shape[r][c] && py + r >= 0) b[py + r][px + c] = color;
        return b;
    };

    const clearLines = (board) => {
        let cleared = 0;
        const b = board.filter(row => { if (row.every(c => c)) { cleared++; return false; } return true; });
        while (b.length < ROWS) b.unshift(Array(COLS).fill(0));
        return { board: b, cleared };
    };

    const drop = () => {
        const g = gameRef.current;
        if (!g || !g.running) return;
        if (!collides(g.board, g.piece, g.px, g.py + 1)) {
            g.py++;
        } else {
            // Lock piece
            g.board = merge(g.board, g.piece, g.color, g.px, g.py);
            const { board: nb, cleared } = clearLines(g.board);
            g.board = nb;
            g.lines += cleared;
            const pts = [0, 100, 300, 500, 800];
            g.score += (pts[cleared] || 0) * g.level;
            g.level = Math.floor(g.lines / 10) + 1;
            setScore(g.score); setLines(g.lines); setLevel(g.level);

            // Speed up
            clearInterval(g.interval);
            g.interval = setInterval(() => drop(), getSpeed(g.level));

            // Next piece
            const np = g.nextPiece;
            g.piece = np.shape;
            g.color = np.color;
            g.px = Math.floor(COLS / 2) - 1;
            g.py = 0;
            g.nextPiece = PIECES[Math.floor(Math.random() * PIECES.length)];

            if (collides(g.board, g.piece, g.px, g.py)) {
                g.running = false;
                clearInterval(g.interval);
                setGameOver(true);
                if (g.score > parseInt(localStorage.getItem('macos_tetris_high') || '0')) {
                    localStorage.setItem('macos_tetris_high', g.score.toString());
                    setHighScore(g.score);
                }
            }
        }
        draw();
    };

    const draw = () => {
        const canvas = canvasRef.current;
        const g = gameRef.current;
        if (!canvas || !g) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,ROWS*CELL); ctx.stroke(); }
        for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(COLS*CELL,y*CELL); ctx.stroke(); }

        // Board
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                if (g.board[r][c]) {
                    ctx.fillStyle = g.board[r][c];
                    ctx.beginPath(); ctx.roundRect(c*CELL+1, r*CELL+1, CELL-2, CELL-2, 3); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.15)';
                    ctx.fillRect(c*CELL+2, r*CELL+2, CELL-4, 3);
                }

        // Ghost piece
        let gy = g.py;
        while (!collides(g.board, g.piece, g.px, gy + 1)) gy++;
        if (gy !== g.py) {
            ctx.globalAlpha = 0.2;
            for (let r = 0; r < g.piece.length; r++)
                for (let c = 0; c < g.piece[r].length; c++)
                    if (g.piece[r][c]) {
                        ctx.fillStyle = g.color;
                        ctx.fillRect((g.px+c)*CELL+1, (gy+r)*CELL+1, CELL-2, CELL-2);
                    }
            ctx.globalAlpha = 1;
        }

        // Current piece
        for (let r = 0; r < g.piece.length; r++)
            for (let c = 0; c < g.piece[r].length; c++)
                if (g.piece[r][c] && g.py + r >= 0) {
                    ctx.fillStyle = g.color;
                    ctx.beginPath(); ctx.roundRect((g.px+c)*CELL+1, (g.py+r)*CELL+1, CELL-2, CELL-2, 3); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect((g.px+c)*CELL+2, (g.py+r)*CELL+2, CELL-4, 3);
                }

        // Next piece preview
        const nctx = nextRef.current?.getContext('2d');
        if (nctx && g.nextPiece) {
            nctx.fillStyle = '#1a1a2e';
            nctx.fillRect(0, 0, 100, 80);
            const np = g.nextPiece;
            const ox = (100 - np.shape[0].length * 18) / 2;
            const oy = (80 - np.shape.length * 18) / 2;
            for (let r = 0; r < np.shape.length; r++)
                for (let c = 0; c < np.shape[r].length; c++)
                    if (np.shape[r][c]) {
                        nctx.fillStyle = np.color;
                        nctx.beginPath(); nctx.roundRect(ox + c*18+1, oy + r*18+1, 16, 16, 2); nctx.fill();
                    }
        }
    };

    React.useEffect(() => {
        const handleKey = (e) => {
            const g = gameRef.current;
            if (!g || !g.running) return;
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                if (!collides(g.board, g.piece, g.px - 1, g.py)) { g.px--; draw(); }
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                if (!collides(g.board, g.piece, g.px + 1, g.py)) { g.px++; draw(); }
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                drop();
            } else if (e.key === 'ArrowUp' || e.key === 'w') {
                const rotated = rotate(g.piece);
                if (!collides(g.board, rotated, g.px, g.py)) { g.piece = rotated; draw(); }
                else if (!collides(g.board, rotated, g.px - 1, g.py)) { g.piece = rotated; g.px--; draw(); }
                else if (!collides(g.board, rotated, g.px + 1, g.py)) { g.piece = rotated; g.px++; draw(); }
            } else if (e.key === ' ') {
                while (!collides(g.board, g.piece, g.px, g.py + 1)) g.py++;
                drop();
            }
            e.preventDefault();
        };
        window.addEventListener('keydown', handleKey);
        return () => { window.removeEventListener('keydown', handleKey); if (gameRef.current?.interval) clearInterval(gameRef.current.interval); };
    }, []);

    React.useEffect(() => { draw(); }, []);

    return (
        <div className="flex flex-col h-full bg-[#0f0f23]">
            <div className="flex-1 flex items-center justify-center gap-6 p-4 relative">
                <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="rounded-lg border border-white/10"/>
                <div className="flex flex-col gap-4 w-[120px]">
                    <div className="bg-[#16162e] rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Score</div>
                        <div className="text-white text-[18px] font-bold">{score}</div>
                    </div>
                    <div className="bg-[#16162e] rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Level</div>
                        <div className="text-cyan-400 text-[18px] font-bold">{level}</div>
                    </div>
                    <div className="bg-[#16162e] rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Lines</div>
                        <div className="text-purple-400 text-[18px] font-bold">{lines}</div>
                    </div>
                    <div className="bg-[#16162e] rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Best</div>
                        <div className="text-yellow-400 text-[18px] font-bold">{highScore}</div>
                    </div>
                    <div className="bg-[#16162e] rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Next</div>
                        <canvas ref={nextRef} width={100} height={80} className="rounded"/>
                    </div>
                    <button onClick={initGame} className="px-3 py-2 rounded-xl bg-cyan-500 text-white text-[12px] font-semibold hover:bg-cyan-600">
                        {gameOver ? 'Play Again' : started ? 'Restart' : 'Start'}
                    </button>
                </div>
                {!started && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                        <div className="text-[32px] mb-2">🧱</div>
                        <div className="text-white text-[22px] font-bold mb-2">Tetris</div>
                        <div className="text-gray-400 text-[12px] mb-1">Arrow keys / WASD to move & rotate</div>
                        <div className="text-gray-400 text-[12px] mb-4">Space to hard drop</div>
                        <button onClick={initGame} className="px-6 py-2 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600">Play</button>
                    </div>
                )}
                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                        <div className="text-white text-[22px] font-bold mb-1">Game Over!</div>
                        <div className="text-cyan-400 text-[16px] mb-1">Score: {score}</div>
                        <div className="text-purple-400 text-[13px] mb-1">Level {level} · {lines} lines</div>
                        {score >= highScore && score > 0 && <div className="text-yellow-400 text-[13px] mb-3">New High Score!</div>}
                        <button onClick={initGame} className="px-6 py-2 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600">Play Again</button>
                    </div>
                )}
            </div>
        </div>
    );
};

window.TetrisGameApp = TetrisGameApp;
