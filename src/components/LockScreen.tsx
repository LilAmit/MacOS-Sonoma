// macOS Lock Screen
const LockScreen = () => {
    const locked = useStore(s => s.locked);
    const wallpaperIndex = useStore(s => s.wallpaperIndex);
    const [unlocking, setUnlocking] = React.useState(false);
    const [time, setTime] = React.useState('');
    const [date, setDate] = React.useState('');
    const inputRef = React.useRef(null);

    const wallpaperStyle = {
        backgroundImage: 'url(' + WALLPAPERS[wallpaperIndex].path + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.65)',
    };

    React.useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
            setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
        };
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, []);

    React.useEffect(() => {
        if (locked) { setUnlocking(false); setTimeout(() => inputRef.current?.focus(), 100); }
    }, [locked]);

    const unlock = () => {
        setUnlocking(true);
        setTimeout(() => {
            MacStore.setState({ locked: false });
            setUnlocking(false);
        }, 600);
    };

    if (!locked) return null;

    return (
        <div className={`fixed inset-0 z-[99999] flex items-center justify-center cursor-default ${unlocking ? 'animate-unlock pointer-events-none' : ''}`}>
            {/* Wallpaper background */}
            <div className="absolute inset-0" style={wallpaperStyle}/>

            <div className="relative z-10 text-center text-white">
                <div className="text-[82px] font-bold tracking-tight leading-none mb-1"
                    style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                    {time}
                </div>
                <div className="text-[22px] font-medium opacity-90 mb-16"
                    style={{ textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}>
                    {date}
                </div>

                {/* User avatar */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl bg-gray-500">
                        <svg viewBox="0 0 100 100" width="80" height="80">
                            <circle cx="50" cy="50" r="50" fill="#7d7d7d"/>
                            <circle cx="50" cy="38" r="18" fill="#a0a0a0"/>
                            <ellipse cx="50" cy="80" rx="30" ry="22" fill="#a0a0a0"/>
                        </svg>
                    </div>
                    <div className="text-[17px] font-semibold">User</div>
                    <input
                        ref={inputRef}
                        type="password"
                        placeholder="Enter Password"
                        onKeyDown={e => e.key === 'Enter' && unlock()}
                        className="w-[200px] px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl text-white text-[14px] text-center outline-none placeholder-white/50 border border-white/10 font-sf"
                    />
                    <div className="text-[12px] opacity-40 mt-1">Press Enter to unlock</div>
                </div>
            </div>
        </div>
    );
};

window.LockScreen = LockScreen;
