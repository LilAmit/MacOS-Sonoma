// Finder App - File browser with VFS, right-click context menu support
const FinderApp = () => {
    const [currentPath, setCurrentPath] = React.useState('/Users/user');
    const [selectedItem, setSelectedItem] = React.useState(null);
    const [activeSidebar, setActiveSidebar] = React.useState('Home');
    const [renaming, setRenaming] = React.useState(null);
    const [renameValue, setRenameValue] = React.useState('');
    const vfsVersion = useStore(s => s.vfsVersion);

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

    return (
        <div className="flex h-full" onKeyDown={handleKeyDown} tabIndex={0}>
            <div className="w-[200px] min-w-[200px] bg-gray-100/50 border-r border-black/5 py-2 overflow-y-auto">
                {sidebarItems.map(section => (
                    <div key={section.section} className="mb-3">
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-1">{section.section}</div>
                        {section.items.map(item => (
                            <div key={item.name}
                                className={`flex items-center gap-2 px-5 py-[3px] mx-2 rounded-md text-[13px] cursor-default ${activeSidebar === item.name ? 'bg-blue-500 text-white' : 'hover:bg-black/5'}`}
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
                    {files.map(file => (
                        <div key={file.name}
                            data-finder-file={file.name}
                            data-finder-path={currentPath}
                            data-file-type={file.type}
                            className={`flex flex-col items-center p-2 rounded-lg cursor-default gap-1 ${selectedItem === file.name ? 'bg-blue-500/15' : 'hover:bg-black/[0.03]'}`}
                            onClick={() => setSelectedItem(file.name)}
                            onDoubleClick={() => {
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
                    ))}
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
        </div>
    );
};

window.FinderApp = FinderApp;
