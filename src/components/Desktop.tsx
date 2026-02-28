// Helper: hex to rgb string
const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r + ',' + g + ',' + b;
};

// Desktop - main workspace with drag-and-drop desktop icons
const Desktop = () => {
    const windows = useStore(s => s.windows);
    const launchpadOpen = useStore(s => s.launchpadOpen);
    const aboutMacOpen = useStore(s => s.aboutMacOpen);
    const notifications = useStore(s => s.notifications);
    const wallpaperIndex = useStore(s => s.wallpaperIndex);
    const vfsVersion = useStore(s => s.vfsVersion);
    const darkMode = useStore(s => s.darkMode);
    const brightness = useStore(s => s.brightness);
    const nightShift = useStore(s => s.nightShift);
    const accentColor = useStore(s => s.accentColor);
    const reduceMotion = useStore(s => s.reduceMotion);
    const increaseContrast = useStore(s => s.increaseContrast);
    const reduceTransparency = useStore(s => s.reduceTransparency);
    const largerText = useStore(s => s.largerText);
    const dockPosition = useStore(s => s.dockPosition);

    // Apply global CSS classes and variables to document
    React.useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--accent-color', accentColor);
        root.style.setProperty('--accent-rgb', hexToRgb(accentColor));
        root.classList.toggle('dark-mode', darkMode);
        root.classList.toggle('reduce-motion', reduceMotion);
        root.classList.toggle('increase-contrast', increaseContrast);
        root.classList.toggle('reduce-transparency', reduceTransparency);
        root.classList.toggle('larger-text', largerText);
    }, [accentColor, darkMode, reduceMotion, increaseContrast, reduceTransparency, largerText]);

    const wallpaperStyle = {
        backgroundImage: 'url(' + WALLPAPERS[wallpaperIndex].path + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    const appComponents = {
        finder: FinderApp, safari: SafariApp, calculator: CalculatorApp, notes: NotesApp,
        terminal: TerminalApp, settings: SettingsApp, messages: MessagesApp, mail: MailApp,
        calendar: CalendarApp, photos: PhotosApp, word: WordApp, trash: TrashApp,
        maps: MapsApp, music: MusicApp, appstore: AppStoreApp, snake: SnakeGameApp,
        tetris: TetrisGameApp, game2048: Game2048App, vscode: VSCodeApp, paint: PaintApp,
        aboutdev: AboutDeveloperApp,
    };

    const handleDesktopClick = (e) => {
        if (e.target.id === 'desktop-bg' || e.target.closest('.desktop-icons')) {
            MacStore.unfocusAll();
            MacStore.setState({
                controlCenterOpen: false, notificationCenterOpen: false,
                spotlightOpen: false, launchpadOpen: false, aboutMacOpen: false, activeDropdown: null,
            });
        }
    };

    const [selectedDesktopItem, setSelectedDesktopItem] = React.useState(null);

    // Keyboard shortcuts
    React.useEffect(() => {
        const handler = (e) => {
            const meta = e.metaKey || e.ctrlKey;
            const shift = e.shiftKey;
            const alt = e.altKey;
            const state = MacStore.getState();
            const activeWin = state.windows.find(w => w.focused);

            if (e.key === 'Escape') {
                MacStore.setState({ spotlightOpen: false, controlCenterOpen: false, notificationCenterOpen: false, launchpadOpen: false, aboutMacOpen: false });
                return;
            }
            if (!meta) return;
            if (e.code === 'Space' && !shift) { e.preventDefault(); MacStore.setState(s => ({ spotlightOpen: !s.spotlightOpen })); return; }
            if (e.key === 'w' && !shift) { e.preventDefault(); if (activeWin) MacStore.closeWindow(activeWin.id); return; }
            if (e.key === 'q' && !shift && !e.ctrlKey) { e.preventDefault(); if (activeWin) MacStore.closeWindow(activeWin.id); return; }
            if (e.key === 'm' && !shift) { e.preventDefault(); if (activeWin) MacStore.minimizeWindow(activeWin.id); return; }
            if (e.key === 'h' && !shift && !alt) { e.preventDefault(); if (activeWin) MacStore.minimizeWindow(activeWin.id); return; }
            if (e.key === 'n' && !shift) { e.preventDefault(); MacStore.openWindow('finder', 'Finder', 900, 550); return; }
            if (e.key === 'n' && shift) {
                e.preventDefault();
                let name = 'untitled folder'; let c = 1;
                while (VFS.exists('/Users/user/Desktop/' + name)) { name = 'untitled folder ' + c; c++; }
                VFS.mkdir('/Users/user/Desktop', name);
                return;
            }
            if (e.key === ',') { e.preventDefault(); MacStore.openWindow('settings', 'System Settings', 920, 600); return; }
            if (e.key === 'f' && !shift) { e.preventDefault(); MacStore.setState(s => ({ spotlightOpen: !s.spotlightOpen })); return; }
            if (e.key === 'q' && shift) { e.preventDefault(); MacStore.setState({ locked: true }); return; }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const desktopFiles = VFS.ls('/Users/user/Desktop');
    const desktopApps = VFS.getDesktopApps();

    const appIconMap = {
        finder: MacIcons.Finder, safari: MacIcons.Safari, messages: MacIcons.Messages,
        mail: MacIcons.Mail, maps: MacIcons.Maps, photos: MacIcons.Photos,
        notes: MacIcons.Notes, calendar: MacIcons.Calendar, calculator: MacIcons.Calculator,
        terminal: MacIcons.Terminal, word: MacIcons.Word, trash: MacIcons.Trash, settings: MacIcons.Settings,
        music: MacIcons.Music, appstore: MacIcons.AppStore,
        snake: MacIcons.Snake, tetris: MacIcons.Tetris, game2048: MacIcons.Game2048,
        vscode: MacIcons.VSCode, paint: MacIcons.Paint,
    };

    const launchpadApps = [
        { type: 'finder', name: 'Finder', Icon: MacIcons.Finder },
        { type: 'safari', name: 'Safari', Icon: MacIcons.Safari },
        { type: 'messages', name: 'Messages', Icon: MacIcons.Messages },
        { type: 'mail', name: 'Mail', Icon: MacIcons.Mail },
        { type: 'maps', name: 'Maps', Icon: MacIcons.Maps },
        { type: 'photos', name: 'Photos', Icon: MacIcons.Photos },
        { type: 'notes', name: 'Notes', Icon: MacIcons.Notes },
        { type: 'calendar', name: 'Calendar', Icon: MacIcons.Calendar },
        { type: 'calculator', name: 'Calculator', Icon: MacIcons.Calculator },
        { type: 'terminal', name: 'Terminal', Icon: MacIcons.Terminal },
        { type: 'word', name: 'Word', Icon: MacIcons.Word },
        { type: 'settings', name: 'Settings', Icon: MacIcons.Settings },
        { type: 'music', name: 'Music', Icon: MacIcons.Music },
        { type: 'appstore', name: 'App Store', Icon: MacIcons.AppStore },
    ];

    const appSizes = {
        finder: { w: 900, h: 550 }, safari: { w: 1000, h: 650 }, calculator: { w: 250, h: 400 },
        notes: { w: 800, h: 550 }, terminal: { w: 650, h: 420 }, settings: { w: 920, h: 600 },
        messages: { w: 800, h: 550 }, mail: { w: 1000, h: 600 }, maps: { w: 850, h: 550 },
        photos: { w: 900, h: 600 }, word: { w: 900, h: 700 }, trash: { w: 700, h: 450 },
        calendar: { w: 800, h: 600 }, music: { w: 950, h: 600 }, appstore: { w: 950, h: 650 },
        snake: { w: 530, h: 500 }, tetris: { w: 480, h: 560 }, game2048: { w: 430, h: 550 },
        vscode: { w: 950, h: 650 }, paint: { w: 1000, h: 700 },
    };

    const openApp = (type, name) => {
        const size = appSizes[type] || { w: 800, h: 500 };
        MacStore.openWindow(type, name, size.w, size.h);
        MacStore.setState({ launchpadOpen: false });
    };

    // --- Drag and drop for desktop icons ---
    const [iconPositions, setIconPositions] = React.useState(() => {
        const saved = localStorage.getItem('macos_desktop_icon_positions');
        if (saved) try { return JSON.parse(saved); } catch(e) {}
        return {};
    });
    const [dragging, setDragging] = React.useState(null);
    const [dropTargetFolder, setDropTargetFolder] = React.useState(null); // desktop folder being hovered during drag
    const dragRef = React.useRef({ startX: 0, startY: 0, origX: 0, origY: 0, key: null, moved: false, fileName: null, isFile: false });

    const allDesktopItems = [];
    desktopApps.forEach(app => {
        const Icon = appIconMap[app.type];
        if (Icon) allDesktopItems.push({ key: 'app-' + app.type, type: 'app', appType: app.type, name: app.name, Icon });
    });
    desktopFiles.forEach(file => {
        allDesktopItems.push({ key: 'file-' + file.name, type: 'file', file });
    });

    // Clean up stale icon positions for files no longer on desktop
    React.useEffect(() => {
        const validKeys = new Set(allDesktopItems.map(item => item.key));
        setIconPositions(prev => {
            const keys = Object.keys(prev);
            const stale = keys.filter(k => !validKeys.has(k));
            if (stale.length === 0) return prev;
            const next = { ...prev };
            stale.forEach(k => delete next[k]);
            localStorage.setItem('macos_desktop_icon_positions', JSON.stringify(next));
            return next;
        });
    }, [vfsVersion]);

    // Grid constants for icon snapping
    const GRID_W = 90;
    const GRID_H = 85;
    const GRID_TOP = 35;
    const GRID_RIGHT_MARGIN = 5; // from right edge

    const getDefaultPos = (index) => {
        const colH = Math.floor((window.innerHeight - 120) / GRID_H);
        const col = Math.floor(index / colH);
        const row = index % colH;
        return { x: window.innerWidth - GRID_W - GRID_RIGHT_MARGIN - col * GRID_W, y: GRID_TOP + row * GRID_H };
    };

    const getPos = (key, index) => iconPositions[key] || getDefaultPos(index);

    // Snap position to nearest unoccupied grid cell
    const snapToGrid = (rawX, rawY, draggedKey) => {
        // Calculate grid cell from raw position
        const col = Math.round((rawX - GRID_RIGHT_MARGIN) / GRID_W);
        const row = Math.round((rawY - GRID_TOP) / GRID_H);
        const snappedX = Math.max(0, Math.min(window.innerWidth - GRID_W, col * GRID_W + GRID_RIGHT_MARGIN));
        const snappedY = Math.max(GRID_TOP, Math.min(window.innerHeight - 100, row * GRID_H + GRID_TOP));

        // Collect all occupied grid cells (except the one being dragged)
        const occupied = new Set();
        allDesktopItems.forEach((item, idx) => {
            if (item.key === draggedKey) return;
            const p = getPos(item.key, idx);
            const cx = Math.round((p.x - GRID_RIGHT_MARGIN) / GRID_W);
            const cy = Math.round((p.y - GRID_TOP) / GRID_H);
            occupied.add(cx + ',' + cy);
        });

        const targetCol = Math.round((snappedX - GRID_RIGHT_MARGIN) / GRID_W);
        const targetRow = Math.round((snappedY - GRID_TOP) / GRID_H);

        // If target cell is free, use it
        if (!occupied.has(targetCol + ',' + targetRow)) {
            return { x: snappedX, y: snappedY };
        }

        // Find nearest free cell (spiral outward)
        let bestDist = Infinity;
        let bestPos = { x: snappedX, y: snappedY };
        const maxCols = Math.floor(window.innerWidth / GRID_W);
        const maxRows = Math.floor((window.innerHeight - 120) / GRID_H);
        for (let r = 0; r <= maxRows; r++) {
            for (let c = 0; c <= maxCols; c++) {
                if (occupied.has(c + ',' + r)) continue;
                const cx = c * GRID_W + GRID_RIGHT_MARGIN;
                const cy = r * GRID_H + GRID_TOP;
                const dist = Math.hypot(cx - rawX, cy - rawY);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestPos = { x: cx, y: cy };
                }
            }
        }
        return bestPos;
    };

    const handleIconMouseDown = (e, key, index, item) => {
        if (e.button !== 0) return;
        const pos = getPos(key, index);
        const isFile = item.type === 'file';
        const fileName = isFile ? item.file.name : null;
        dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, key, moved: false, fileName, isFile };
        setDragging(key);

        const onMove = (ev) => {
            const dx = ev.clientX - dragRef.current.startX;
            const dy = ev.clientY - dragRef.current.startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
            if (!dragRef.current.moved) return;
            const newX = Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.origX + dx));
            const newY = Math.max(28, Math.min(window.innerHeight - 100, dragRef.current.origY + dy));
            setIconPositions(prev => {
                const next = { ...prev, [dragRef.current.key]: { x: newX, y: newY } };
                localStorage.setItem('macos_desktop_icon_positions', JSON.stringify(next));
                return next;
            });

            // Set global fileDrag for cross-component communication (only for actual files)
            if (dragRef.current.isFile && dragRef.current.fileName) {
                const state = MacStore.getState();
                if (!state.fileDrag || state.fileDrag.name !== dragRef.current.fileName) {
                    MacStore.setState({ fileDrag: { name: dragRef.current.fileName, sourcePath: '/Users/user/Desktop', type: 'desktop' } });
                }
            }

            // Check if hovering over a folder on desktop
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            if (el) {
                const folderEl = el.closest('[data-desktop-file][data-file-type="folder"]');
                if (folderEl && folderEl.getAttribute('data-desktop-file') !== dragRef.current.fileName) {
                    setDropTargetFolder(folderEl.getAttribute('data-desktop-file'));
                } else {
                    setDropTargetFolder(null);
                }
            }
        };

        const onUp = (ev) => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);

            if (dragRef.current.moved) {
                let movedToFolder = false;

                if (dragRef.current.isFile && dragRef.current.fileName) {
                    // Check if dropped on a desktop folder
                    if (dropTargetFolder) {
                        const destPath = '/Users/user/Desktop/' + dropTargetFolder;
                        if (VFS.isDir(destPath)) {
                            VFS.move('/Users/user/Desktop', dragRef.current.fileName, destPath);
                            MacStore.addNotification('Finder', 'Moved', dragRef.current.fileName + ' → ' + dropTargetFolder);
                            movedToFolder = true;
                            // Clean up icon position for moved file
                            setIconPositions(prev => {
                                const next = { ...prev };
                                delete next['file-' + dragRef.current.fileName];
                                localStorage.setItem('macos_desktop_icon_positions', JSON.stringify(next));
                                return next;
                            });
                        }
                    }
                    // Check if dropped on a Finder window (handled by Finder's mouseup listener)
                }

                // Snap to grid if not moved into a folder
                if (!movedToFolder) {
                    const curPos = iconPositions[dragRef.current.key] || getDefaultPos(0);
                    const snapped = snapToGrid(curPos.x, curPos.y, dragRef.current.key);
                    setIconPositions(prev => {
                        const next = { ...prev, [dragRef.current.key]: snapped };
                        localStorage.setItem('macos_desktop_icon_positions', JSON.stringify(next));
                        return next;
                    });
                }
            }

            setDragging(null);
            setDropTargetFolder(null);
            MacStore.setState({ fileDrag: null });
            dragRef.current.moved = false;
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    return (
        <div id="desktop-bg" className="fixed inset-0 overflow-hidden" style={wallpaperStyle} onMouseDown={handleDesktopClick}>
            <MenuBar />

            {/* Desktop Icons - absolutely positioned, draggable */}
            <div className="desktop-icons absolute inset-0 top-[28px] bottom-[80px]"
                onClick={(e) => { if (e.target === e.currentTarget) setSelectedDesktopItem(null); }}>
                {allDesktopItems.map((item, index) => {
                    const pos = getPos(item.key, index);
                    const isSelected = selectedDesktopItem === item.key;
                    const isDrag = dragging === item.key;

                    if (item.type === 'app') {
                        const Icon = item.Icon;
                        return (
                            <div key={item.key}
                                data-desktop-app={item.appType} data-app-name={item.name}
                                className={`absolute flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-default w-[80px] ${isSelected ? 'bg-white/25' : 'hover:bg-white/10'} ${isDrag ? 'z-50 opacity-80' : ''}`}
                                style={{ left: pos.x, top: pos.y }}
                                onMouseDown={(e) => { e.stopPropagation(); setSelectedDesktopItem(item.key); handleIconMouseDown(e, item.key, index, item); }}
                                onDoubleClick={() => { if (!dragRef.current.moved) openApp(item.appType, item.name); }}>
                                <div className="w-[48px] h-[48px] flex items-center justify-center flex-shrink-0"><Icon size={48}/></div>
                                <span className="text-[10px] text-white text-center leading-tight drop-shadow-md truncate w-full">{item.name}</span>
                            </div>
                        );
                    } else {
                        const file = item.file;
                        const isFolderDropTarget = dropTargetFolder === file.name && file.type === 'folder';
                        return (
                            <div key={item.key}
                                data-desktop-file={file.name} data-file-type={file.type}
                                className={`absolute flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-default w-[80px] transition-all
                                    ${isSelected ? 'bg-white/25' : 'hover:bg-white/10'}
                                    ${isDrag ? 'z-50 opacity-80' : ''}
                                    ${isFolderDropTarget ? 'bg-blue-400/30 ring-2 ring-blue-400/60 scale-110' : ''}`}
                                style={{ left: pos.x, top: pos.y }}
                                onMouseDown={(e) => { e.stopPropagation(); setSelectedDesktopItem(item.key); handleIconMouseDown(e, item.key, index, item); }}
                                onDoubleClick={() => {
                                    if (dragRef.current.moved) return;
                                    if (file.type === 'folder') MacStore.openWindow('finder', 'Finder', 900, 550);
                                    else if (file.name.endsWith('.py')) {
                                        MacStore.setState({ pendingOpenFile: { path: '/Users/user/Desktop', name: file.name } });
                                        MacStore.openWindow('vscode', 'VS Code', 950, 650);
                                    }
                                    else if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                                        MacStore.setState({ pendingOpenFile: { path: '/Users/user/Desktop', name: file.name } });
                                        MacStore.openWindow('word', 'Word', 900, 700);
                                    }
                                }}>
                                <div className="w-[48px] h-[48px] flex items-center justify-center">
                                    {file.type === 'folder' ? (
                                        <svg viewBox="0 0 48 48" width="40" height="40">
                                            <path d="M6 8h14l4 4h18c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="#42A5F5"/>
                                            <rect x="4" y="14" width="40" height="24" rx="2" fill="#64B5F6" opacity="0.85"/>
                                        </svg>
                                    ) : <span className="text-[32px]">{file.icon}</span>}
                                </div>
                                <span className="text-[10px] text-white text-center leading-tight drop-shadow-md truncate w-full">{file.name}</span>
                            </div>
                        );
                    }
                })}
            </div>

            {/* Windows */}
            <div className="absolute inset-0 pt-[25px] pb-[80px]" style={{ pointerEvents: 'none' }}>
                {windows.map(win => {
                    const AppComponent = appComponents[win.appType];
                    if (!AppComponent) return null;
                    return (
                        <div key={win.id} style={{ pointerEvents: 'auto' }}>
                            <Window windowData={win}><AppComponent /></Window>
                        </div>
                    );
                })}
            </div>

            {/* Launchpad */}
            {(() => {
                const { shouldRender: lpRender, isClosing: lpClosing } = useAnimatedVisibility(launchpadOpen, 200);
                if (!lpRender) return null;
                return (
                    <div className={`fixed inset-0 z-[9997] flex items-center justify-center ${lpClosing ? 'animate-launchpad-out' : 'animate-launchpad-in'}`}
                        onClick={() => MacStore.setState({ launchpadOpen: false })}
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
                        <div className="grid gap-6 p-12" style={{ gridTemplateColumns: 'repeat(7, 90px)' }}
                            onClick={e => e.stopPropagation()}>
                            {launchpadApps.map(app => {
                                const Icon = app.Icon;
                                return (
                                    <div key={app.type} className="flex flex-col items-center gap-2 cursor-default group"
                                        onClick={() => openApp(app.type, app.name)}>
                                        <div className="group-hover:scale-110 transition-transform">
                                            <div className="w-[64px] h-[64px] flex items-center justify-center"><Icon size={64}/></div>
                                        </div>
                                        <span className="text-white text-[11px] opacity-90 text-center leading-tight w-[90px] truncate">{app.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* About This Mac */}
            {(() => {
                const { shouldRender: amRender, isClosing: amClosing } = useAnimatedVisibility(aboutMacOpen, 200);
                if (!amRender) return null;
                return (
                    <div className={`fixed inset-0 z-[10004] flex items-center justify-center bg-black/30 ${amClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
                        onClick={() => MacStore.setState({ aboutMacOpen: false })}>
                        <div className={`glass-menu rounded-2xl shadow-2xl border border-black/10 w-[540px] overflow-hidden ${amClosing ? 'animate-spotlight-out' : 'animate-window-open'}`}
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 text-center">
                                <svg viewBox="0 0 170 170" width="60" height="60" fill="#333" className="mx-auto mb-4">
                                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.04-7.41-11.73-14.04-5.03-7.08-9.17-15.29-12.41-24.65-3.47-10.11-5.21-19.9-5.21-29.38 0-10.86 2.35-20.22 7.04-28.07 3.69-6.3 8.61-11.27 14.76-14.92s12.79-5.51 19.95-5.63c3.91 0 9.05 1.21 15.43 3.59 6.36 2.39 10.45 3.6 12.26 3.6 1.35 0 5.94-1.42 13.72-4.24 7.36-2.62 13.57-3.71 18.66-3.27 13.79 1.11 24.13 6.54 31.01 16.32-12.32 7.47-18.41 17.94-18.28 31.37.12 10.46 3.91 19.17 11.35 26.08 3.38 3.21 7.15 5.68 11.34 7.44-.91 2.64-1.87 5.17-2.89 7.59zM119.11 7.24c0 8.2-3 15.86-8.96 22.95-7.19 8.4-15.89 13.25-25.32 12.49-.12-.97-.19-2-.19-3.07 0-7.87 3.43-16.31 9.51-23.19 3.04-3.49 6.9-6.4 11.58-8.72 4.67-2.29 9.09-3.55 13.24-3.8.12 1.13.14 2.25.14 3.34z"/>
                                </svg>
                                <h2 className="text-[22px] font-bold mb-1">macOS Sonoma</h2>
                                <p className="text-[13px] text-gray-500 mb-4">Version 14.3.1</p>
                                <div className="bg-gray-50 rounded-xl p-4 text-[12px] text-gray-600 text-left space-y-1.5">
                                    <div className="flex justify-between"><span className="text-gray-400">Chip</span><span className="font-medium">Apple M3 Pro</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Memory</span><span className="font-medium">18 GB</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Startup Disk</span><span className="font-medium">Macintosh HD</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Serial Number</span><span className="font-medium">C02YX1ABCDEF</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">macOS Sonoma</span><span className="font-medium">14.3.1 (23D60)</span></div>
                                </div>
                                <div className="mt-4 flex justify-center gap-2">
                                    <button className="px-4 py-1.5 rounded-lg bg-gray-100 text-[12px] font-medium hover:bg-gray-200">System Report...</button>
                                    <button className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-[12px] font-medium hover:bg-blue-600"
                                        onClick={() => MacStore.setState({ aboutMacOpen: false })}>OK</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <SpotlightSearch />
            <ControlCenter />
            <NotificationCenter />
            <ContextMenuComponent />

            {(() => {
                const [dismissing, setDismissing] = React.useState(new Set());
                return (
                    <div className="fixed top-[32px] right-3 z-[10005] flex flex-col gap-2">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`glass-menu rounded-xl shadow-xl border border-black/10 p-3 w-[320px] cursor-default ${dismissing.has(notif.id) ? 'animate-toast-out' : 'animate-toast-in'}`}
                                onClick={() => {
                                    setDismissing(prev => new Set([...prev, notif.id]));
                                    setTimeout(() => {
                                        MacStore.setState(s => ({ notifications: s.notifications.filter(n => n.id !== notif.id) }));
                                        setDismissing(prev => { const next = new Set(prev); next.delete(notif.id); return next; });
                                    }, 250);
                                }}>
                                <div className="flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{notif.app[0]}</div>
                                    <div>
                                        <div className="text-[11px] text-gray-400 font-medium">{notif.app}</div>
                                        <div className="text-[13px] font-semibold">{notif.title}</div>
                                        <div className="text-[12px] text-gray-500">{notif.body}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })()}

            <Dock />

            {/* Brightness overlay */}
            {brightness < 100 && (
                <div className="fixed inset-0 pointer-events-none z-[99990]"
                    style={{ background: 'black', opacity: (100 - brightness) / 100 * 0.7 }}/>
            )}

            {/* Night Shift warm overlay */}
            {nightShift && (
                <div className="fixed inset-0 pointer-events-none z-[99990]"
                    style={{ background: 'rgba(255, 147, 41, 0.18)', mixBlendMode: 'multiply' }}/>
            )}
        </div>
    );
};

window.Desktop = Desktop;
