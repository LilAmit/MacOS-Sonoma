// Safari App - Real web browsing via iframe
const SafariApp = () => {
    const [url, setUrl] = React.useState('');
    const [displayUrl, setDisplayUrl] = React.useState('');
    const [currentUrl, setCurrentUrl] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [showStartPage, setShowStartPage] = React.useState(true);
    const [tabs, setTabs] = React.useState([{ id: 1, title: 'Start Page', url: '' }]);
    const [activeTab, setActiveTab] = React.useState(1);
    const [iframeError, setIframeError] = React.useState(false);
    const iframeRef = React.useRef(null);

    const favorites = [
        { name: 'Google', url: 'https://www.google.com/webhp?igu=1', color: '#4285F4', letter: 'G' },
        { name: 'Wikipedia', url: 'https://en.m.wikipedia.org', color: '#666', letter: 'W' },
        { name: 'DuckDuckGo', url: 'https://duckduckgo.com', color: '#DE5833', letter: 'D' },
        { name: 'Hacker News', url: 'https://news.ycombinator.com', color: '#FF6600', letter: 'Y' },
        { name: 'Archive.org', url: 'https://archive.org', color: '#333', letter: 'A' },
        { name: 'OpenAI', url: 'https://openai.com', color: '#10A37F', letter: 'O' },
        { name: 'MDN Docs', url: 'https://developer.mozilla.org', color: '#000', letter: 'M' },
        { name: 'Bing', url: 'https://www.bing.com', color: '#008373', letter: 'B' },
    ];

    const navigate = (targetUrl) => {
        let finalUrl = targetUrl;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
                finalUrl = 'https://' + finalUrl;
            } else {
                // Use DuckDuckGo for search - it works in iframes
                finalUrl = 'https://duckduckgo.com/?q=' + encodeURIComponent(finalUrl);
            }
        }
        setCurrentUrl(finalUrl);
        setDisplayUrl(finalUrl.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]);
        setShowStartPage(false);
        setIsLoading(true);
        setIframeError(false);

        // Update tab
        const domain = finalUrl.replace('https://', '').replace('http://','').replace('www.','').split('/')[0];
        setTabs(prev => prev.map(t =>
            t.id === activeTab ? { ...t, title: domain, url: finalUrl } : t
        ));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            navigate(url);
        }
    };

    const addTab = () => {
        const newId = Date.now();
        setTabs(prev => [...prev, { id: newId, title: 'Start Page', url: '' }]);
        setActiveTab(newId);
        setShowStartPage(true);
        setCurrentUrl('');
        setDisplayUrl('');
        setUrl('');
        setIframeError(false);
    };

    const closeTab = (id, e) => {
        e.stopPropagation();
        if (tabs.length === 1) return;
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTab === id) {
            const tab = newTabs[newTabs.length - 1];
            setActiveTab(tab.id);
            setCurrentUrl(tab.url);
            setShowStartPage(!tab.url);
            setDisplayUrl(tab.url ? tab.url.replace('https://','').replace('http://','').replace('www.','').split('/')[0] : '');
        }
    };

    const goHome = () => {
        setShowStartPage(true);
        setCurrentUrl('');
        setDisplayUrl('');
        setUrl('');
        setIframeError(false);
        setTabs(prev => prev.map(t =>
            t.id === activeTab ? { ...t, title: 'Start Page', url: '' } : t
        ));
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Tab bar */}
            <div className="flex items-center gap-px px-2 bg-gray-100/95 border-b border-black/5 min-h-[32px]">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-[12px] cursor-default max-w-[200px] relative group
                            ${tab.id === activeTab ? 'bg-white' : 'bg-gray-200/60 hover:bg-gray-200/80'}`}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setCurrentUrl(tab.url);
                            setShowStartPage(!tab.url);
                            setDisplayUrl(tab.url ? tab.url.replace('https://','').replace('http://','').replace('www.','').split('/')[0] : '');
                        }}
                    >
                        <span className="truncate">{tab.title}</span>
                        <button
                            onClick={(e) => closeTab(tab.id, e)}
                            className="w-4 h-4 rounded-full text-[14px] leading-[14px] text-center opacity-0 group-hover:opacity-100 hover:bg-black/10 flex-shrink-0"
                        >×</button>
                    </div>
                ))}
                <button onClick={addTab} className="ml-1 w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 text-gray-400 text-lg">+</button>
            </div>

            {/* URL bar & navigation */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/95 border-b border-black/5">
                <div className="flex gap-1">
                    <button onClick={() => { if(iframeRef.current) try { iframeRef.current.contentWindow.history.back(); } catch(e) {} }}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#666"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                    <button onClick={() => { if(iframeRef.current) try { iframeRef.current.contentWindow.history.forward(); } catch(e) {} }}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#ccc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </button>
                </div>

                <div className="flex-1 relative">
                    <div className={`flex items-center h-[30px] rounded-lg px-3 text-[13px] border transition-all
                        ${url !== undefined ? 'bg-white border-blue-500 shadow-[0_0_0_3px_rgba(0,122,255,0.1)]' : 'bg-black/5 border-transparent'}`}
                    >
                        {isLoading && (
                            <svg className="animate-spin w-3.5 h-3.5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
                                <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                        )}
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#999" className="mr-1.5 flex-shrink-0">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setUrl(currentUrl || '')}
                            placeholder="Search or enter website name"
                            className="w-full bg-transparent outline-none text-[13px] text-center font-sf"
                        />
                    </div>
                </div>

                <button onClick={goHome}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5"
                    title="Start Page"
                >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#666"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                </button>
                <button
                    onClick={() => { if(iframeRef.current) iframeRef.current.src = iframeRef.current.src; }}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5"
                >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#666"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
                {showStartPage ? (
                    <div className="p-12 max-w-[800px] mx-auto">
                        <h2 className="text-xl font-semibold mb-6 text-gray-800">Favorites</h2>
                        <div className="grid grid-cols-4 gap-6">
                            {favorites.map(fav => (
                                <div
                                    key={fav.name}
                                    className="flex flex-col items-center gap-2 cursor-default group"
                                    onClick={() => { setUrl(fav.url); navigate(fav.url); }}
                                >
                                    <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md transition-transform group-hover:scale-105"
                                        style={{ background: fav.color }}>
                                        {fav.letter}
                                    </div>
                                    <span className="text-[11px] text-gray-500">{fav.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 bg-blue-50 rounded-xl p-4 text-[13px] text-blue-700 border border-blue-100">
                            <strong>Tip:</strong> Type any search term and press Enter to search with DuckDuckGo, or enter a URL directly. Some websites may block iframe loading — try Wikipedia, DuckDuckGo, Hacker News, or Archive.org for best results.
                        </div>
                        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">Privacy Report</h2>
                        <div className="bg-gray-50 rounded-xl p-4 text-[13px] text-gray-500">
                            Safari has prevented 12 trackers from profiling you in the last 7 days.
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        <iframe
                            ref={iframeRef}
                            src={currentUrl}
                            className="w-full h-full border-none bg-white"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
                            referrerPolicy="no-referrer"
                            onLoad={() => setIsLoading(false)}
                            title="Safari Browser"
                        />
                        {iframeError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white">
                                <div className="text-center p-8">
                                    <div className="text-[48px] mb-4">🌐</div>
                                    <h3 className="text-[18px] font-semibold mb-2">Cannot Open Page</h3>
                                    <p className="text-[13px] text-gray-500 mb-4 max-w-[300px]">
                                        This website cannot be displayed in Safari because it blocks embedded viewing.
                                    </p>
                                    <button onClick={goHome}
                                        className="px-4 py-2 bg-blue-500 text-white text-[13px] rounded-lg hover:bg-blue-600">
                                        Go to Start Page
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

window.SafariApp = SafariApp;
