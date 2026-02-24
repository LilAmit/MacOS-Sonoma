// 2048 Game - fully playable
const Game2048App = () => {
    const SIZE = 4;
    const [board, setBoard] = React.useState(() => initBoard());
    const [score, setScore] = React.useState(0);
    const [bestScore, setBestScore] = React.useState(() => { try { return parseInt(localStorage.getItem('macos_2048_high') || '0'); } catch(e) { return 0; } });
    const [gameOver, setGameOver] = React.useState(false);
    const [won, setWon] = React.useState(false);

    function initBoard() {
        const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        addRandom(b); addRandom(b);
        return b;
    }

    function addRandom(b) {
        const empty = [];
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!b[r][c]) empty.push([r, c]);
        if (empty.length === 0) return;
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        b[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function slideRow(row) {
        let arr = row.filter(v => v);
        let sc = 0;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i+1]) {
                arr[i] *= 2; sc += arr[i]; arr[i+1] = 0;
            }
        }
        arr = arr.filter(v => v);
        while (arr.length < SIZE) arr.push(0);
        return { row: arr, score: sc };
    }

    function move(board, dir) {
        let b = board.map(r => [...r]);
        let totalScore = 0;
        let moved = false;

        if (dir === 'left') {
            for (let r = 0; r < SIZE; r++) {
                const { row, score: s } = slideRow(b[r]);
                if (row.some((v, i) => v !== b[r][i])) moved = true;
                b[r] = row; totalScore += s;
            }
        } else if (dir === 'right') {
            for (let r = 0; r < SIZE; r++) {
                const { row, score: s } = slideRow([...b[r]].reverse());
                row.reverse();
                if (row.some((v, i) => v !== b[r][i])) moved = true;
                b[r] = row; totalScore += s;
            }
        } else if (dir === 'up') {
            for (let c = 0; c < SIZE; c++) {
                const col = b.map(r => r[c]);
                const { row, score: s } = slideRow(col);
                if (row.some((v, i) => v !== b[i][c])) moved = true;
                for (let r = 0; r < SIZE; r++) b[r][c] = row[r];
                totalScore += s;
            }
        } else if (dir === 'down') {
            for (let c = 0; c < SIZE; c++) {
                const col = b.map(r => r[c]).reverse();
                const { row, score: s } = slideRow(col);
                row.reverse();
                if (row.some((v, i) => v !== b[i][c])) moved = true;
                for (let r = 0; r < SIZE; r++) b[r][c] = row[r];
                totalScore += s;
            }
        }
        return { board: b, score: totalScore, moved };
    }

    function canMove(b) {
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++) {
                if (!b[r][c]) return true;
                if (c < SIZE-1 && b[r][c] === b[r][c+1]) return true;
                if (r < SIZE-1 && b[r][c] === b[r+1][c]) return true;
            }
        return false;
    }

    const doMove = (dir) => {
        if (gameOver) return;
        const { board: nb, score: gained, moved } = move(board, dir);
        if (!moved) return;
        addRandom(nb);
        const newScore = score + gained;
        setBoard(nb);
        setScore(newScore);
        if (newScore > bestScore) {
            setBestScore(newScore);
            localStorage.setItem('macos_2048_high', newScore.toString());
        }
        if (nb.some(r => r.some(v => v === 2048)) && !won) setWon(true);
        if (!canMove(nb)) setGameOver(true);
    };

    const restart = () => {
        const b = initBoard();
        setBoard(b); setScore(0); setGameOver(false); setWon(false);
    };

    React.useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') { doMove('left'); e.preventDefault(); }
            if (e.key === 'ArrowRight' || e.key === 'd') { doMove('right'); e.preventDefault(); }
            if (e.key === 'ArrowUp' || e.key === 'w') { doMove('up'); e.preventDefault(); }
            if (e.key === 'ArrowDown' || e.key === 's') { doMove('down'); e.preventDefault(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    });

    const tileColors = {
        0: '#cdc1b4', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
        32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
        512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
    };
    const textColors = { 0: 'transparent', 2: '#776e65', 4: '#776e65' };
    const fontSize = (v) => v >= 1024 ? '22px' : v >= 128 ? '26px' : '32px';

    return (
        <div className="flex flex-col h-full items-center justify-center" style={{ background: '#faf8ef' }}>
            <div className="w-[380px]">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-[36px] font-extrabold" style={{ color: '#776e65' }}>2048</div>
                    <div className="flex gap-2">
                        <div className="bg-[#bbada0] rounded-lg px-4 py-1 text-center">
                            <div className="text-[10px] text-[#eee4da] uppercase font-bold">Score</div>
                            <div className="text-white text-[18px] font-bold">{score}</div>
                        </div>
                        <div className="bg-[#bbada0] rounded-lg px-4 py-1 text-center">
                            <div className="text-[10px] text-[#eee4da] uppercase font-bold">Best</div>
                            <div className="text-white text-[18px] font-bold">{bestScore}</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-[13px]" style={{ color: '#776e65' }}>Use arrow keys to play</div>
                    <button onClick={restart} className="px-4 py-1.5 rounded-lg text-white text-[13px] font-bold" style={{ background: '#8f7a66' }}>New Game</button>
                </div>
                <div className="rounded-xl p-3 relative" style={{ background: '#bbada0' }}>
                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
                        {board.map((row, r) => row.map((val, c) => (
                            <div key={r + '-' + c} className="aspect-square rounded-lg flex items-center justify-center font-extrabold select-none"
                                style={{
                                    background: tileColors[val] || '#3c3a32',
                                    color: textColors[val] || '#f9f6f2',
                                    fontSize: fontSize(val),
                                    transition: 'all 0.1s',
                                    boxShadow: val >= 128 ? '0 0 15px rgba(243,215,116,0.3)' : 'none',
                                }}>
                                {val || ''}
                            </div>
                        )))}
                    </div>
                    {gameOver && (
                        <div className="absolute inset-0 bg-white/70 rounded-xl flex flex-col items-center justify-center">
                            <div className="text-[28px] font-extrabold mb-2" style={{ color: '#776e65' }}>Game Over!</div>
                            <div className="text-[16px] mb-3" style={{ color: '#776e65' }}>Score: {score}</div>
                            <button onClick={restart} className="px-6 py-2 rounded-xl text-white font-bold" style={{ background: '#8f7a66' }}>Try Again</button>
                        </div>
                    )}
                    {won && !gameOver && (
                        <div className="absolute inset-0 bg-yellow-400/50 rounded-xl flex flex-col items-center justify-center">
                            <div className="text-[28px] font-extrabold text-white mb-2">You Win!</div>
                            <button onClick={() => setWon(false)} className="px-6 py-2 rounded-xl bg-white/80 text-[#776e65] font-bold">Continue</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

window.Game2048App = Game2048App;
