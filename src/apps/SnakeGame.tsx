// Snake Game - fully playable classic snake
const SnakeGameApp = () => {
    const canvasRef = React.useRef(null);
    const gameRef = React.useRef({ snake: [{x:10,y:10}], dir: {x:1,y:0}, nextDir: {x:1,y:0}, food: {x:15,y:10}, score: 0, running: false, speed: 100, gameOver: false, interval: null });
    const [score, setScore] = React.useState(0);
    const [highScore, setHighScore] = React.useState(() => { try { return parseInt(localStorage.getItem('macos_snake_high') || '0'); } catch(e) { return 0; } });
    const [gameOver, setGameOver] = React.useState(false);
    const [started, setStarted] = React.useState(false);

    const COLS = 30, ROWS = 25, CELL = 16;

    const spawnFood = (snake) => {
        let f;
        do { f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
        while (snake.some(s => s.x === f.x && s.y === f.y));
        return f;
    };

    const startGame = () => {
        const g = gameRef.current;
        g.snake = [{x:10,y:10}];
        g.dir = {x:1,y:0};
        g.nextDir = {x:1,y:0};
        g.food = spawnFood(g.snake);
        g.score = 0;
        g.gameOver = false;
        g.running = true;
        g.speed = 100;
        setScore(0);
        setGameOver(false);
        setStarted(true);
        if (g.interval) clearInterval(g.interval);
        g.interval = setInterval(tick, g.speed);
    };

    const tick = () => {
        const g = gameRef.current;
        if (!g.running) return;

        g.dir = g.nextDir;
        const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };

        // Wall collision
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
            g.running = false;
            g.gameOver = true;
            clearInterval(g.interval);
            setGameOver(true);
            if (g.score > parseInt(localStorage.getItem('macos_snake_high') || '0')) {
                localStorage.setItem('macos_snake_high', g.score.toString());
                setHighScore(g.score);
            }
            return;
        }

        // Self collision
        if (g.snake.some(s => s.x === head.x && s.y === head.y)) {
            g.running = false;
            g.gameOver = true;
            clearInterval(g.interval);
            setGameOver(true);
            if (g.score > parseInt(localStorage.getItem('macos_snake_high') || '0')) {
                localStorage.setItem('macos_snake_high', g.score.toString());
                setHighScore(g.score);
            }
            return;
        }

        g.snake.unshift(head);

        if (head.x === g.food.x && head.y === g.food.y) {
            g.score++;
            setScore(g.score);
            g.food = spawnFood(g.snake);
            // Speed up every 5 points
            if (g.score % 5 === 0 && g.speed > 50) {
                g.speed -= 5;
                clearInterval(g.interval);
                g.interval = setInterval(tick, g.speed);
            }
        } else {
            g.snake.pop();
        }

        draw();
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const g = gameRef.current;

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke(); }
        for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke(); }

        // Food
        ctx.fillStyle = '#FF3B30';
        ctx.shadowColor = '#FF3B30';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(g.food.x * CELL + CELL/2, g.food.y * CELL + CELL/2, CELL/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Snake
        g.snake.forEach((s, i) => {
            const isHead = i === 0;
            ctx.fillStyle = isHead ? '#34C759' : `rgba(52, 199, 89, ${1 - i * 0.02})`;
            if (isHead) { ctx.shadowColor = '#34C759'; ctx.shadowBlur = 6; }
            ctx.beginPath();
            ctx.roundRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 3);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    };

    React.useEffect(() => {
        const handleKey = (e) => {
            const g = gameRef.current;
            if (!g.running) return;
            const { dir } = g;
            if ((e.key === 'ArrowUp' || e.key === 'w') && dir.y !== 1) g.nextDir = {x:0,y:-1};
            if ((e.key === 'ArrowDown' || e.key === 's') && dir.y !== -1) g.nextDir = {x:0,y:1};
            if ((e.key === 'ArrowLeft' || e.key === 'a') && dir.x !== 1) g.nextDir = {x:-1,y:0};
            if ((e.key === 'ArrowRight' || e.key === 'd') && dir.x !== -1) g.nextDir = {x:1,y:0};
            e.preventDefault();
        };
        window.addEventListener('keydown', handleKey);
        return () => { window.removeEventListener('keydown', handleKey); if (gameRef.current.interval) clearInterval(gameRef.current.interval); };
    }, []);

    React.useEffect(() => { draw(); }, []);

    return (
        <div className="flex flex-col h-full bg-[#0f0f23]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#16162e] border-b border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-white text-[14px] font-bold">Snake</span>
                    <span className="text-green-400 text-[13px]">Score: {score}</span>
                    <span className="text-yellow-400 text-[13px]">Best: {highScore}</span>
                </div>
                <button onClick={startGame} className="px-3 py-1 rounded-lg bg-green-500 text-white text-[12px] font-medium hover:bg-green-600">
                    {gameOver ? 'Play Again' : started ? 'Restart' : 'Start Game'}
                </button>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
                <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="rounded-lg" style={{ imageRendering: 'pixelated' }}/>
                {!started && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                        <div className="text-[32px] mb-2">🐍</div>
                        <div className="text-white text-[18px] font-bold mb-2">Snake</div>
                        <div className="text-gray-400 text-[12px] mb-4">Use arrow keys or WASD to move</div>
                        <button onClick={startGame} className="px-6 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600">Play</button>
                    </div>
                )}
                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                        <div className="text-white text-[22px] font-bold mb-1">Game Over!</div>
                        <div className="text-green-400 text-[16px] mb-1">Score: {score}</div>
                        {score >= highScore && score > 0 && <div className="text-yellow-400 text-[13px] mb-3">New High Score!</div>}
                        <button onClick={startGame} className="px-6 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600">Play Again</button>
                    </div>
                )}
            </div>
        </div>
    );
};

window.SnakeGameApp = SnakeGameApp;
