// Spotlight Search
const SpotlightSearch = () => {
    const isOpen = useStore(s => s.spotlightOpen);
    const [query, setQuery] = React.useState('');
    const inputRef = React.useRef(null);

    const apps = [
        { name: 'Finder', type: 'finder' }, { name: 'Safari', type: 'safari' },
        { name: 'Messages', type: 'messages' }, { name: 'Mail', type: 'mail' },
        { name: 'Maps', type: 'maps' }, { name: 'Photos', type: 'photos' },
        { name: 'Notes', type: 'notes' }, { name: 'Calculator', type: 'calculator' },
        { name: 'Terminal', type: 'terminal' }, { name: 'System Settings', type: 'settings' },
        { name: 'TextEdit', type: 'textedit' }, { name: 'Calendar', type: 'calendar' },
    ];

    React.useEffect(() => {
        if (isOpen) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
    }, [isOpen]);

    if (!isOpen) return null;

    const q = query.toLowerCase();
    const matched = q ? apps.filter(a => a.name.toLowerCase().includes(q)) : [];

    // Try math
    let calcResult = null;
    if (q && /^[\d\s+\-*/().]+$/.test(q) && q.length > 1) {
        try { calcResult = Function('"use strict"; return (' + q + ')')(); if (isNaN(calcResult)) calcResult = null; } catch(e) {}
    }

    const close = () => MacStore.setState({ spotlightOpen: false });

    const openResult = (type) => {
        const sizes = { finder:{w:900,h:550}, safari:{w:1000,h:650}, calculator:{w:250,h:400}, notes:{w:800,h:550}, terminal:{w:650,h:420}, settings:{w:920,h:600}, messages:{w:800,h:550}, mail:{w:1000,h:600}, maps:{w:850,h:550}, photos:{w:900,h:600}, textedit:{w:650,h:500}, calendar:{w:800,h:600} };
        const s = sizes[type] || {w:800,h:500};
        MacStore.openWindow(type, apps.find(a=>a.type===type)?.name || type, s.w, s.h);
        close();
    };

    return (
        <div className="fixed inset-0 bg-black/25 z-[10002] flex items-start justify-center pt-[160px]"
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
            <div className="w-[680px] glass-menu rounded-xl shadow-2xl border border-black/10 overflow-hidden animate-spotlight-in">
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-black/5">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#999"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Escape') close();
                            if (e.key === 'Enter' && matched.length > 0) openResult(matched[0].type);
                        }}
                        placeholder="Spotlight Search" className="flex-1 bg-transparent outline-none text-[20px] font-light font-sf"/>
                </div>
                {(matched.length > 0 || calcResult !== null) && (
                    <div className="max-h-[400px] overflow-y-auto">
                        {matched.length > 0 && (
                            <div className="py-1">
                                <div className="text-[12px] font-semibold text-gray-400 px-5 py-1">Applications</div>
                                {matched.map((app, i) => (
                                    <div key={app.type}
                                        className={`flex items-center gap-3 px-5 py-1.5 mx-2 rounded-md cursor-default ${i === 0 ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'}`}
                                        onClick={() => openResult(app.type)}
                                    >
                                        <div className="w-8 h-8">
                                            {MacIcons[app.name.replace(' ','')] ? React.createElement(MacIcons[app.name.replace(' ','')], {size: 32}) :
                                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">{app.name[0]}</div>}
                                        </div>
                                        <div>
                                            <div className="text-[14px] font-medium">{app.name}</div>
                                            <div className={`text-[11px] ${i === 0 ? 'text-white/70' : 'text-gray-400'}`}>Application</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {calcResult !== null && (
                            <div className="py-1">
                                <div className="text-[12px] font-semibold text-gray-400 px-5 py-1">Calculator</div>
                                <div className="flex items-center gap-3 px-5 py-1.5 mx-2 rounded-md">
                                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-white text-sm">=</div>
                                    <div>
                                        <div className="text-[14px] font-medium">{calcResult}</div>
                                        <div className="text-[11px] text-gray-400">{query} =</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {q.length >= 2 && (
                            <div className="py-1 border-t border-black/5">
                                <div className="flex items-center gap-3 px-5 py-1.5 mx-2 rounded-md hover:bg-blue-500 hover:text-white cursor-default"
                                    onClick={() => { MacStore.openWindow('safari','Safari',1000,650); close(); }}>
                                    <div className="w-8 h-8"><MacIcons.Safari size={32}/></div>
                                    <div>
                                        <div className="text-[14px] font-medium">Search the web for "{query}"</div>
                                        <div className="text-[11px] text-gray-400">Safari - Google Search</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

window.SpotlightSearch = SpotlightSearch;
