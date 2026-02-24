// App Store - 5 functional apps you can download and play
const AppStoreApp = () => {
    const [activeTab, setActiveTab] = React.useState('Discover');
    const [downloads, setDownloads] = React.useState({});
    const [installing, setInstalling] = React.useState({});

    React.useEffect(() => {
        const saved = localStorage.getItem('macos_appstore_downloads');
        if (saved) { try { setDownloads(JSON.parse(saved)); } catch(e) {} }
    }, []);

    const tabs = ['Discover', 'Games', 'Productivity', 'Updates'];

    const allApps = [
        { name: 'Snake', subtitle: 'Classic Snake Game', category: 'games', rating: 4.7, size: '2 MB', color: '#34C759', appType: 'snake',
            desc: 'The classic Snake game! Use arrow keys or WASD to guide the snake, eat food to grow, and try to beat your high score. Speed increases as you eat more!',
            icon: null, emoji: '🐍' },
        { name: 'Tetris', subtitle: 'Block Puzzle Classic', category: 'games', rating: 4.8, size: '3 MB', color: '#00BCD4', appType: 'tetris',
            desc: 'The legendary Tetris! Rotate and drop blocks to clear lines. Features ghost piece, next piece preview, level progression, and high score tracking.',
            icon: null, emoji: '🧱' },
        { name: '2048', subtitle: 'Number Puzzle Game', category: 'games', rating: 4.6, size: '1 MB', color: '#EDA028', appType: 'game2048',
            desc: 'Slide numbered tiles on a grid to combine them and reach the 2048 tile! A simple yet addictive puzzle game with score tracking.',
            icon: null, emoji: '🔢' },
        { name: 'VS Code', subtitle: 'Code Editor for Python', category: 'productivity', rating: 4.9, size: '15 MB', color: '#007ACC', appType: 'vscode',
            desc: 'A code editor with Python syntax highlighting, multiple file support, and a built-in Python interpreter. Write and run Python code right in your browser!',
            icon: null, emoji: '💻' },
        { name: 'Paint', subtitle: 'Drawing & Art Studio', category: 'productivity', rating: 4.5, size: '5 MB', color: '#FF3B30', appType: 'paint',
            desc: 'A full-featured drawing app with brush, eraser, shapes (line, rectangle, circle), flood fill, text tool, undo/redo, and color picker. Save your art as PNG!',
            icon: null, emoji: '🎨' },
    ];

    const stars = (rating) => (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" width="10" height="10" fill={i < Math.floor(rating) ? '#FFD60A' : '#E5E5EA'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            ))}
            <span className="text-[10px] text-gray-400 ml-0.5">{rating}</span>
        </div>
    );

    const installApp = (app) => {
        const appName = app.name;
        if (downloads[appName] || installing[appName] !== undefined) return;
        setInstalling(prev => ({ ...prev, [appName]: 0 }));
        const interval = setInterval(() => {
            setInstalling(prev => {
                const prog = (prev[appName] || 0) + Math.random() * 15 + 5;
                if (prog >= 100) {
                    clearInterval(interval);
                    const newDownloads = { ...downloads, [appName]: app.appType };
                    setDownloads(newDownloads);
                    localStorage.setItem('macos_appstore_downloads', JSON.stringify(newDownloads));
                    // Add to desktop
                    VFS.addDesktopApp(app.appType, appName);
                    MacStore.addNotification('App Store', appName + ' installed', 'The app has been added to your Desktop.');
                    const next = { ...prev };
                    delete next[appName];
                    return next;
                }
                return { ...prev, [appName]: prog };
            });
        }, 200);
    };

    const uninstallApp = (appName) => {
        const appType = downloads[appName];
        const newDownloads = { ...downloads };
        delete newDownloads[appName];
        setDownloads(newDownloads);
        localStorage.setItem('macos_appstore_downloads', JSON.stringify(newDownloads));
        if (appType) {
            VFS.removeDesktopApp(appType);
            // Close the app window if it's open
            const state = MacStore.getState();
            const openWin = state.windows.find(w => w.appType === appType);
            if (openWin) MacStore.closeWindow(openWin.id);
        }
        MacStore.addNotification('App Store', appName + ' uninstalled', 'The app has been removed.');
    };

    const openApp = (app) => {
        if (!downloads[app.name]) return;
        const sizes = {
            snake: { w: 530, h: 500 },
            tetris: { w: 480, h: 560 },
            game2048: { w: 430, h: 550 },
            vscode: { w: 950, h: 650 },
            paint: { w: 1000, h: 700 },
        };
        const s = sizes[app.appType] || { w: 800, h: 500 };
        MacStore.openWindow(app.appType, app.name, s.w, s.h);
    };

    const AppIcon = ({ app, size = 48 }) => (
        <div className="rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-sm overflow-hidden select-none"
            style={{ width: size, height: size, background: `linear-gradient(135deg, ${app.color}, ${app.color}cc)`, fontSize: size * 0.45 }}>
            {app.emoji}
        </div>
    );

    const GetButton = ({ app }) => {
        if (downloads[app.name]) return (
            <button onClick={(e) => { e.stopPropagation(); openApp(app); }}
                className="px-3.5 py-1 rounded-full bg-gray-100 text-blue-600 text-[11px] font-semibold hover:bg-blue-100 transition-colors">OPEN</button>
        );
        if (installing[app.name] !== undefined) return (
            <div className="w-[60px] h-[24px] relative">
                <svg className="absolute inset-0" width="60" height="24" viewBox="0 0 60 24">
                    <rect x="1" y="1" width="58" height="22" rx="11" fill="none" stroke="#007AFF" strokeWidth="1.5" opacity="0.3"/>
                    <rect x="1" y="1" width="58" height="22" rx="11" fill="none" stroke="#007AFF" strokeWidth="1.5"
                        strokeDasharray={`${(installing[app.name] / 100) * 165} 165`} strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.2s' }}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="#007AFF"><rect x="2" y="2" width="8" height="8" rx="1"/></svg>
                </div>
            </div>
        );
        return <button onClick={(e) => { e.stopPropagation(); installApp(app); }} className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-600 text-[11px] font-semibold hover:bg-blue-200">GET</button>;
    };

    const AppCard = ({ app }) => (
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl cursor-default hover:bg-gray-100 transition-colors">
            <AppIcon app={app} size={56}/>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <div className="text-[15px] font-semibold">{app.name}</div>
                        <div className="text-[12px] text-gray-400">{app.subtitle}</div>
                        {stars(app.rating)}
                    </div>
                    <GetButton app={app}/>
                </div>
                <div className="text-[12px] text-gray-500 mt-2 leading-relaxed">{app.desc}</div>
                <div className="text-[11px] text-gray-400 mt-1">{app.size}</div>
            </div>
        </div>
    );

    const AppRow = ({ app }) => (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-black/[0.03] cursor-default hover:bg-gray-100/50">
            <AppIcon app={app} size={44}/>
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">{app.name}</div>
                <div className="text-[11px] text-gray-400">{app.subtitle}</div>
                {stars(app.rating)}
            </div>
            <GetButton app={app}/>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Discover':
                return (
                    <>
                        <div className="rounded-2xl overflow-hidden mb-8 h-[200px] relative cursor-default"
                            style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' }}>
                            <div className="absolute inset-0 flex items-center p-8">
                                <div className="text-white">
                                    <div className="text-[12px] font-semibold uppercase tracking-wider opacity-70">App Store</div>
                                    <div className="text-[28px] font-bold mt-1">5 Apps, All Functional</div>
                                    <div className="text-[14px] opacity-80 mt-1">Download and use real games, a code editor, and a paint app</div>
                                </div>
                            </div>
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-3 text-[40px]">
                                🐍 🧱 🔢 💻 🎨
                            </div>
                        </div>
                        <h3 className="text-[20px] font-bold mb-4">All Apps</h3>
                        <div className="flex flex-col gap-3">
                            {allApps.map(app => <AppCard key={app.name} app={app}/>)}
                        </div>
                    </>
                );
            case 'Games':
                const games = allApps.filter(a => a.category === 'games');
                return (
                    <>
                        <div className="rounded-2xl overflow-hidden mb-8 h-[180px] relative cursor-default"
                            style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' }}>
                            <div className="absolute inset-0 flex items-center p-8">
                                <div className="text-white">
                                    <div className="text-[12px] font-semibold uppercase tracking-wider opacity-70">Games</div>
                                    <div className="text-[28px] font-bold mt-1">Play Now</div>
                                    <div className="text-[14px] opacity-80 mt-1">{games.length} playable games — download and play instantly</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {games.map(app => <AppCard key={app.name} app={app}/>)}
                        </div>
                    </>
                );
            case 'Productivity':
                const prodApps = allApps.filter(a => a.category === 'productivity');
                return (
                    <>
                        <div className="rounded-2xl overflow-hidden mb-8 h-[180px] relative cursor-default"
                            style={{ background: 'linear-gradient(135deg, #007ACC, #0099FF)' }}>
                            <div className="absolute inset-0 flex items-center p-8">
                                <div className="text-white">
                                    <div className="text-[12px] font-semibold uppercase tracking-wider opacity-70">Productivity</div>
                                    <div className="text-[28px] font-bold mt-1">Create & Build</div>
                                    <div className="text-[14px] opacity-80 mt-1">Code editor and drawing tools</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {prodApps.map(app => <AppCard key={app.name} app={app}/>)}
                        </div>
                    </>
                );
            case 'Updates':
                const installedApps = Object.keys(downloads);
                return (
                    <>
                        <div className="text-[13px] text-gray-400 mb-4">{installedApps.length} of {allApps.length} apps installed</div>
                        {installedApps.length > 0 && (
                            <>
                                <h3 className="text-[15px] font-bold mb-3">Installed Apps</h3>
                                <div className="bg-gray-50 rounded-xl overflow-hidden mb-6">
                                    {installedApps.map(name => {
                                        const app = allApps.find(a => a.name === name) || { name, subtitle: 'App', rating: 4.5, color: '#999', emoji: '📦', appType: '' };
                                        return (
                                            <div key={name} className="flex items-center gap-3 px-4 py-2.5 border-b border-black/[0.03]">
                                                <AppIcon app={app} size={40}/>
                                                <div className="flex-1">
                                                    <div className="text-[13px] font-medium">{name}</div>
                                                    <div className="text-[11px] text-gray-400">Up to date</div>
                                                </div>
                                                <button onClick={() => openApp(app)} className="px-3 py-1 rounded-full text-[11px] text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium mr-2">Open</button>
                                                <button onClick={() => uninstallApp(name)} className="px-3 py-1 rounded-full text-[11px] text-white bg-red-500 hover:bg-red-600 font-semibold transition-colors">Uninstall</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                        {installedApps.length === 0 && (
                            <div className="text-center text-gray-400 text-[13px] py-12">No apps installed yet. Visit Discover to get apps!</div>
                        )}
                    </>
                );
            default: return null;
        }
    };

    return (
        <div className="flex h-full">
            <div className="w-[180px] min-w-[180px] bg-gray-50/95 border-r border-black/5 p-2 overflow-y-auto">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1 mt-1 mb-1">Store</div>
                {tabs.map(tab => (
                    <div key={tab} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-default text-[13px] ${activeTab === tab ? 'bg-blue-500 text-white' : 'hover:bg-black/[0.03]'}`}
                        onClick={() => setActiveTab(tab)}>{tab}</div>
                ))}
                <div className="mt-4 px-3 text-[10px] text-gray-400 text-center">
                    {Object.keys(downloads).length} apps installed
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-6 max-w-[900px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

window.AppStoreApp = AppStoreApp;
