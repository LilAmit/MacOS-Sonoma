// Notes App - macOS-style with persistence, folders, save to desktop
const NotesApp = () => {
    const [notes, setNotes] = React.useState(() => {
        try { const s = localStorage.getItem('macos_notes'); if (s) return JSON.parse(s); } catch(e) {}
        return [
            { id: 1, folder: 'All iCloud', title: 'Meeting Notes', body: 'Discussed Q1 roadmap and priorities for the team.\n\n• Focus on performance improvements\n• Ship v2.0 by end of March\n• Hire two more engineers\n• Weekly design reviews starting next Monday\n\nAction items:\n- Set up project board\n- Schedule kickoff meeting\n- Review technical spec document', date: Date.now() - 3600000, pinned: false },
            { id: 2, folder: 'All iCloud', title: 'Shopping List', body: '• Milk\n• Eggs\n• Bread\n• Butter\n• Apples\n• Chicken breast\n• Olive oil\n• Rice\n• Avocados', date: Date.now() - 86400000, pinned: false },
            { id: 3, folder: 'All iCloud', title: 'Project Ideas', body: '1. Build a macOS web replica with React\n2. Create a CLI tool for git workflows\n3. Design a personal portfolio site\n4. Develop a Markdown editor\n5. Build a real-time chat app', date: Date.now() - 172800000, pinned: true },
            { id: 4, folder: 'All iCloud', title: 'Book Recommendations', body: '• The Design of Everyday Things - Don Norman\n• Clean Code - Robert C. Martin\n• Atomic Habits - James Clear\n• Deep Work - Cal Newport\n• The Pragmatic Programmer - Dave Thomas', date: Date.now() - 259200000, pinned: false },
        ];
    });
    const [activeId, setActiveId] = React.useState(1);
    const [activeFolder, setActiveFolder] = React.useState('All iCloud');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showFolderInput, setShowFolderInput] = React.useState(false);
    const [newFolderName, setNewFolderName] = React.useState('');
    const [folders, setFolders] = React.useState(() => {
        try { const s = localStorage.getItem('macos_notes_folders'); if (s) return JSON.parse(s); } catch(e) {}
        return ['All iCloud', 'Personal', 'Work'];
    });

    const saveNotes = (n) => { setNotes(n); localStorage.setItem('macos_notes', JSON.stringify(n)); };
    const saveFolders = (f) => { setFolders(f); localStorage.setItem('macos_notes_folders', JSON.stringify(f)); };

    const activeNote = notes.find(n => n.id === activeId);

    const filteredNotes = notes
        .filter(n => activeFolder === 'All iCloud' || n.folder === activeFolder)
        .filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.body.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => { if (a.pinned !== b.pinned) return b.pinned ? 1 : -1; return b.date - a.date; });

    const updateNote = (field, value) => {
        const updated = notes.map(n => n.id === activeId ? { ...n, [field]: value, date: Date.now() } : n);
        saveNotes(updated);
    };

    const addNote = () => {
        const newId = Date.now();
        const newNote = { id: newId, folder: activeFolder === 'All iCloud' ? 'All iCloud' : activeFolder, title: '', body: '', date: Date.now(), pinned: false };
        saveNotes([newNote, ...notes]);
        setActiveId(newId);
    };

    const deleteNote = () => {
        if (notes.length <= 1) return;
        const newNotes = notes.filter(n => n.id !== activeId);
        saveNotes(newNotes);
        const remaining = newNotes.filter(n => activeFolder === 'All iCloud' || n.folder === activeFolder);
        setActiveId(remaining.length > 0 ? remaining[0].id : newNotes[0].id);
    };

    const togglePin = () => {
        const updated = notes.map(n => n.id === activeId ? { ...n, pinned: !n.pinned } : n);
        saveNotes(updated);
    };

    const saveToDesktop = () => {
        if (!activeNote) return;
        const fileName = (activeNote.title || 'Untitled Note').replace(/[^a-zA-Z0-9 _-]/g, '') + '.txt';
        VFS.touch('/Users/user/Desktop', fileName, activeNote.title + '\n\n' + activeNote.body, '📝');
        MacStore.addNotification('Notes', 'Saved to Desktop', fileName + ' has been saved.');
    };

    const createFolder = () => {
        const name = newFolderName.trim();
        if (!name || folders.includes(name)) return;
        saveFolders([...folders, name]);
        setShowFolderInput(false);
        setNewFolderName('');
        setActiveFolder(name);
    };

    const deleteFolder = (name) => {
        if (name === 'All iCloud') return;
        // Move notes to All iCloud
        const updated = notes.map(n => n.folder === name ? { ...n, folder: 'All iCloud' } : n);
        saveNotes(updated);
        saveFolders(folders.filter(f => f !== name));
        if (activeFolder === name) setActiveFolder('All iCloud');
    };

    const formatDate = (ts) => {
        const d = new Date(ts);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        if (diff < 86400000) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        if (diff < 604800000) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const noteCount = notes.filter(n => activeFolder === 'All iCloud' || n.folder === activeFolder).length;

    return (
        <div className="flex h-full bg-white">
            {/* Folder sidebar */}
            <div className="w-[180px] min-w-[180px] bg-[#f5f5f5] border-r border-black/5 flex flex-col">
                <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/[0.04] border border-black/5">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="#999"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search" className="flex-1 bg-transparent outline-none text-[12px]"/>
                    </div>
                </div>
                <div className="px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1 mb-0.5 px-4">iCloud</div>
                <div className="flex-1 overflow-y-auto px-2">
                    {folders.map(f => (
                        <div key={f} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-default text-[12px] group ${activeFolder === f ? 'bg-[#007AFF] text-white' : 'hover:bg-black/[0.04]'}`}
                            onClick={() => { setActiveFolder(f); setSearchQuery(''); }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill={activeFolder === f ? 'white' : '#FFD60A'}><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                            <span className="flex-1 truncate">{f}</span>
                            <span className={`text-[10px] ${activeFolder === f ? 'text-white/60' : 'text-gray-400'}`}>
                                {notes.filter(n => f === 'All iCloud' || n.folder === f).length}
                            </span>
                            {f !== 'All iCloud' && (
                                <button onClick={(e) => { e.stopPropagation(); deleteFolder(f); }}
                                    className="opacity-0 group-hover:opacity-100 text-[12px] text-gray-400 hover:text-red-500">&times;</button>
                            )}
                        </div>
                    ))}
                    {showFolderInput && (
                        <div className="px-2 py-1">
                            <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowFolderInput(false); }}
                                placeholder="Folder name" className="w-full text-[12px] px-2 py-1 rounded border border-gray-300 outline-none focus:border-blue-500" autoFocus/>
                        </div>
                    )}
                </div>
                <div className="px-3 py-2 border-t border-black/5">
                    <button onClick={() => setShowFolderInput(true)} className="text-[11px] text-gray-400 hover:text-gray-600">+ New Folder</button>
                </div>
            </div>

            {/* Notes list */}
            <div className="w-[250px] min-w-[250px] border-r border-black/5 flex flex-col bg-white">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/5">
                    <div>
                        <div className="text-[14px] font-semibold">{activeFolder}</div>
                        <div className="text-[11px] text-gray-400">{noteCount} note{noteCount !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={deleteNote} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 text-gray-400" title="Delete">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                        <button onClick={addNote} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 text-[#007AFF]" title="New Note">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"/></svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredNotes.length === 0 && (
                        <div className="text-center text-gray-400 text-[12px] py-8">No notes</div>
                    )}
                    {filteredNotes.map(note => (
                        <div key={note.id}
                            className={`px-4 py-3 border-b border-black/[0.04] cursor-default ${activeId === note.id ? 'bg-[#007AFF]/[0.08]' : 'hover:bg-black/[0.02]'}`}
                            onClick={() => setActiveId(note.id)}>
                            <div className="flex items-center gap-1">
                                {note.pinned && <svg viewBox="0 0 24 24" width="10" height="10" fill="#FF9500"><path d="M17 4v7l2 3v2h-6v5l-1 1-1-1v-5H5v-2l2-3V4c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2z"/></svg>}
                                <div className="text-[13px] font-semibold truncate flex-1">{note.title || 'New Note'}</div>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400">{formatDate(note.date)}</span>
                                <span className="text-[11px] text-gray-400 truncate flex-1">{note.body.split('\n')[0] || 'No additional text'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col bg-white">
                {activeNote ? (
                    <>
                        <div className="flex items-center justify-between px-5 py-2 border-b border-black/5">
                            <div className="flex items-center gap-2">
                                <select value={activeNote.folder} onChange={e => updateNote('folder', e.target.value)}
                                    className="text-[11px] text-gray-500 bg-gray-100 border border-black/5 rounded px-2 py-0.5 outline-none cursor-default">
                                    {folders.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={togglePin} title={activeNote.pinned ? 'Unpin' : 'Pin'}
                                    className={`w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 ${activeNote.pinned ? 'text-[#FF9500]' : 'text-gray-400'}`}>
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17 4v7l2 3v2h-6v5l-1 1-1-1v-5H5v-2l2-3V4c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2z"/></svg>
                                </button>
                                <button onClick={saveToDesktop} title="Save to Desktop"
                                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 text-gray-400">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/></svg>
                                </button>
                                <button onClick={deleteNote} title="Delete"
                                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 text-gray-400 hover:text-red-500">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                            </div>
                        </div>
                        <div className="px-6 pt-4">
                            <input type="text" value={activeNote.title} onChange={e => updateNote('title', e.target.value)}
                                className="w-full text-[22px] font-bold outline-none bg-transparent text-gray-900" placeholder="Title"/>
                            <div className="text-[11px] text-gray-400 mt-1">{new Date(activeNote.date).toLocaleString()}</div>
                        </div>
                        <textarea value={activeNote.body} onChange={e => updateNote('body', e.target.value)}
                            className="flex-1 px-6 py-3 text-[14px] leading-relaxed outline-none bg-transparent resize-none text-gray-800"
                            placeholder="Start typing..."/>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-[13px]">
                        Select a note or create a new one
                    </div>
                )}
            </div>
        </div>
    );
};

window.NotesApp = NotesApp;
