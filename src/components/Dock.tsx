// macOS Dock - uniform icon sizes
const Dock = () => {
    const openApps = useStore(s => s.openApps);
    const windows = useStore(s => s.windows);

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
        'sep',
        { type: 'notes', name: 'Notes', Icon: MacIcons.Notes },
        { type: 'calendar', name: 'Calendar', Icon: MacIcons.Calendar },
        { type: 'calculator', name: 'Calculator', Icon: MacIcons.Calculator },
        { type: 'terminal', name: 'Terminal', Icon: MacIcons.Terminal },
        { type: 'word', name: 'Word', Icon: MacIcons.Word },
        { type: 'settings', name: 'System Settings', Icon: MacIcons.Settings },
        'sep',
        { type: 'trash', name: 'Trash', Icon: MacIcons.Trash },
    ];

    const appSizes = {
        finder: { w: 900, h: 550 },
        safari: { w: 1000, h: 650 },
        calculator: { w: 250, h: 400 },
        notes: { w: 800, h: 550 },
        terminal: { w: 650, h: 420 },
        settings: { w: 920, h: 600 },
        messages: { w: 800, h: 550 },
        mail: { w: 1000, h: 600 },
        maps: { w: 850, h: 550 },
        photos: { w: 900, h: 600 },
        word: { w: 900, h: 700 },
        calendar: { w: 800, h: 600 },
        music: { w: 950, h: 600 },
        appstore: { w: 950, h: 650 },
        trash: { w: 700, h: 450 },
    };

    const handleClick = (appType, appName) => {
        if (appType === 'launchpad') {
            MacStore.setState(s => ({ launchpadOpen: !s.launchpadOpen }));
            return;
        }

        // Check minimized
        const minimized = windows.find(w => w.appType === appType && w.minimized);
        if (minimized) { MacStore.restoreWindow(minimized.id); return; }

        // Check existing
        const existing = windows.find(w => w.appType === appType && !w.minimized);
        if (existing) { MacStore.focusWindow(existing.id); return; }

        // Open new
        const size = appSizes[appType] || { w: 800, h: 500 };
        MacStore.openWindow(appType, appName, size.w, size.h);
    };

    return (
        <div className="fixed bottom-1.5 left-1/2 -translate-x-1/2 z-[9998]">
            <div className="glass-dock flex items-end px-2 py-1 rounded-2xl border border-white/20 shadow-2xl gap-0.5">
                {dockApps.map((app, i) => {
                    if (app === 'sep') return <div key={`sep-${i}`} className="w-px h-[48px] bg-white/20 mx-1.5 self-center"/>;

                    const isOpen = openApps.has(app.type) || app.type === 'finder';
                    const Icon = app.Icon;

                    return (
                        <div key={app.type}
                            className="dock-item-base flex flex-col items-center p-0.5 cursor-default relative group"
                            onClick={() => handleClick(app.type, app.name)}
                        >
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                <div className="glass-dark px-3 py-1 rounded-md text-white text-[12px] whitespace-nowrap border border-white/10 shadow-lg">
                                    {app.name}
                                </div>
                            </div>

                            <div className="group-hover:scale-[1.35] group-hover:-translate-y-2 group-active:scale-[1.2] transition-transform duration-150 ease-out"
                                style={{ transformOrigin: 'bottom center', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                                <div className="w-[48px] h-[48px] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    <Icon size={48}/>
                                </div>
                            </div>

                            {/* Active indicator */}
                            <div className={`w-1 h-1 rounded-full mt-0.5 transition-opacity ${isOpen ? 'bg-white/80 opacity-100' : 'opacity-0'}`}/>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

window.Dock = Dock;
