// Context Menu - context-aware with smart edge positioning
const ContextMenuComponent = () => {
    const [menu, setMenu] = React.useState(null); // { x, y, type, data }
    const menuRef = React.useRef(null);

    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            const target = e.target;

            // Check if right-clicked on a desktop file
            const desktopFileEl = target.closest('[data-desktop-file]');
            if (desktopFileEl) {
                const name = desktopFileEl.getAttribute('data-desktop-file');
                const fileType = desktopFileEl.getAttribute('data-file-type');
                setMenu({ x: e.clientX, y: e.clientY, type: 'desktop-file', data: { name, fileType } });
                return;
            }

            // Check if right-clicked on a desktop app shortcut
            const desktopAppEl = target.closest('[data-desktop-app]');
            if (desktopAppEl) {
                const appType = desktopAppEl.getAttribute('data-desktop-app');
                const appName = desktopAppEl.getAttribute('data-app-name');
                setMenu({ x: e.clientX, y: e.clientY, type: 'desktop-app', data: { appType, appName } });
                return;
            }

            // Check if right-clicked on a finder file
            const finderFileEl = target.closest('[data-finder-file]');
            if (finderFileEl) {
                const name = finderFileEl.getAttribute('data-finder-file');
                const path = finderFileEl.getAttribute('data-finder-path');
                const fileType = finderFileEl.getAttribute('data-file-type');
                setMenu({ x: e.clientX, y: e.clientY, type: 'finder-file', data: { name, path, fileType } });
                return;
            }

            // Check if right-clicked on desktop background
            if (target.id === 'desktop-bg' || (target.closest('#desktop-bg') && !target.closest('.glass-menu') && !target.closest('.glass-dock'))) {
                setMenu({ x: e.clientX, y: e.clientY, type: 'desktop-bg', data: {} });
                return;
            }
        };

        const close = () => setMenu(null);
        document.addEventListener('contextmenu', handler);
        document.addEventListener('click', close);
        return () => { document.removeEventListener('contextmenu', handler); document.removeEventListener('click', close); };
    }, []);

    // Smart positioning - adjust if menu goes off screen
    React.useEffect(() => {
        if (!menu || !menuRef.current) return;
        const el = menuRef.current;
        const rect = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let { x, y } = menu;
        let changed = false;

        if (x + rect.width > vw - 8) { x = vw - rect.width - 8; changed = true; }
        if (y + rect.height > vh - 8) { y = vh - rect.height - 8; changed = true; }
        if (x < 4) { x = 4; changed = true; }
        if (y < 4) { y = 4; changed = true; }

        if (changed) {
            el.style.left = x + 'px';
            el.style.top = y + 'px';
        }
    });

    if (!menu) return null;

    const createNewFolder = () => {
        let name = 'untitled folder';
        let i = 1;
        while (VFS.exists('/Users/user/Desktop/' + name)) { name = 'untitled folder ' + i; i++; }
        VFS.mkdir('/Users/user/Desktop', name);
    };

    const createNewFile = () => {
        let name = 'untitled.txt';
        let i = 1;
        while (VFS.exists('/Users/user/Desktop/' + name)) { name = 'untitled ' + i + '.txt'; i++; }
        VFS.touch('/Users/user/Desktop', name, '');
    };

    const moveDesktopFileToTrash = (name) => {
        VFS.moveToTrash('/Users/user/Desktop', name);
        MacStore.addNotification('Finder', 'Moved to Trash', name + ' has been moved to the Trash.');
    };

    const moveFinderFileToTrash = (path, name) => {
        VFS.moveToTrash(path, name);
        MacStore.addNotification('Finder', 'Moved to Trash', name + ' has been moved to the Trash.');
    };

    const removeDesktopApp = (appType) => {
        VFS.removeDesktopApp(appType);
    };

    const renderItems = () => {
        switch (menu.type) {
            case 'desktop-file':
                return (<>
                    <CtxItem label="Open" onClick={() => {
                        const n = menu.data.name;
                        if (menu.data.fileType === 'folder') MacStore.openWindow('finder', 'Finder', 900, 550);
                        else if (n.endsWith('.py')) {
                            MacStore.setState({ pendingOpenFile: { path: '/Users/user/Desktop', name: n } });
                            MacStore.openWindow('vscode', 'VS Code', 950, 650);
                        }
                        else if (n.endsWith('.txt') || n.endsWith('.md') || n.endsWith('.docx') || n.endsWith('.doc')) {
                            MacStore.setState({ pendingOpenFile: { path: '/Users/user/Desktop', name: n } });
                            MacStore.openWindow('word', 'Word', 900, 700);
                        }
                    }}/>
                    <CtxItem label="Get Info"/>
                    <div className="h-px bg-black/10 my-1 mx-3"/>
                    <CtxItem label="Move to Trash" danger onClick={() => moveDesktopFileToTrash(menu.data.name)}/>
                </>);

            case 'desktop-app':
                return (<>
                    <CtxItem label="Open" onClick={() => {
                        const sizes = { finder:{w:900,h:550}, safari:{w:1000,h:650}, calculator:{w:250,h:400}, notes:{w:800,h:550}, terminal:{w:650,h:420}, settings:{w:920,h:600}, messages:{w:800,h:550}, mail:{w:1000,h:600}, maps:{w:850,h:550}, photos:{w:900,h:600}, word:{w:900,h:700}, trash:{w:700,h:450}, calendar:{w:800,h:600}, music:{w:950,h:600}, appstore:{w:950,h:650}, snake:{w:530,h:500}, tetris:{w:480,h:560}, game2048:{w:430,h:550}, vscode:{w:950,h:650}, paint:{w:1000,h:700} };
                        const s = sizes[menu.data.appType] || { w: 800, h: 500 };
                        MacStore.openWindow(menu.data.appType, menu.data.appName, s.w, s.h);
                    }}/>
                    <CtxItem label="Get Info"/>
                    <div className="h-px bg-black/10 my-1 mx-3"/>
                    <CtxItem label="Remove from Desktop" onClick={() => removeDesktopApp(menu.data.appType)}/>
                </>);

            case 'finder-file':
                return (<>
                    <CtxItem label="Open" onClick={() => {
                        const n = menu.data.name;
                        if (menu.data.fileType === 'folder') {
                            // Finder navigation handled separately
                        } else if (n.endsWith('.py')) {
                            MacStore.setState({ pendingOpenFile: { path: menu.data.path, name: n } });
                            MacStore.openWindow('vscode', 'VS Code', 950, 650);
                        } else if (n.endsWith('.txt') || n.endsWith('.md') || n.endsWith('.docx') || n.endsWith('.doc')) {
                            MacStore.setState({ pendingOpenFile: { path: menu.data.path, name: n } });
                            MacStore.openWindow('word', 'Word', 900, 700);
                        }
                    }}/>
                    <CtxItem label="Get Info"/>
                    <CtxItem label="Rename"/>
                    <div className="h-px bg-black/10 my-1 mx-3"/>
                    <CtxItem label="Move to Trash" danger onClick={() => moveFinderFileToTrash(menu.data.path, menu.data.name)}/>
                </>);

            case 'desktop-bg':
            default:
                return (<>
                    <CtxItem label="New Folder" onClick={createNewFolder}/>
                    <CtxItem label="New File" onClick={createNewFile}/>
                    <div className="h-px bg-black/10 my-1 mx-3"/>
                    <CtxItem label="Get Info"/>
                    <CtxItem label="Change Wallpaper..." onClick={() => MacStore.nextWallpaper()}/>
                    <div className="h-px bg-black/10 my-1 mx-3"/>
                    <CtxItem label="Sort By" hasArrow/>
                    <CtxItem label="Clean Up"/>
                    <div className="h-px bg-black/10 my-1 mx-3"/>
                    <CtxItem label="Add App to Desktop" onClick={() => {
                        const apps = ['safari','calculator','notes','terminal','music','photos','maps'];
                        const names = ['Safari','Calculator','Notes','Terminal','Music','Photos','Maps'];
                        const idx = Math.floor(Math.random() * apps.length);
                        VFS.addDesktopApp(apps[idx], names[idx]);
                    }}/>
                    <CtxItem label="Open Finder" onClick={() => MacStore.openWindow('finder','Finder',900,550)}/>
                </>);
        }
    };

    return (
        <div ref={menuRef} className="fixed glass-menu rounded-lg min-w-[220px] py-1 shadow-xl border border-black/10 z-[10003]"
            style={{ left: menu.x, top: menu.y }}>
            {renderItems()}
        </div>
    );
};

const CtxItem = ({ label, onClick, hasArrow, danger }) => (
    <div className={`flex items-center justify-between px-4 py-[3px] mx-1 rounded text-[13px] cursor-default min-h-[22px] hover:bg-blue-500 hover:text-white ${danger ? 'text-red-500' : ''}`}
        onClick={onClick}>
        <span>{label}</span>
        {hasArrow && <span className="text-[10px] text-gray-400">&#9654;</span>}
    </div>
);

window.ContextMenuComponent = ContextMenuComponent;
