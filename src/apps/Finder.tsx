// Finder App - File browser with VFS, drag-and-drop, right-click context menu support
const FinderApp = () => {
    const [currentPath, setCurrentPath] = React.useState('/Users/user');
    const [selectedItem, setSelectedItem] = React.useState(null);
    const [activeSidebar, setActiveSidebar] = React.useState('Home');
    const [renaming, setRenaming] = React.useState(null);
    const [renameValue, setRenameValue] = React.useState('');
    const [dragOverItem, setDragOverItem] = React.useState(null);
    const [dragOverSidebar, setDragOverSidebar] = React.useState(null);
    const [draggingItem, setDraggingItem] = React.useState(null);
    const [dragGhost, setDragGhost] = React.useState(null);
    const vfsVersion = useStore(s => s.vfsVersion);
    const fileDrag = useStore(s => s.fileDrag);
    const dragRef = React.useRef({ startX: 0, startY: 0, name: null, moved: false, currentPath: '' });
    const containerRef = React.useRef(null);

    const sidebarItems = [
        { section: 'Favorites', items: [
            { name: 'Home', icon: '🏠', path: '/Users/user' },
            { name: 'Desktop', icon: '🖥️', path: '/Users/user/Desktop' },
            { name: 'Documents', icon: '📄', path: '/Users/user/Documents' },
            { name: 'Downloads', icon: '⬇️', path: '/Users/user/Downloads' },
            { name: 'Applications', icon: '📱', path: '/Users/user/Applications' },
            { name: 'Pictures', icon: '🖼️', path: '/Users/user/Pictures' },
        ]},
        { section: 'iCloud', items: [
            { name: 'iCloud Drive', icon: '☁️', path: '/Users/user' },
        ]},
        { section: 'Locations', items: [
            { name: 'Macintosh HD', icon: '💻', path: '/Users/user' },
        ]},
        { section: 'Tags', items: [
            { name: 'Red', color: '#FF3B30' },
            { name: 'Orange', color: '#FF9500' },
            { name: 'Green', color: '#34C759' },
            { name: 'Blue', color: '#007AFF' },
            { name: 'Purple', color: '#AF52DE' },
        ]},
    ];

    const files = VFS.ls(currentPath);

    const navigateTo = (item) => {
        if (item.type === 'folder') {
            const newPath = currentPath + '/' + item.name;
            if (VFS.isDir(newPath)) { setCurrentPath(newPath); setSelectedItem(null); }
        }
    };

    const goBack = () => {
        const parts = currentPath.split('/');
        if (parts.length > 3) { parts.pop(); const np = parts.join('/'); if (VFS.isDir(np)) setCurrentPath(np); }
    };

    const createNewFolder = () => {
        let name = 'untitled folder'; let i = 1;
        while (VFS.exists(currentPath + '/' + name)) { name = 'untitled folder ' + i; i++; }
        VFS.mkdir(currentPath, name);
    };

    const createNewFile = () => {
        let name = 'untitled.txt'; let i = 1;
        while (VFS.exists(currentPath + '/' + name)) { name = 'untitled ' + i + '.txt'; i++; }
        VFS.touch(currentPath, name, '');
    };

    const moveToTrash = () => {
        if (selectedItem) {
            VFS.moveToTrash(currentPath, selectedItem);
            MacStore.addNotification('Finder', 'Moved to Trash', selectedItem + ' has been moved to the Trash.');
            setSelectedItem(null);
        }
    };

    const startRename = (name) => { setRenaming(name); setRenameValue(name); };

    const finishRename = () => {
        if (renaming && renameValue && renameValue !== renaming) VFS.rename(currentPath, renaming, renameValue);
        setRenaming(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedItem && !renaming) moveToTrash(); }
        if (e.key === 'Enter' && selectedItem && !renaming) startRename(selectedItem);
    };

    // Helper: find drop target from mouse position using elementFromPoint
    const findDropTarget = (clientX, clientY) => {
        const el = document.elementFromPoint(clientX, clientY);
        if (!el) return { folder: null, sidebar: null };

        // Check if over a folder in the file grid
        const folderEl = el.closest('[data-finder-folder]');
        if (folderEl) {
            return { folder: folderEl.getAttribute('data-finder-folder'), sidebar: null };
        }

        // Check if over a sidebar item
        const sidebarEl = el.closest('[data-sidebar-path]');
        if (sidebarEl) {
            return { folder: null, sidebar: sidebarEl.getAttribute('data-sidebar-path') };
        }

        return { folder: null, sidebar: null };
    };

    // --- Drag-and-drop for Finder files ---
    const handleFileMouseDown = (e, fileName) => {
        if (e.button !== 0 || renaming) return;
        dragRef.current = { startX: e.clientX, startY: e.clientY, name: fileName, moved: false, currentPath };

        const onMove = (ev) => {
            const dx = ev.clientX - dragRef.current.startX;
            const dy = ev.clientY - dragRef.current.startY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragRef.current.moved = true;
            if (!dragRef.current.moved) return;

            setDraggingItem(dragRef.current.name);
            setDragGhost({ x: ev.clientX, y: ev.clientY });

            // Set global drag state
            const state = MacStore.getState();
            if (!state.fileDrag || state.fileDrag.name !== dragRef.current.name) {
                MacStore.setState({ fileDrag: { name: dragRef.current.name, sourcePath: dragRef.current.currentPath, type: 'finder' } });
            }

            // Detect drop targets via elementFromPoint
            const { folder, sidebar } = findDropTarget(ev.clientX, ev.clientY);
            setDragOverItem(folder && folder !== dragRef.current.name ? folder : null);
            setDragOverSidebar(sidebar);
        };

        const onUp = (ev) => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);

            if (dragRef.current.moved) {
                const dragName = dragRef.current.name;
                const srcPath = dragRef.current.currentPath;

                // Detect final drop target
                const { folder, sidebar } = findDropTarget(ev.clientX, ev.clientY);

                if (folder && folder !== dragName) {
                    // Dropped on a folder in the file grid
                    const destPath = srcPath + '/' + folder;
                    if (VFS.isDir(destPath)) {
                        VFS.move(srcPath, dragName, destPath);
                        MacStore.addNotification('Finder', 'Moved', dragName + ' → ' + folder);
                    }
                } else if (sidebar && sidebar !== srcPath) {
                    // Dropped on a sidebar location
                    VFS.move(srcPath, dragName, sidebar);
                    MacStore.addNotification('Finder', 'Moved', dragName + ' → ' + sidebar.split('/').pop());
                } else {
                    // Check if dropped outside Finder (onto desktop)
                    const el = document.elementFromPoint(ev.clientX, ev.clientY);
                    if (el && (el.id === 'desktop-bg' || (el.closest('#desktop-bg') && !el.closest('.glass-dock') && !el.closest('[data-finder-file]')))) {
                        if (srcPath !== '/Users/user/Desktop') {
                            VFS.move(srcPath, dragName, '/Users/user/Desktop');
                            MacStore.addNotification('Finder', 'Moved to Desktop', dragName);
                        }
                    }
                }
            }

            setDraggingItem(null);
            setDragGhost(null);
            setDragOverItem(null);
            setDragOverSidebar(null);
            MacStore.setState({ fileDrag: null });
            dragRef.current.moved = false;
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    // Handle drops from Desktop onto Finder
    React.useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;

        const onMouseUp = (e) => {
            const drag = MacStore.getState().fileDrag;
            if (drag && drag.type === 'desktop' && drag.sourcePath) {
                const target = document.elementFromPoint(e.clientX, e.clientY);
                if (target && (el.contains(target) || target === el)) {
                    const folderEl = target.closest('[data-finder-folder]');
                    if (folderEl) {
                        const folderName = folderEl.getAttribute('data-finder-folder');
                        const destPath = currentPath + '/' + folderName;
                        if (VFS.isDir(destPath)) {
                            VFS.move(drag.sourcePath, drag.name, destPath);
                            MacStore.addNotification('Finder', 'Moved', drag.name + ' → ' + folderName);
                        }
                    } else {
                        if (drag.sourcePath !== currentPath) {
                            VFS.move(drag.sourcePath, drag.name, currentPath);
                            MacStore.addNotification('Finder', 'Moved', drag.name + ' → ' + currentPath.split('/').pop());
                        }
                    }
                }
            }
        };

        el.addEventListener('mouseup', onMouseUp);
        return () => el.removeEventListener('mouseup', onMouseUp);
    }, [currentPath]);

    return (
        <div ref={containerRef} className="flex h-full" onKeyDown={handleKeyDown} tabIndex={0}>
            <div className="w-[200px] min-w-[200px] bg-gray-100/50 border-r border-black/5 py-2 overflow-y-auto">
                {sidebarItems.map(section => (
                    <div key={section.section} className="mb-3">
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-1">{section.section}</div>
                        {section.items.map(item => (
                            <div key={item.name}
                                data-sidebar-path={item.path || ''}
                                className={`flex items-center gap-2 px-5 py-[3px] mx-2 rounded-md text-[13px] cursor-default transition-colors
                                    ${activeSidebar === item.name ? 'bg-blue-500 text-white' : 'hover:bg-black/5'}
                                    ${dragOverSidebar === item.path ? 'bg-blue-400/30 ring-2 ring-blue-400/50' : ''}`}
                                onClick={() => { setActiveSidebar(item.name); if (item.path) setCurrentPath(item.path); }}>
                                {item.color ? <div className="w-3 h-3 rounded-full" style={{ background: item.color }}/> : <span className="text-sm">{item.icon}</span>}
                                <span>{item.name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/70 border-b border-black/5">
                    <button onClick={goBack} className="p-1.5 rounded-md hover:bg-black/5">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#666"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                    <div className="flex-1"/>
                    <button onClick={createNewFolder} className="p-1.5 rounded-md hover:bg-black/5" title="New Folder">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#666"><path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm0 12H4V8h16v10zm-8-1h2v-3h3v-2h-3V9h-2v3H9v2h3v3z"/></svg>
                    </button>
                    <button onClick={createNewFile} className="p-1.5 rounded-md hover:bg-black/5" title="New File">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#666"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"/></svg>
                    </button>
                    {selectedItem && (
                        <button onClick={moveToTrash} className="p-1.5 rounded-md hover:bg-red-100 text-red-500" title="Move to Trash">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                    )}
                </div>

                <div className="flex-1 p-3 overflow-auto grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', alignContent: 'start' }}>
                    {files.map(file => {
                        const isDragging = draggingItem === file.name;
                        const isDropTarget = dragOverItem === file.name && file.type === 'folder';
                        const isExternalDropTarget = fileDrag && fileDrag.type === 'desktop' && dragOverItem === file.name && file.type === 'folder';

                        return (
                            <div key={file.name}
                                data-finder-file={file.name}
                                data-finder-path={currentPath}
                                data-file-type={file.type}
                                data-finder-folder={file.type === 'folder' ? file.name : undefined}
                                className={`flex flex-col items-center p-2 rounded-lg cursor-default gap-1 transition-all
                                    ${selectedItem === file.name ? 'bg-blue-500/15' : 'hover:bg-black/[0.03]'}
                                    ${isDragging ? 'opacity-40' : ''}
                                    ${isDropTarget || isExternalDropTarget ? 'bg-blue-400/20 ring-2 ring-blue-400/50 scale-105' : ''}`}
                                onClick={() => setSelectedItem(file.name)}
                                onMouseDown={(e) => handleFileMouseDown(e, file.name)}
                                onDoubleClick={() => {
                                    if (dragRef.current.moved) return;
                                    if (file.type === 'folder') navigateTo(file);
                                    else if (file.name.endsWith('.py')) {
                                        MacStore.setState({ pendingOpenFile: { path: currentPath, name: file.name } });
                                        MacStore.openWindow('vscode', 'VS Code', 950, 650);
                                    }
                                    else if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                                        MacStore.setState({ pendingOpenFile: { path: currentPath, name: file.name } });
                                        MacStore.openWindow('word', 'Word', 900, 700);
                                    }
                                }}>
                                <div className="w-[54px] h-[54px] flex items-center justify-center text-4xl">
                                    {file.type === 'folder' ? (
                                        <svg viewBox="0 0 48 48" width="48" height="48">
                                            <path d="M6 8h14l4 4h18c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill={file.color || '#64B5F6'}/>
                                            <rect x="4" y="14" width="40" height="24" rx="2" fill={file.color || '#42A5F5'} opacity="0.85"/>
                                        </svg>
                                    ) : <span>{file.icon}</span>}
                                </div>
                                <div className="text-[11px] text-center leading-tight max-w-[80px] break-words">
                                    {renaming === file.name ? (
                                        <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                                            onBlur={finishRename} onKeyDown={(e) => { if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') setRenaming(null); }}
                                            className="w-full text-center bg-white border border-blue-500 rounded px-1 outline-none text-[11px]" autoFocus/>
                                    ) : file.name}
                                </div>
                            </div>
                        );
                    })}
                    {files.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 text-[13px] py-12">This folder is empty</div>
                    )}
                </div>

                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100/70 border-t border-black/5 text-[11px] text-gray-400">
                    <span>{files.length} items</span>
                    <span className="mx-2">·</span>
                    <span>{currentPath.replace('/Users/user', '~')}</span>
                </div>
            </div>

            {/* Drag ghost overlay */}
            {dragGhost && draggingItem && (
                <div className="fixed pointer-events-none z-[99999]"
                    style={{ left: dragGhost.x + 12, top: dragGhost.y - 12 }}>
                    <div className="bg-blue-500/80 text-white text-[11px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                        {draggingItem}
                    </div>
                </div>
            )}
        </div>
    );
};

window.FinderApp = FinderApp;
