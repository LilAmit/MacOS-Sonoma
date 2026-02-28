// macOS Menu Bar - Fully functional with all dropdowns
const MenuBar = () => {
    const [clock, setClock] = React.useState('');
    const [dropdown, setDropdown] = React.useState(null);
    const activeWin = useStore(s => s.windows.find(w => w.focused));
    const wifiOn = useStore(s => s.wifiOn);
    const volume = useStore(s => s.volume);
    const showBatteryPercentage = useStore(s => s.showBatteryPercentage);
    const focusOn = useStore(s => s.focusOn);
    const batteryLevel = React.useRef(Math.floor(Math.random() * 30) + 65);

    React.useEffect(() => {
        const update = () => {
            const now = new Date();
            const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            let h = now.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
            setClock(`${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${h}:${String(now.getMinutes()).padStart(2,'0')} ${ampm}`);
        };
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, []);

    const closeDropdown = () => setDropdown(null);

    React.useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('.dropdown-container')) closeDropdown();
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const appName = activeWin ? activeWin.title.split(' - ')[0].split(' ')[0] : 'Finder';

    // App-specific menu items
    const getAppMenuItems = () => {
        return (
            <>
                <DropItem label={`About ${appName}`} onClick={() => { closeDropdown(); MacStore.setState({ aboutMacOpen: true }); }}/>
                <DropSep/>
                <DropItem label={`Preferences...`} shortcut="⌘," onClick={() => { closeDropdown(); MacStore.openWindow('settings', 'System Settings', 920, 600); }}/>
                <DropSep/>
                <DropItem label={`Hide ${appName}`} shortcut="⌘H"/>
                <DropItem label="Hide Others" shortcut="⌥⌘H"/>
                <DropItem label="Show All"/>
                <DropSep/>
                <DropItem label={`Quit ${appName}`} shortcut="⌘Q" onClick={() => { closeDropdown(); if (activeWin) MacStore.closeWindow(activeWin.id); }}/>
            </>
        );
    };

    const getViewMenuItems = () => (
        <>
            <DropItem label="as Icons" shortcut="⌘1" onClick={closeDropdown}/>
            <DropItem label="as List" shortcut="⌘2" onClick={closeDropdown}/>
            <DropItem label="as Columns" shortcut="⌘3" onClick={closeDropdown}/>
            <DropItem label="as Gallery" shortcut="⌘4" onClick={closeDropdown}/>
            <DropSep/>
            <DropItem label="Show Tab Bar" shortcut="⇧⌘T" onClick={closeDropdown}/>
            <DropItem label="Show All Tabs" onClick={closeDropdown}/>
            <DropSep/>
            <DropItem label="Show Path Bar" shortcut="⌥⌘P" onClick={closeDropdown}/>
            <DropItem label="Show Status Bar" onClick={closeDropdown}/>
            <DropItem label="Show Sidebar" shortcut="⌥⌘S" onClick={closeDropdown}/>
            <DropSep/>
            <DropItem label="Enter Full Screen" shortcut="⌃⌘F" onClick={() => {
                closeDropdown();
                if (activeWin) MacStore.toggleMaximize(activeWin.id);
            }}/>
        </>
    );

    const getGoMenuItems = () => (
        <>
            <DropItem label="Back" shortcut="⌘[" onClick={closeDropdown}/>
            <DropItem label="Forward" shortcut="⌘]" onClick={closeDropdown}/>
            <DropItem label="Enclosing Folder" shortcut="⌘↑" onClick={closeDropdown}/>
            <DropSep/>
            <DropItem label="Recents" shortcut="⇧⌘F" onClick={closeDropdown}/>
            <DropItem label="Documents" shortcut="⇧⌘O" onClick={() => { closeDropdown(); MacStore.openWindow('finder', 'Finder', 900, 550); }}/>
            <DropItem label="Desktop" shortcut="⇧⌘D" onClick={() => { closeDropdown(); MacStore.openWindow('finder', 'Finder', 900, 550); }}/>
            <DropItem label="Downloads" shortcut="⌥⌘L" onClick={() => { closeDropdown(); MacStore.openWindow('finder', 'Finder', 900, 550); }}/>
            <DropItem label="Home" shortcut="⇧⌘H" onClick={() => { closeDropdown(); MacStore.openWindow('finder', 'Finder', 900, 550); }}/>
            <DropSep/>
            <DropItem label="Applications" shortcut="⇧⌘A" onClick={() => { closeDropdown(); MacStore.openWindow('finder', 'Finder', 900, 550); }}/>
            <DropItem label="Utilities" shortcut="⇧⌘U" onClick={closeDropdown}/>
            <DropSep/>
            <DropItem label="Go to Folder..." shortcut="⇧⌘G" onClick={closeDropdown}/>
            <DropItem label="Connect to Server..." shortcut="⌘K" onClick={closeDropdown}/>
        </>
    );

    const getWindowMenuItems = () => {
        const state = MacStore.getState();
        return (
            <>
                <DropItem label="Minimize" shortcut="⌘M" onClick={() => { closeDropdown(); if (activeWin) MacStore.minimizeWindow(activeWin.id); }}/>
                <DropItem label="Zoom" onClick={() => { closeDropdown(); if (activeWin) MacStore.toggleMaximize(activeWin.id); }}/>
                <DropItem label="Move Window to Left Side" onClick={closeDropdown}/>
                <DropItem label="Move Window to Right Side" onClick={closeDropdown}/>
                <DropSep/>
                <DropItem label="Bring All to Front" onClick={() => { closeDropdown(); }}/>
                {state.windows.length > 0 && <DropSep/>}
                {state.windows.map(w => (
                    <DropItem key={w.id} label={(w.focused ? '✓ ' : '  ') + w.title}
                        onClick={() => { closeDropdown(); MacStore.focusWindow(w.id); if (w.minimized) MacStore.restoreWindow(w.id); }}/>
                ))}
            </>
        );
    };

    const getHelpMenuItems = () => (
        <>
            <div className="px-4 py-1.5 mx-1">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-gray-100 border border-black/5">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#999"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <span className="text-[12px] text-gray-400">Search</span>
                </div>
            </div>
            <DropSep/>
            <DropItem label="macOS Help" onClick={closeDropdown}/>
            <DropSep/>
            <DropItem label={`${appName} Help`} onClick={closeDropdown}/>
            <DropItem label="Keyboard Shortcuts" onClick={closeDropdown}/>
            <DropItem label="What's New in macOS" onClick={closeDropdown}/>
        </>
    );

    return (
        <div className="fixed top-0 left-0 right-0 h-[25px] glass-dark flex items-center justify-between px-2 z-[9999] border-b border-white/5">
            <div className="flex items-center h-full">
                {/* Apple menu */}
                <div className="dropdown-container relative">
                    <button onClick={(e) => { e.stopPropagation(); setDropdown(dropdown === 'apple' ? null : 'apple'); }}
                        className="flex items-center px-3 h-full hover:bg-white/10 rounded">
                        <svg viewBox="0 0 170 170" width="13" height="13" fill="white">
                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.04-7.41-11.73-14.04-5.03-7.08-9.17-15.29-12.41-24.65-3.47-10.11-5.21-19.9-5.21-29.38 0-10.86 2.35-20.22 7.04-28.07 3.69-6.3 8.61-11.27 14.76-14.92s12.79-5.51 19.95-5.63c3.91 0 9.05 1.21 15.43 3.59 6.36 2.39 10.45 3.6 12.26 3.6 1.35 0 5.94-1.42 13.72-4.24 7.36-2.62 13.57-3.71 18.66-3.27 13.79 1.11 24.13 6.54 31.01 16.32-12.32 7.47-18.41 17.94-18.28 31.37.12 10.46 3.91 19.17 11.35 26.08 3.38 3.21 7.15 5.68 11.34 7.44-.91 2.64-1.87 5.17-2.89 7.59zM119.11 7.24c0 8.2-3 15.86-8.96 22.95-7.19 8.4-15.89 13.25-25.32 12.49-.12-.97-.19-2-.19-3.07 0-7.87 3.43-16.31 9.51-23.19 3.04-3.49 6.9-6.4 11.58-8.72 4.67-2.29 9.09-3.55 13.24-3.8.12 1.13.14 2.25.14 3.34z"/>
                        </svg>
                    </button>
                    {dropdown === 'apple' && (
                        <div className="absolute top-[25px] left-0 glass-menu rounded-b-lg animate-menu-dropdown-in min-w-[240px] py-1 shadow-xl border border-black/10 z-[10001]">
                            <DropItem label="About This Mac" onClick={() => { closeDropdown(); MacStore.setState({ aboutMacOpen: true }); }}/>
                            <DropSep/>
                            <DropItem label="System Settings..." onClick={() => { closeDropdown(); MacStore.openWindow('settings', 'System Settings', 920, 600); }}/>
                            <DropItem label="App Store..." onClick={() => { closeDropdown(); MacStore.openWindow('appstore', 'App Store', 950, 650); }}/>
                            <DropSep/>
                            <DropItem label="Recent Items" hasArrow/>
                            <DropItem label="Force Quit..." shortcut="⌥⌘Esc" onClick={() => {
                                closeDropdown();
                                const state = MacStore.getState();
                                if (state.activeWindowId) MacStore.closeWindow(state.activeWindowId);
                            }}/>
                            <DropSep/>
                            <DropItem label="Sleep"/>
                            <DropItem label="Restart..."/>
                            <DropItem label="Shut Down..."/>
                            <DropSep/>
                            <DropItem label="Lock Screen" shortcut="⌃⌘Q" onClick={() => { closeDropdown(); MacStore.setState({ locked: true }); }}/>
                            <DropItem label="Log Out User..." shortcut="⇧⌘Q" onClick={() => { closeDropdown(); MacStore.setState({ locked: true }); }}/>
                        </div>
                    )}
                </div>

                {/* Active app name */}
                <div className="dropdown-container relative">
                    <button onClick={(e) => { e.stopPropagation(); setDropdown(dropdown === 'app' ? null : 'app'); }}
                        onMouseEnter={() => dropdown && setDropdown('app')}
                        className="text-white text-[13px] font-semibold px-2.5 h-full flex items-center hover:bg-white/10 rounded">{appName}</button>
                    {dropdown === 'app' && (
                        <div className="absolute top-[25px] left-0 glass-menu rounded-b-lg animate-menu-dropdown-in min-w-[220px] py-1 shadow-xl border border-black/10 z-[10001]">
                            {getAppMenuItems()}
                        </div>
                    )}
                </div>

                {['File','Edit','View','Go','Window','Help'].map(menu => (
                    <div key={menu} className="dropdown-container relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setDropdown(dropdown === menu ? null : menu); }}
                            onMouseEnter={() => dropdown && setDropdown(menu)}
                            className="text-white text-[13px] px-2.5 h-full flex items-center hover:bg-white/10 rounded"
                        >{menu}</button>
                        {dropdown === menu && (
                            <div className="absolute top-[25px] left-0 glass-menu rounded-b-lg animate-menu-dropdown-in min-w-[220px] py-1 shadow-xl border border-black/10 z-[10001]">
                                {menu === 'File' && <>
                                    <DropItem label="New Window" shortcut="⌘N" onClick={() => { closeDropdown(); MacStore.openWindow('finder','Finder',900,550); }}/>
                                    <DropItem label="New Folder" shortcut="⇧⌘N" onClick={() => { closeDropdown(); VFS.mkdir('/Users/user/Desktop', 'untitled folder'); }}/>
                                    <DropSep/>
                                    <DropItem label="Open" shortcut="⌘O" onClick={closeDropdown}/>
                                    <DropItem label="Open With" hasArrow/>
                                    <DropItem label="Close Window" shortcut="⌘W" onClick={() => { closeDropdown(); if(activeWin) MacStore.closeWindow(activeWin.id); }}/>
                                    <DropSep/>
                                    <DropItem label="Get Info" shortcut="⌘I" onClick={closeDropdown}/>
                                    <DropItem label="Rename" onClick={closeDropdown}/>
                                    <DropItem label="Compress" onClick={closeDropdown}/>
                                    <DropItem label="Duplicate" shortcut="⌘D" onClick={closeDropdown}/>
                                    <DropSep/>
                                    <DropItem label="Move to Trash" shortcut="⌘⌫" onClick={closeDropdown}/>
                                </>}
                                {menu === 'Edit' && <>
                                    <DropItem label="Undo" shortcut="⌘Z" onClick={closeDropdown}/>
                                    <DropItem label="Redo" shortcut="⇧⌘Z" onClick={closeDropdown}/>
                                    <DropSep/>
                                    <DropItem label="Cut" shortcut="⌘X" onClick={closeDropdown}/>
                                    <DropItem label="Copy" shortcut="⌘C" onClick={closeDropdown}/>
                                    <DropItem label="Paste" shortcut="⌘V" onClick={closeDropdown}/>
                                    <DropItem label="Paste and Match Style" shortcut="⌥⇧⌘V" onClick={closeDropdown}/>
                                    <DropItem label="Select All" shortcut="⌘A" onClick={closeDropdown}/>
                                    <DropSep/>
                                    <DropItem label="Find" shortcut="⌘F" onClick={() => {
                                        closeDropdown();
                                        MacStore.setState(s => ({ spotlightOpen: !s.spotlightOpen }));
                                    }}/>
                                    <DropItem label="Find and Replace" shortcut="⌥⌘F" onClick={closeDropdown}/>
                                    <DropSep/>
                                    <DropItem label="Emoji & Symbols" shortcut="⌃⌘Space" onClick={closeDropdown}/>
                                </>}
                                {menu === 'View' && getViewMenuItems()}
                                {menu === 'Go' && getGoMenuItems()}
                                {menu === 'Window' && getWindowMenuItems()}
                                {menu === 'Help' && getHelpMenuItems()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center h-full gap-0.5">
                {/* Focus indicator */}
                {focusOn && (
                    <MenuIcon title="Focus On">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49z"/></svg>
                    </MenuIcon>
                )}

                {/* Control Center */}
                <MenuIcon title="Control Center" onClick={() => MacStore.setState(s => ({ controlCenterOpen: !s.controlCenterOpen, notificationCenterOpen: false }))}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="white"><path d="M7 10h2v4H7zM11 7h2v10h-2zM15 12h2v2h-2zM3 13h2v1H3zM19 9h2v6h-2z"/></svg>
                </MenuIcon>

                {/* Wi-Fi dropdown */}
                <div className="dropdown-container relative flex items-center h-full">
                    <button onClick={(e) => { e.stopPropagation(); setDropdown(dropdown === 'wifi' ? null : 'wifi'); }}
                        className="flex items-center px-1.5 h-full hover:bg-white/10 rounded cursor-default" title="Wi-Fi">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="white" opacity={wifiOn ? 1 : 0.4}>
                            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                        </svg>
                    </button>
                    {dropdown === 'wifi' && (
                        <div className="absolute top-[25px] right-0 glass-menu rounded-b-lg animate-menu-dropdown-in min-w-[260px] py-1 shadow-xl border border-black/10 z-[10001]">
                            <div className="flex items-center justify-between px-4 py-2">
                                <span className="text-[13px] font-semibold">Wi-Fi</span>
                                <div className={`w-8 h-[18px] rounded-full cursor-default flex items-center transition-colors ${wifiOn ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}
                                    onClick={() => MacStore.setState(s => ({ wifiOn: !s.wifiOn }))}>
                                    <div className="w-[14px] h-[14px] bg-white rounded-full mx-0.5 shadow-sm"/>
                                </div>
                            </div>
                            {wifiOn && <>
                                <DropSep/>
                                <div className="px-4 py-1 text-[11px] text-gray-400 font-medium">Known Networks</div>
                                <DropItem label="✓  Home Wi-Fi" onClick={closeDropdown}/>
                                <DropItem label="    Office Network" onClick={closeDropdown}/>
                                <DropItem label="    Coffee Shop" onClick={closeDropdown}/>
                                <DropSep/>
                                <div className="px-4 py-1 text-[11px] text-gray-400 font-medium">Other Networks</div>
                                <DropItem label="    Guest-5G" onClick={closeDropdown}/>
                                <DropItem label="    NETGEAR-2.4G" onClick={closeDropdown}/>
                                <DropSep/>
                                <DropItem label="Other..." onClick={closeDropdown}/>
                                <DropItem label="Network Preferences..." onClick={() => { closeDropdown(); MacStore.openWindow('settings', 'System Settings', 920, 600); }}/>
                            </>}
                        </div>
                    )}
                </div>

                {/* Battery dropdown */}
                <div className="dropdown-container relative flex items-center h-full">
                    <button onClick={(e) => { e.stopPropagation(); setDropdown(dropdown === 'battery' ? null : 'battery'); }}
                        className="flex items-center gap-1 px-1.5 h-full hover:bg-white/10 rounded cursor-default" title="Battery">
                        <svg viewBox="0 0 28 16" width="22" height="12" fill="none" stroke="white" strokeWidth="1">
                            <rect x="0.5" y="1" width="22" height="12" rx="2.5" fill="none"/>
                            <rect x="2" y="2.5" width={Math.floor(batteryLevel.current * 0.18)} height="9" rx="1" fill="white" opacity="0.9"/>
                            <path d="M24 5.5 v3" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        {showBatteryPercentage && <span className="text-white text-[11px]">{batteryLevel.current}%</span>}
                    </button>
                    {dropdown === 'battery' && (
                        <div className="absolute top-[25px] right-0 glass-menu rounded-b-lg animate-menu-dropdown-in min-w-[240px] py-1 shadow-xl border border-black/10 z-[10001]">
                            <div className="px-4 py-2">
                                <div className="text-[13px] font-semibold">Battery</div>
                                <div className="text-[12px] text-gray-500 mt-0.5">{batteryLevel.current}% — Charging</div>
                            </div>
                            <DropSep/>
                            <div className="px-4 py-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: batteryLevel.current + '%' }}/>
                                    </div>
                                </div>
                            </div>
                            <DropSep/>
                            <div className="px-4 py-1 text-[11px] text-gray-400">Power Source: Power Adapter</div>
                            <div className="px-4 py-1 text-[11px] text-gray-400">Time to Full: 0:42</div>
                            <DropSep/>
                            <DropItem label="Battery Preferences..." onClick={() => { closeDropdown(); MacStore.openWindow('settings', 'System Settings', 920, 600); }}/>
                        </div>
                    )}
                </div>

                {/* Spotlight */}
                <MenuIcon title="Spotlight" onClick={() => MacStore.setState(s => ({ spotlightOpen: !s.spotlightOpen }))}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                </MenuIcon>

                {/* Siri */}
                <MenuIcon title="Siri">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                        <defs><linearGradient id="siri-g" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF2D55"/><stop offset="50%" stopColor="#AF52DE"/><stop offset="100%" stopColor="#5856D6"/>
                        </linearGradient></defs>
                        <circle cx="12" cy="12" r="10" fill="url(#siri-g)"/>
                    </svg>
                </MenuIcon>

                {/* Date/Time -> Notification Center */}
                <MenuIcon title="Notifications" onClick={() => MacStore.setState(s => ({ notificationCenterOpen: !s.notificationCenterOpen, controlCenterOpen: false }))}>
                    <span className="text-white text-[13px] font-medium whitespace-nowrap">{clock}</span>
                </MenuIcon>
            </div>
        </div>
    );
};

const MenuIcon = ({ children, onClick, title }) => (
    <button onClick={onClick} title={title} className="flex items-center px-1.5 h-full hover:bg-white/10 rounded cursor-default">
        {children}
    </button>
);

const DropItem = ({ label, shortcut, onClick, disabled, hasArrow }) => (
    <div className={`flex items-center justify-between px-4 py-[3px] mx-1 rounded text-[13px] cursor-default min-h-[22px]
        ${disabled ? 'text-gray-400 pointer-events-none' : 'hover:bg-blue-500 hover:text-white group'}`}
        onClick={onClick}
    >
        <span>{label}</span>
        <div className="flex items-center gap-2">
            {shortcut && <span className="text-[12px] text-gray-400 ml-6 group-hover:text-white/70">{shortcut}</span>}
            {hasArrow && <span className="text-[10px] text-gray-400 group-hover:text-white/70">&#9654;</span>}
        </div>
    </div>
);

const DropSep = () => <div className="h-px bg-black/10 my-1 mx-3"/>;

window.MenuBar = MenuBar;
