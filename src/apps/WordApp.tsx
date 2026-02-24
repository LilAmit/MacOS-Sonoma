// Word App - Document editor with Save To Mac and file opening from desktop
const WordApp = () => {
    const [docs, setDocs] = React.useState(() => {
        try { const s = localStorage.getItem('macos_word_docs'); if (s) return JSON.parse(s); } catch(e) {}
        return [
            { id: 1, name: 'Welcome Document', content: '<h1 style="margin-bottom:12px">Welcome to Word</h1><p style="margin-bottom:8px">This is a rich text document editor. Use the toolbar above to format your text.</p><p style="margin-bottom:8px">You can make text <b>bold</b>, <i>italic</i>, <u>underlined</u>, or <s>strikethrough</s>.</p><h2 style="margin-bottom:8px">Features</h2><ul><li>Rich text formatting</li><li>Multiple documents</li><li>Save to any folder</li><li>Auto-save changes</li></ul>', date: Date.now() },
            { id: 2, name: 'Meeting Notes', content: '<h2 style="margin-bottom:8px">Team Meeting - February 2026</h2><p style="margin-bottom:8px"><b>Attendees:</b> John, Sarah, Mike, Lisa</p><ol><li>Q1 Review</li><li>Project Updates</li><li>Resource Planning</li></ol>', date: Date.now() - 86400000 },
        ];
    });
    const [activeDocId, setActiveDocId] = React.useState(1);
    const [showNewDoc, setShowNewDoc] = React.useState(false);
    const [newDocName, setNewDocName] = React.useState('');
    const [showSaveDialog, setShowSaveDialog] = React.useState(false);
    const [savePath, setSavePath] = React.useState('/Users/user/Desktop');
    const [saveFileName, setSaveFileName] = React.useState('');
    const editorRef = React.useRef(null);
    const saveTimer = React.useRef(null);
    const loadedPending = React.useRef(false);

    const saveDocs = (d) => { setDocs(d); localStorage.setItem('macos_word_docs', JSON.stringify(d)); };
    const activeDoc = docs.find(d => d.id === activeDocId);

    // Check for pending file to open from desktop/finder
    React.useEffect(() => {
        if (loadedPending.current) return;
        loadedPending.current = true;
        const state = MacStore.getState();
        if (state.pendingOpenFile) {
            const { path, name } = state.pendingOpenFile;
            MacStore.setState({ pendingOpenFile: null });
            const fullPath = path + '/' + name;
            const content = VFS.readFile(fullPath);
            if (content !== null) {
                // Check if doc already exists with this name
                const existing = docs.find(d => d.name === name);
                if (existing) {
                    // Update and switch to it
                    const htmlContent = content.includes('<') ? content : '<p>' + content.replace(/\n/g, '</p><p>') + '</p>';
                    saveDocs(docs.map(d => d.id === existing.id ? { ...d, content: htmlContent } : d));
                    setActiveDocId(existing.id);
                } else {
                    const htmlContent = content.includes('<') ? content : '<p>' + content.replace(/\n/g, '</p><p>') + '</p>';
                    const newDoc = { id: Date.now(), name, content: htmlContent, date: Date.now(), filePath: path };
                    saveDocs([newDoc, ...docs]);
                    setActiveDocId(newDoc.id);
                }
            }
        }
    }, []);

    const createDoc = () => {
        let name = newDocName.trim() || 'Untitled Document';
        const newDoc = { id: Date.now(), name, content: '<p>Start writing here...</p>', date: Date.now() };
        saveDocs([newDoc, ...docs]);
        setActiveDocId(newDoc.id);
        setShowNewDoc(false);
        setNewDocName('');
    };

    const deleteDoc = (id) => {
        if (docs.length <= 1) return;
        const nd = docs.filter(d => d.id !== id);
        saveDocs(nd);
        if (activeDocId === id) setActiveDocId(nd[0].id);
    };

    const saveContent = () => {
        if (!editorRef.current) return;
        const content = editorRef.current.innerHTML;
        saveDocs(docs.map(d => d.id === activeDocId ? { ...d, content, date: Date.now() } : d));
    };

    const handleInput = () => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(saveContent, 500);
    };

    React.useEffect(() => {
        if (editorRef.current && activeDoc) editorRef.current.innerHTML = activeDoc.content;
    }, [activeDocId]);

    const execCmd = (cmd, val) => {
        document.execCommand(cmd, false, val);
        editorRef.current?.focus();
        handleInput();
    };

    // Save to specific location (Save To Mac)
    const openSaveDialog = () => {
        setSaveFileName((activeDoc?.name || 'Untitled').replace(/[^a-zA-Z0-9 _-]/g, '') + '.txt');
        setSavePath('/Users/user/Desktop');
        setShowSaveDialog(true);
    };

    const saveToLocation = () => {
        if (!activeDoc || !editorRef.current) return;
        const text = editorRef.current.innerText;
        const htmlContent = editorRef.current.innerHTML;
        const fn = saveFileName || 'Untitled.txt';
        VFS.touch(savePath, fn, fn.endsWith('.html') ? htmlContent : text, '📄');
        MacStore.addNotification('Word', 'File Saved', fn + ' saved to ' + savePath.replace('/Users/user/', '~/'));
        setShowSaveDialog(false);
    };

    const saveToDesktop = () => {
        if (!activeDoc || !editorRef.current) return;
        const text = editorRef.current.innerText;
        const htmlContent = editorRef.current.innerHTML;
        const fileName = (activeDoc.name || 'Untitled').replace(/[^a-zA-Z0-9 _-]/g, '') + '.txt';
        VFS.touch('/Users/user/Desktop', fileName, text, '📄');
        // Also save HTML content for reopening
        VFS.touch('/Users/user/Desktop', '.' + fileName + '.html', htmlContent);
        MacStore.addNotification('Word', 'Saved to Desktop', fileName + ' has been saved.');
    };

    const saveFolders = VFS.ls(savePath).filter(f => f.type === 'folder');

    const [fontSize, setFontSize] = React.useState('3');
    const [fontFamily, setFontFamily] = React.useState('Inter');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Ribbon */}
            <div className="bg-[#2b579a] px-3 py-1 flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/></svg>
                    <span className="text-white text-[13px] font-semibold">{activeDoc?.name || 'Word'}</span>
                </div>
                <div className="flex-1"/>
                <button onClick={saveToDesktop} className="text-white/80 text-[11px] hover:text-white px-2 py-0.5 rounded hover:bg-white/10">Save to Desktop</button>
                <button onClick={openSaveDialog} className="text-white text-[11px] px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 font-medium">Save To Mac</button>
            </div>
            <div className="bg-[#f3f3f3] border-b border-gray-300 px-2 py-1.5 flex items-center gap-1 flex-wrap">
                <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); execCmd('fontName', e.target.value); }}
                    className="text-[11px] border border-gray-300 rounded px-1 py-0.5 bg-white outline-none w-[100px]">
                    {['Inter', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={fontSize} onChange={e => { setFontSize(e.target.value); execCmd('fontSize', e.target.value); }}
                    className="text-[11px] border border-gray-300 rounded px-1 py-0.5 bg-white outline-none w-[50px]">
                    {[{v:'1',l:'8'},{v:'2',l:'10'},{v:'3',l:'12'},{v:'4',l:'14'},{v:'5',l:'18'},{v:'6',l:'24'},{v:'7',l:'36'}].map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
                <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                <button onClick={() => execCmd('bold')} className="px-1.5 py-0.5 rounded text-[12px] font-bold hover:bg-gray-200 border border-transparent hover:border-gray-300" title="Bold">B</button>
                <button onClick={() => execCmd('italic')} className="px-1.5 py-0.5 rounded text-[12px] italic hover:bg-gray-200 border border-transparent hover:border-gray-300" title="Italic"><em>I</em></button>
                <button onClick={() => execCmd('underline')} className="px-1.5 py-0.5 rounded text-[12px] underline hover:bg-gray-200 border border-transparent hover:border-gray-300" title="Underline">U</button>
                <button onClick={() => execCmd('strikethrough')} className="px-1.5 py-0.5 rounded text-[12px] line-through hover:bg-gray-200 border border-transparent hover:border-gray-300">S</button>
                <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                <input type="color" defaultValue="#000000" onChange={e => execCmd('foreColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer border border-gray-300" title="Text Color"/>
                <input type="color" defaultValue="#ffffff" onChange={e => execCmd('hiliteColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer border border-gray-300" title="Highlight"/>
                <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                <button onClick={() => execCmd('justifyLeft')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#555"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>
                </button>
                <button onClick={() => execCmd('justifyCenter')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#555"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>
                </button>
                <button onClick={() => execCmd('justifyRight')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#555"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>
                </button>
                <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                <button onClick={() => execCmd('insertUnorderedList')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#555"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
                </button>
                <button onClick={() => execCmd('insertOrderedList')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#555"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
                </button>
                <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                <button onClick={() => execCmd('formatBlock', '<h1>')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300 text-[11px] font-bold">H1</button>
                <button onClick={() => execCmd('formatBlock', '<h2>')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300 text-[11px] font-bold">H2</button>
                <button onClick={() => execCmd('formatBlock', '<p>')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300 text-[11px]">P</button>
                <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                <button onClick={() => execCmd('undo')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#555"><path d="M12.5 8c-2.65 0-5.05 1.04-6.83 2.74L2.5 7.5v9h9l-3.19-3.19c1.33-1.28 3.07-2.06 5.04-2.06 3.24 0 6.02 2.07 7.05 5l2.1-.66C21.11 11.97 17.14 8 12.5 8z"/></svg>
                </button>
                <button onClick={() => execCmd('redo')} className="px-1.5 py-0.5 rounded hover:bg-gray-200 border border-transparent hover:border-gray-300">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#555"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Document sidebar */}
                <div className="w-[180px] min-w-[180px] bg-[#f7f7f7] border-r border-gray-200 flex flex-col">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                        <span className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">Documents</span>
                        <button onClick={() => setShowNewDoc(true)} className="text-[#2b579a] text-[16px] hover:text-[#1e3f7a]">+</button>
                    </div>
                    {showNewDoc && (
                        <div className="px-2 py-1 border-b border-gray-200">
                            <input type="text" value={newDocName} onChange={e => setNewDocName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') createDoc(); if (e.key === 'Escape') setShowNewDoc(false); }}
                                placeholder="Document name" className="w-full text-[11px] px-2 py-1 rounded border border-gray-300 outline-none focus:border-[#2b579a]" autoFocus/>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto">
                        {docs.map(d => (
                            <div key={d.id} className={`flex items-center gap-2 px-3 py-2 cursor-default group border-b border-gray-100 ${activeDocId === d.id ? 'bg-[#2b579a]/10' : 'hover:bg-gray-100'}`}
                                onClick={() => { saveContent(); setActiveDocId(d.id); }}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="#2b579a"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/></svg>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-medium truncate">{d.name}</div>
                                    <div className="text-[10px] text-gray-400">{new Date(d.date).toLocaleDateString()}</div>
                                </div>
                                {docs.length > 1 && (
                                    <button onClick={(e) => { e.stopPropagation(); deleteDoc(d.id); }}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-[14px]">&times;</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Document editor */}
                <div className="flex-1 overflow-auto bg-[#e8e8e8] flex justify-center py-6">
                    <div className="bg-white shadow-lg rounded-sm" style={{ width: '680px', minHeight: '880px', padding: '60px 70px' }}>
                        <div ref={editorRef} contentEditable suppressContentEditableWarning
                            onInput={handleInput}
                            className="outline-none text-[14px] leading-relaxed min-h-[700px]"
                            style={{ fontFamily: fontFamily + ', sans-serif' }}/>
                    </div>
                </div>
            </div>

            {/* Status bar */}
            <div className="h-[22px] bg-[#2b579a] flex items-center px-3 text-white text-[10px] gap-4">
                <span>Page 1 of 1</span>
                <span>{activeDoc?.name}</span>
                <span className="ml-auto">Word</span>
            </div>

            {/* Save To Mac dialog */}
            {showSaveDialog && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 rounded-b-xl">
                    <div className="bg-white rounded-xl shadow-2xl w-[480px] overflow-hidden">
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-[14px] font-semibold">Save To Mac</h3>
                            <button onClick={() => setShowSaveDialog(false)} className="text-gray-400 hover:text-gray-600 text-[18px]">&times;</button>
                        </div>
                        <div className="p-4">
                            <div className="text-[12px] text-gray-500 mb-2">Save to: <span className="font-medium text-gray-700">{savePath.replace('/Users/user/', '~/')}</span></div>
                            <div className="border border-gray-200 rounded-lg h-[200px] overflow-y-auto mb-3">
                                {savePath !== '/Users/user' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 cursor-default text-[13px] border-b border-gray-100"
                                        onClick={() => { const parts = savePath.split('/'); parts.pop(); setSavePath(parts.join('/')); }}>
                                        <span>⬆️</span><span className="text-gray-500">Go Up</span>
                                    </div>
                                )}
                                {saveFolders.map(f => (
                                    <div key={f.name} className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 cursor-default text-[13px] border-b border-gray-100"
                                        onClick={() => setSavePath(savePath + '/' + f.name)}>
                                        <span>📁</span><span>{f.name}</span>
                                    </div>
                                ))}
                                {saveFolders.length === 0 && <div className="text-center text-gray-400 text-[12px] py-4">No subfolders</div>}
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[12px] text-gray-500">File name:</span>
                                <input type="text" value={saveFileName} onChange={e => setSaveFileName(e.target.value)}
                                    className="flex-1 text-[13px] px-2 py-1 rounded border border-gray-300 outline-none focus:border-blue-500"/>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowSaveDialog(false)} className="px-4 py-1.5 rounded-lg bg-gray-100 text-[13px] font-medium hover:bg-gray-200">Cancel</button>
                                <button onClick={saveToLocation} className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.WordApp = WordApp;
