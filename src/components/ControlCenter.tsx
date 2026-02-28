// Control Center - synced with global store
const ControlCenter = () => {
    const isOpen = useStore(s => s.controlCenterOpen);
    const wifiOn = useStore(s => s.wifiOn);
    const bluetoothOn = useStore(s => s.bluetoothOn);
    const focusOn = useStore(s => s.focusOn);
    const darkMode = useStore(s => s.darkMode);
    const brightness = useStore(s => s.brightness);
    const volume = useStore(s => s.volume);
    const accentColor = useStore(s => s.accentColor);

    // Read airDrop from local settings
    const [airdrop, setAirdrop] = React.useState(() => {
        try { return JSON.parse(localStorage.getItem('macos_settings_local') || '{}').airDrop !== false; } catch(e) { return true; }
    });

    const { shouldRender, isClosing } = useAnimatedVisibility(isOpen, 150);
    if (!shouldRender) return null;

    const Tile = ({ active, onClick, icon, label, sublabel }) => (
        <div onClick={onClick}
            className={`rounded-xl p-3 cursor-default text-center transition-colors
                ${active ? 'text-white' : 'bg-white/60 hover:bg-white/80'}`}
            style={active ? { background: accentColor } : undefined}>
            <div className="flex justify-center mb-1.5">{icon}</div>
            <div className="text-[11px] font-semibold">{label}</div>
            {sublabel && <div className="text-[10px] opacity-70">{sublabel}</div>}
        </div>
    );

    return (
        <div className="fixed z-[10001]" style={{ top: '31px', right: '12px' }}
            onClick={e => e.stopPropagation()}>
            <div className={`w-[320px] glass-menu rounded-2xl shadow-2xl border border-black/10 p-3.5 ${isClosing ? 'animate-spotlight-out' : 'animate-spotlight-in'}`}>
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                    <Tile active={wifiOn} onClick={() => MacStore.setState(s => ({ wifiOn: !s.wifiOn }))} label="Wi-Fi" sublabel={wifiOn ? 'Home' : 'Off'}
                        icon={<svg viewBox="0 0 24 24" width="18" height="18" fill={wifiOn ? 'white' : '#333'}><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>}/>
                    <Tile active={bluetoothOn} onClick={() => MacStore.setState(s => ({ bluetoothOn: !s.bluetoothOn }))} label="Bluetooth" sublabel={bluetoothOn ? 'On' : 'Off'}
                        icon={<svg viewBox="0 0 24 24" width="18" height="18" fill={bluetoothOn ? 'white' : '#333'}><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29z"/></svg>}/>
                    <Tile active={airdrop} onClick={() => setAirdrop(!airdrop)} label="AirDrop" sublabel={airdrop ? 'Everyone' : 'Off'}
                        icon={<svg viewBox="0 0 24 24" width="18" height="18" fill={airdrop ? 'white' : '#333'}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg>}/>
                </div>

                <div className="mb-3">
                    <div className="text-[12px] font-semibold text-gray-400 mb-1.5">Display</div>
                    <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#666"><path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69z"/></svg>
                        <input type="range" min="10" max="100" value={brightness} onChange={e => MacStore.setState({ brightness: +e.target.value })} className="flex-1 h-1.5" style={{ accentColor }}/>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#333"><path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="text-[12px] font-semibold text-gray-400 mb-1.5">Sound</div>
                    <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#666"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>
                        <input type="range" min="0" max="100" value={volume} onChange={e => MacStore.setState({ volume: +e.target.value })} className="flex-1 h-1.5" style={{ accentColor }}/>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#333"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    <div onClick={() => MacStore.setState(s => ({ focusOn: !s.focusOn }))}
                        className={`flex flex-col items-center gap-1.5 rounded-xl py-3 cursor-default transition-colors
                            ${focusOn ? 'text-white' : 'bg-white/60 hover:bg-white/80'}`}
                        style={focusOn ? { background: accentColor } : undefined}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${focusOn ? 'bg-white/20' : 'bg-black/5'}`}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill={focusOn ? 'white' : '#333'}><path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49z"/></svg>
                        </div>
                        <span className="text-[11px] font-medium">Focus</span>
                    </div>
                    <div onClick={() => MacStore.setState(s => ({ darkMode: !s.darkMode }))}
                        className={`flex flex-col items-center gap-1.5 rounded-xl py-3 cursor-default transition-colors
                            ${darkMode ? 'text-white' : 'bg-white/60 hover:bg-white/80'}`}
                        style={darkMode ? { background: accentColor } : undefined}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/20' : 'bg-black/5'}`}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill={darkMode ? 'white' : '#333'}><path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49z"/></svg>
                        </div>
                        <span className="text-[11px] font-medium">Dark Mode</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.ControlCenter = ControlCenter;
