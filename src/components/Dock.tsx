// macOS Dock - reads settings from global store
const Dock = () => {
    const openApps = useStore(s => s.openApps);
    const windows = useStore(s => s.windows);
    const dockSize = useStore(s => s.dockSize);
    const dockMagnification = useStore(s => s.dockMagnification);
    const dockAutoHide = useStore(s => s.dockAutoHide);
    const dockPosition = useStore(s => s.dockPosition);
    const showRecents = useStore(s => s.showRecents);
    const accentColor = useStore(s => s.accentColor);

    const [hovered, setHovered] = React.useState(false);
    const [visible, setVisible] = React.useState(!dockAutoHide);
    const [bouncingApp, setBouncingApp] = React.useState(null);
    const [mousePos, setMousePos] = React.useState(null); // mouse position relative to dock
    const dockRef = React.useRef(null);

    // Auto-hide logic
    React.useEffect(() => {
        if (!dockAutoHide) { setVisible(true); return; }
        setVisible(false);
        const handleMouse = (e) => {
            if (dockPosition === 'bottom' && e.clientY >= window.innerHeight - 4) setVisible(true);
            else if (dockPosition === 'left' && e.clientX <= 4) setVisible(true);
            else if (dockPosition === 'right' && e.clientX >= window.innerWidth - 4) setVisible(true);
        };
        window.addEventListener('mousemove', handleMouse);
        return () => window.removeEventListener('mousemove', handleMouse);
    }, [dockAutoHide, dockPosition]);

    // Hide when mouse leaves dock area (if auto-hide)
    React.useEffect(() => {
        if (!dockAutoHide) return;
        if (!hovered && visible) {
            const t = setTimeout(() => setVisible(false), 800);
            return () => clearTimeout(t);
        }
    }, [hovered, dockAutoHide, visible]);

    const dockApps = [
        { type: 'finder', name: 'Finder', Icon: MacIcons.Finder },
        { type: 'launchpad', name: 'Launchpad', Icon: MacIcons.Launchpad },
        { type: 'safari', name: 'Safari', Icon: MacIcons.Safari },
        { type: 'messages', name: 'Messages', Icon: MacIcons.Messages },
        { type: 'mail', name: 'Mail', Icon: MacIcons.Mail },
        { type: 'maps', name: 'Maps', Icon: MacIcons.Maps },
        { type: 'photos', name: 'Photos', Icon: MacIcons.Photos },
        { type: 'music', name: 'Music', Icon: MacIcons.Music },
        { type: 'appstore', name: 'App Store', Icon: MacIcons.AppStore },
    ];

    // Add separator + utility apps
    const utilApps = [
        { type: 'notes', name: 'Notes', Icon: MacIcons.Notes },
        { type: 'calendar', name: 'Calendar', Icon: MacIcons.Calendar },
        { type: 'calculator', name: 'Calculator', Icon: MacIcons.Calculator },
        { type: 'terminal', name: 'Terminal', Icon: MacIcons.Terminal },
        { type: 'word', name: 'Word', Icon: MacIcons.Word },
        { type: 'settings', name: 'System Settings', Icon: MacIcons.Settings },
        { type: 'aboutdev', name: 'About the Developer', Icon: MacIcons.AboutDev },
    ];

    // Build final dock items list
    const allItems = [...dockApps, 'sep', ...utilApps];

    // Add recent apps section if enabled
    if (showRecents) {
        const recentApps = [];
        windows.forEach(w => {
            if (!dockApps.find(a => a.type === w.appType) && !utilApps.find(a => a.type === w.appType) && w.appType !== 'trash') {
                const iconMap = { snake: MacIcons.Snake, tetris: MacIcons.Tetris, game2048: MacIcons.Game2048, vscode: MacIcons.VSCode, paint: MacIcons.Paint };
                if (iconMap[w.appType] && !recentApps.find(r => r.type === w.appType)) {
                    recentApps.push({ type: w.appType, name: w.title, Icon: iconMap[w.appType] });
                }
            }
        });
        if (recentApps.length > 0) {
            allItems.push('sep');
            allItems.push(...recentApps);
        }
    }

    // Always add trash at end
    allItems.push('sep', { type: 'trash', name: 'Trash', Icon: MacIcons.Trash });

    const appSizes = {
        finder: { w: 900, h: 550 }, safari: { w: 1000, h: 650 }, calculator: { w: 250, h: 400 },
        notes: { w: 800, h: 550 }, terminal: { w: 650, h: 420 }, settings: { w: 920, h: 600 },
        messages: { w: 800, h: 550 }, mail: { w: 1000, h: 600 }, maps: { w: 850, h: 550 },
        photos: { w: 900, h: 600 }, word: { w: 900, h: 700 }, calendar: { w: 800, h: 600 },
        music: { w: 950, h: 600 }, appstore: { w: 950, h: 650 }, aboutdev: { w: 550, h: 580 }, trash: { w: 700, h: 450 },
    };

    const handleClick = (appType, appName) => {
        if (appType === 'launchpad') {
            MacStore.setState(s => ({ launchpadOpen: !s.launchpadOpen }));
            return;
        }
        const minimized = windows.find(w => w.appType === appType && w.minimized);
        if (minimized) { MacStore.restoreWindow(minimized.id); return; }
        const existing = windows.find(w => w.appType === appType && !w.minimized);
        if (existing) { MacStore.focusWindow(existing.id); return; }
        // New app launch - trigger bounce
        setBouncingApp(appType);
        setTimeout(() => setBouncingApp(null), 800);
        const size = appSizes[appType] || { w: 800, h: 500 };
        MacStore.openWindow(appType, appName, size.w, size.h);
    };

    const iconSize = dockSize;
    const isVertical = dockPosition === 'left' || dockPosition === 'right';

    // Position classes
    const positionStyle = {};
    const containerClass = 'fixed z-[9998]';
    if (dockPosition === 'bottom') {
        positionStyle.bottom = '6px';
        positionStyle.left = '50%';
        positionStyle.transform = `translateX(-50%) translateY(${visible ? '0' : '100%'})`;
    } else if (dockPosition === 'left') {
        positionStyle.left = '6px';
        positionStyle.top = '50%';
        positionStyle.transform = `translateY(-50%) translateX(${visible ? '0' : '-100%'})`;
    } else if (dockPosition === 'right') {
        positionStyle.right = '6px';
        positionStyle.top = '50%';
        positionStyle.transform = `translateY(-50%) translateX(${visible ? '0' : '100%'})`;
    }
    positionStyle.transition = 'transform 0.3s ease';

    const flexDir = isVertical ? 'flex-col' : 'flex-row';
    const sepStyle = isVertical
        ? { width: iconSize + 'px', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '4px 0' }
        : { width: '1px', height: iconSize + 'px', background: 'rgba(255,255,255,0.2)', margin: '0 6px', alignSelf: 'center' };

    // Proximity magnification: calculate scale for each icon based on mouse distance
    const getIconScale = (itemIndex) => {
        if (mousePos === null) return 1;
        if (!dockMagnification) return 1;
        // Count only non-separator items up to this index to get the icon position
        let iconIdx = 0;
        for (let i = 0; i < itemIndex; i++) {
            if (allItems[i] !== 'sep') iconIdx++;
        }
        const gap = iconSize + 5; // icon size + padding
        const iconCenter = iconIdx * gap + gap / 2;
        const distance = Math.abs(mousePos - iconCenter);
        const maxDistance = gap * 2.5;
        if (distance > maxDistance) return 1;
        const scale = 1 + 0.3 * Math.cos((distance / maxDistance) * Math.PI / 2);
        return scale;
    };

    const handleDockMouseMove = (e) => {
        if (!dockRef.current || !dockMagnification) return;
        const rect = dockRef.current.getBoundingClientRect();
        if (isVertical) {
            setMousePos(e.clientY - rect.top);
        } else {
            setMousePos(e.clientX - rect.left);
        }
    };

    const handleDockMouseLeave = () => {
        setMousePos(null);
        setHovered(false);
    };

    return (
        <div className={containerClass} style={positionStyle}
            onMouseEnter={() => setHovered(true)} onMouseLeave={handleDockMouseLeave}>
            <div ref={dockRef}
                className={`glass-dock flex items-${isVertical ? 'center' : 'end'} ${isVertical ? 'px-1 py-2' : 'px-2 py-1'} rounded-2xl border border-white/20 shadow-2xl gap-0.5 ${flexDir}`}
                onMouseMove={handleDockMouseMove}>
                {allItems.map((app, i) => {
                    if (app === 'sep') return <div key={`sep-${i}`} style={sepStyle}/>;

                    const isOpen = openApps.has(app.type) || app.type === 'finder';
                    const Icon = app.Icon;
                    const scale = getIconScale(i);
                    const isBouncing = bouncingApp === app.type;
                    const liftPx = (scale - 1) * iconSize * 0.4;

                    const iconTransform = isVertical
                        ? `scale(${scale}) translateX(${liftPx}px)`
                        : `scale(${scale}) translateY(${-liftPx}px)`;

                    return (
                        <div key={app.type}
                            className="dock-item-base flex flex-col items-center p-0.5 cursor-default relative group"
                            onClick={() => handleClick(app.type, app.name)}>
                            {/* Tooltip */}
                            <div className={`absolute ${isVertical ? 'left-full ml-2 top-1/2 -translate-y-1/2' : 'left-1/2 -translate-x-1/2'} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50`}
                                style={!isVertical ? { bottom: iconSize + 28 + 'px' } : undefined}>
                                <div className="glass-dark px-3 py-1 rounded-md text-white text-[12px] whitespace-nowrap border border-white/10 shadow-lg">
                                    {app.name}
                                </div>
                            </div>

                            <div className={`${isBouncing ? 'animate-bounce-dock' : ''} transition-transform duration-100 ease-out`}
                                style={{
                                    transform: isBouncing ? undefined : iconTransform,
                                    transformOrigin: isVertical ? 'center left' : 'bottom center',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                }}>
                                <div className="flex items-center justify-center flex-shrink-0 overflow-hidden"
                                    style={{ width: iconSize + 'px', height: iconSize + 'px' }}>
                                    <Icon size={iconSize}/>
                                </div>
                            </div>

                            {/* Active indicator */}
                            {!isVertical && <div className={`w-1 h-1 rounded-full mt-0.5 transition-opacity ${isOpen ? 'bg-white/80 opacity-100' : 'opacity-0'}`}/>}
                            {isVertical && <div className={`absolute ${dockPosition === 'left' ? '-left-1' : '-right-1'} top-1/2 -translate-y-1/2 w-1 h-1 rounded-full transition-opacity ${isOpen ? 'bg-white/80 opacity-100' : 'opacity-0'}`}/>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

window.Dock = Dock;
