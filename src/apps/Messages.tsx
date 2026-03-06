// Messages App - Local chat + Friends tab with real DMs + file/music sharing
const MessagesApp = () => {
    const authUser = useStore(s => s.authUser);
    const [tab, setTab] = React.useState('messages');

    // ── Local simulated conversations ─────────────────────────────────────────
    const [conversations, setConversations] = React.useState([
        { id: 1, name: 'John', initial: 'J', color: '#007AFF', messages: [
            { from: 'them', text: 'Hey! How\'s the project going?' },
            { from: 'me', text: 'Going really well! Almost done with the frontend.' },
            { from: 'them', text: 'That\'s awesome! Can\'t wait to see it.' },
            { from: 'me', text: 'I\'ll send you a preview tonight 🎉' },
            { from: 'them', text: 'Hey, are we still on for tomorrow?' },
        ], time: '9:30 AM' },
        { id: 2, name: 'Sarah', initial: 'S', color: '#FF3B30', messages: [
            { from: 'me', text: 'Just sent the files over' },
            { from: 'them', text: 'Thanks for sending that over!' },
        ], time: 'Yesterday' },
        { id: 3, name: 'Team Chat', initial: 'T', color: '#34C759', messages: [
            { from: 'them', text: 'The project is looking great 👍' },
            { from: 'me', text: 'Thanks! The team did an amazing job' },
        ], time: 'Tuesday' },
        { id: 4, name: 'Emma', initial: 'E', color: '#FF9500', messages: [
            { from: 'them', text: 'Can you review the PR?' },
            { from: 'me', text: 'Sure, I\'ll take a look' },
        ], time: 'Monday' },
    ]);
    const [activeId, setActiveId] = React.useState(1);
    const [input, setInput] = React.useState('');
    const chatRef = React.useRef(null);

    // ── Friends & DM state ────────────────────────────────────────────────────
    const [friends, setFriends] = React.useState([]);
    const [requests, setRequests] = React.useState([]);
    const [searchTag, setSearchTag] = React.useState('');
    const [searchResult, setSearchResult] = React.useState(null);
    const [searchError, setSearchError] = React.useState('');
    const [searching, setSearching] = React.useState(false);
    const [activeFriend, setActiveFriend] = React.useState(null);
    const [dmMessages, setDmMessages] = React.useState([]);
    const [dmInput, setDmInput] = React.useState('');
    const dmChatRef = React.useRef(null);

    // ── Attachment state ──────────────────────────────────────────────────────
    const [attachMenuFor, setAttachMenuFor] = React.useState(null); // null | 'local' | 'dm'
    const [playlistFor, setPlaylistFor] = React.useState(null);     // null | 'local' | 'dm'
    const [vfsPickerFor, setVfsPickerFor] = React.useState(null);   // null | 'local' | 'dm'

    const SONGS = [
        { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
        { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' },
        { title: 'As It Was', artist: 'Harry Styles', album: "Harry's House" },
        { title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland' },
        { title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR' },
        { title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights' },
        { title: 'Stay', artist: 'The Kid LAROI', album: 'F*CK LOVE 3' },
        { title: 'Peaches', artist: 'Justin Bieber', album: 'Justice' },
        { title: 'Montero', artist: 'Lil Nas X', album: 'MONTERO' },
        { title: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation' },
        { title: 'Unholy', artist: 'Sam Smith', album: 'Gloria' },
        { title: 'Rich Flex', artist: 'Drake & 21 Savage', album: 'Her Loss' },
    ];

    // ── Rich message renderer ─────────────────────────────────────────────────
    const renderBubble = (text, rich, isMe) => {
        let r = rich;
        if (!r && typeof text === 'string' && text.startsWith('{"type"')) {
            try { r = JSON.parse(text); } catch(e) {}
        }

        if (r?.type === 'file') return (
            <div className={`flex items-center gap-2.5 ${isMe ? 'text-white' : 'text-gray-800'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${isMe ? 'bg-white/20' : 'bg-gray-100'}`}>
                    {r.icon || '📄'}
                </div>
                <div>
                    <div className="text-[13px] font-medium max-w-[150px] truncate">{r.name}</div>
                    <div className={`text-[11px] ${isMe ? 'text-white/70' : 'text-gray-400'}`}>{r.size}</div>
                </div>
            </div>
        );
        if (r?.type === 'music') return (
            <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isMe ? 'bg-white/20' : 'bg-gradient-to-br from-pink-400 to-rose-500'}`}>🎵</div>
                <div>
                    <div className="text-[13px] font-semibold">{r.title}</div>
                    <div className={`text-[11px] ${isMe ? 'text-white/70' : 'text-gray-500'}`}>{r.artist}</div>
                    {r.album && <div className={`text-[10px] ${isMe ? 'text-white/50' : 'text-gray-400'}`}>{r.album}</div>}
                </div>
            </div>
        );
        return <span>{text}</span>;
    };

    // ── VFS file picking ──────────────────────────────────────────────────────
    const selectVFSFile = (filePath, item, target) => {
        const node = VFS._fs[filePath];
        const rich = { type: 'file', name: item.name, size: item.size || '0 KB', icon: item.icon || '📄', content: node?.content || '' };
        if (target === 'dm') sendDMRich(rich);
        else sendLocalRich(rich);
        setVfsPickerFor(null);
    };

    // ── Music sharing ─────────────────────────────────────────────────────────
    const shareSong = (song, target) => {
        const rich = { type: 'music', ...song };
        if (target === 'dm') sendDMRich(rich);
        else sendLocalRich(rich);
        setPlaylistFor(null);
    };

    // ── Rich send helpers ─────────────────────────────────────────────────────
    const sendLocalRich = (rich) => {
        setConversations(prev => prev.map(c =>
            c.id === activeId ? { ...c, messages: [...c.messages, { from: 'me', rich }], time: 'Just now' } : c
        ));
    };

    const sendDMRich = (rich) => {
        if (!activeFriend) return;
        const content = JSON.stringify(rich);
        const myId = MacAuth.getUser()?.id;
        setDmMessages(prev => [...prev, { id: 'tmp-' + Date.now(), from_user_id: myId, to_user_id: activeFriend.id, content, created_at: Date.now() }]);
        MacAuth.send({ type: 'message', to_user_id: activeFriend.id, content });
    };

    // ── Friends loading ───────────────────────────────────────────────────────
    const loadFriends = React.useCallback(async () => {
        if (!MacAuth.getToken()) return;
        try {
            const [f, r] = await Promise.all([
                MacAuth.api('GET', '/api/friends'),
                MacAuth.api('GET', '/api/friends/requests'),
            ]);
            setFriends(f);
            setRequests(r);
        } catch(e) {}
    }, []);

    React.useEffect(() => {
        if (authUser) loadFriends();
    }, [authUser, loadFriends]);

    // ── WebSocket subscription ────────────────────────────────────────────────
    React.useEffect(() => {
        return MacAuth.subscribe(msg => {
            const myId = MacAuth.getUser()?.id;
            if (msg.type === 'message' && msg.to_user_id) {
                setDmMessages(prev => {
                    const isForActive = activeFriend && (
                        msg.from_user_id === activeFriend.id ||
                        (msg.from_user_id === myId && msg.to_user_id === activeFriend.id)
                    );
                    if (!isForActive) return prev;
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                if (msg.from_user_id !== myId) {
                    let preview = (msg.content || '').slice(0, 60);
                    if (msg.content?.startsWith('{"type"')) {
                        try { const r = JSON.parse(msg.content); preview = r.type === 'music' ? '🎵 ' + r.title : (r.icon || '📎') + ' ' + r.name; } catch(e) {}
                    }
                    MacStore.addNotification('Messages', msg.display_name || 'Message', preview);
                }
            }
            if (msg.type === 'friend_request' || msg.type === 'friend_accepted') {
                loadFriends();
                MacStore.addNotification('Messages',
                    msg.type === 'friend_request' ? 'Friend Request' : 'Friend Accepted',
                    msg.type === 'friend_request'
                        ? (msg.request?.from_user?.display_name || 'Someone') + ' sent you a friend request'
                        : (msg.by_user?.display_name || 'Someone') + ' accepted your request'
                );
            }
        });
    }, [activeFriend, loadFriends]);

    const openDM = async (friend) => {
        setActiveFriend(friend);
        setDmMessages([]);
        setDmInput('');
        try {
            const msgs = await MacAuth.api('GET', '/api/messages?with=' + friend.id);
            setDmMessages(msgs);
        } catch(e) {}
    };

    React.useEffect(() => {
        if (dmChatRef.current) dmChatRef.current.scrollTop = dmChatRef.current.scrollHeight;
    }, [dmMessages]);

    const sendDM = () => {
        if (!dmInput.trim() || !activeFriend) return;
        const content = dmInput.trim();
        setDmInput('');
        const myId = MacAuth.getUser()?.id;
        setDmMessages(prev => [...prev, { id: 'tmp-' + Date.now(), from_user_id: myId, to_user_id: activeFriend.id, content, created_at: Date.now() }]);
        MacAuth.send({ type: 'message', to_user_id: activeFriend.id, content });
    };

    // ── Local chat ────────────────────────────────────────────────────────────
    const active = conversations.find(c => c.id === activeId);
    const sendMessage = () => {
        if (!input.trim()) return;
        const text = input.trim();
        setInput('');
        setConversations(prev => prev.map(c =>
            c.id === activeId ? { ...c, messages: [...c.messages, { from: 'me', text }], time: 'Just now' } : c
        ));
        setTimeout(() => {
            const replies = ['That sounds great!', 'Got it 👍', 'Thanks!', 'Let me think about that...', 'Awesome!', '😂', 'Perfect!'];
            setConversations(prev => prev.map(c =>
                c.id === activeId ? { ...c, messages: [...c.messages, { from: 'them', text: replies[Math.floor(Math.random() * replies.length)] }] } : c
            ));
        }, 1000 + Math.random() * 2000);
    };
    React.useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [conversations, activeId]);

    // ── Friend actions ────────────────────────────────────────────────────────
    const searchUser = async () => {
        if (!searchTag.trim()) return;
        setSearchError(''); setSearchResult(null); setSearching(true);
        try {
            const user = await MacAuth.api('GET', '/api/users/search?tag=' + encodeURIComponent(searchTag.trim().toLowerCase().replace(/^#/, '')));
            setSearchResult(user);
        } catch(e) { setSearchError(e.message); }
        setSearching(false);
    };

    const sendRequest = async (userId) => {
        try {
            await MacAuth.api('POST', '/api/friends/request', { to_user_id: userId });
            setSearchResult(null); setSearchTag('');
            MacStore.addNotification('Messages', 'Friend Request Sent', 'Your request has been sent.');
        } catch(e) { setSearchError(e.message); }
    };

    const acceptRequest = async (id) => {
        try { await MacAuth.api('POST', '/api/friends/accept', { request_id: id }); loadFriends(); } catch(e) {}
    };

    const declineRequest = async (id) => {
        try { await MacAuth.api('POST', '/api/friends/decline', { request_id: id }); loadFriends(); } catch(e) {}
    };

    const removeFriend = async (id) => {
        try {
            await MacAuth.api('DELETE', '/api/friends/' + id);
            if (activeFriend?.id === id) setActiveFriend(null);
            loadFriends();
        } catch(e) {}
    };

    const myId = MacAuth.getUser()?.id;

    // ── Attach menu ───────────────────────────────────────────────────────────
    const AttachMenu = ({ target }) => (
        <div className="absolute bottom-full mb-1.5 left-0 bg-white rounded-xl shadow-2xl border border-black/8 overflow-hidden z-20 w-[148px]"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] hover:bg-gray-50 text-left transition-colors"
                onClick={() => { setAttachMenuFor(null); setVfsPickerFor(target); }}>
                <span className="text-[16px]">📎</span>
                <span>Send File</span>
            </button>
            <div className="h-px bg-black/5 mx-2"/>
            <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] hover:bg-gray-50 text-left transition-colors"
                onClick={() => { setAttachMenuFor(null); setPlaylistFor(target); }}>
                <span className="text-[16px]">🎵</span>
                <span>Share Music</span>
            </button>
        </div>
    );

    // ── Playlist picker ───────────────────────────────────────────────────────
    const PlaylistPicker = ({ target }) => (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}
            onClick={() => setPlaylistFor(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-[320px] flex flex-col overflow-hidden"
                style={{ maxHeight: '460px' }} onClick={e => e.stopPropagation()}>
                <div className="px-5 py-3.5 border-b border-black/5 flex items-center justify-between flex-shrink-0">
                    <span className="font-semibold text-[15px]">Share Music</span>
                    <button onClick={() => setPlaylistFor(null)} className="text-gray-400 hover:text-gray-600 text-[22px] leading-none w-6 h-6 flex items-center justify-center">×</button>
                </div>
                <div className="overflow-y-auto">
                    {SONGS.map((song, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-default border-b border-black/[0.03] transition-colors"
                            onClick={() => shareSong(song, target)}>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-base flex-shrink-0">🎵</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium truncate">{song.title}</div>
                                <div className="text-[11px] text-gray-400 truncate">{song.artist} · {song.album}</div>
                            </div>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#c7c7cc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // ── VFS File Picker ───────────────────────────────────────────────────────
    const VFSPicker = ({ target }) => {
        const [path, setPath] = React.useState('/Users/user');
        const vfsVersion = useStore(s => s.vfsVersion);
        const items = VFS.ls(path);

        const crumbs = path === '/Users/user' ? [] : path.replace('/Users/user/', '').split('/');

        const goUp = () => setPath(path.split('/').slice(0, -1).join('/'));

        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}
                onClick={() => setVfsPickerFor(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-[380px] flex flex-col overflow-hidden"
                    style={{ maxHeight: '480px' }} onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="px-5 py-3 border-b border-black/5 flex items-center justify-between flex-shrink-0">
                        <span className="font-semibold text-[15px]">Send File from Finder</span>
                        <button onClick={() => setVfsPickerFor(null)} className="text-gray-400 hover:text-gray-600 text-[22px] leading-none w-6 h-6 flex items-center justify-center">×</button>
                    </div>
                    {/* Breadcrumb */}
                    <div className="px-4 py-2 bg-gray-50 border-b border-black/5 flex items-center gap-1 text-[12px] flex-shrink-0 overflow-x-auto">
                        <button onClick={() => setPath('/Users/user')} className="text-blue-500 hover:underline whitespace-nowrap">~</button>
                        {crumbs.map((part, i) => {
                            const partPath = '/Users/user/' + crumbs.slice(0, i + 1).join('/');
                            return (
                                <React.Fragment key={i}>
                                    <span className="text-gray-400">/</span>
                                    <button onClick={() => setPath(partPath)}
                                        className={`whitespace-nowrap ${i === crumbs.length - 1 ? 'text-gray-700 font-medium' : 'text-blue-500 hover:underline'}`}>
                                        {part}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    {/* File list */}
                    <div className="overflow-y-auto flex-1">
                        {path !== '/Users/user' && (
                            <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-default border-b border-black/[0.03]"
                                onClick={goUp}>
                                <span className="text-[18px]">📂</span>
                                <span className="text-[13px] text-gray-400">..</span>
                            </div>
                        )}
                        {items.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-300 text-[13px]">This folder is empty</div>
                        ) : items.map((item, i) => (
                            <div key={i}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-default border-b border-black/[0.03] transition-colors"
                                onClick={() => {
                                    if (item.type === 'folder') setPath(path + '/' + item.name);
                                    else selectVFSFile(path + '/' + item.name, item, target);
                                }}>
                                <span className="text-[18px] flex-shrink-0">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-medium truncate">{item.name}</div>
                                    {item.type !== 'folder' && <div className="text-[11px] text-gray-400">{item.size}</div>}
                                </div>
                                {item.type === 'folder'
                                    ? <svg viewBox="0 0 24 24" width="14" height="14" fill="#c7c7cc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                                    : <span className="text-[11px] text-blue-500 font-medium flex-shrink-0">Send</span>
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full">
            {/* Playlist picker overlay */}
            {playlistFor && <PlaylistPicker target={playlistFor}/>}

            {/* VFS file picker overlay */}
            {vfsPickerFor && <VFSPicker target={vfsPickerFor}/>}

            {/* Close attach menu on outside click */}
            {attachMenuFor && <div className="fixed inset-0 z-10" onClick={() => setAttachMenuFor(null)}/>}

            {/* ── Sidebar ── */}
            <div className="w-[280px] min-w-[280px] bg-gray-50/95 border-r border-black/5 flex flex-col">
                <div className="flex border-b border-black/5 bg-white">
                    <button onClick={() => setTab('messages')}
                        className={`flex-1 py-2 text-[12px] font-semibold transition-colors ${tab === 'messages' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-600'}`}>
                        Messages
                    </button>
                    <button onClick={() => setTab('friends')}
                        className={`flex-1 py-2 text-[12px] font-semibold transition-colors relative ${tab === 'friends' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-600'}`}>
                        Friends
                        {requests.length > 0 && (
                            <span className="absolute top-1 right-3 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center px-0.5">{requests.length}</span>
                        )}
                    </button>
                </div>

                {tab === 'messages' && (
                    <>
                        <div className="p-3 border-b border-black/5">
                            <input type="text" placeholder="Search" className="w-full px-3 py-1.5 rounded-lg border border-black/5 bg-white/80 text-[13px] outline-none font-sf"/>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {conversations.map(c => {
                                const lastMsg = c.messages[c.messages.length - 1];
                                const preview = lastMsg?.rich
                                    ? (lastMsg.rich.type === 'music' ? '🎵 ' + lastMsg.rich.title : (lastMsg.rich.icon || '📎') + ' ' + lastMsg.rich.name)
                                    : lastMsg?.text;
                                return (
                                    <div key={c.id}
                                        className={`flex items-center gap-3 px-4 py-2.5 cursor-default border-b border-black/[0.03] ${activeId === c.id ? 'bg-blue-500 text-white' : 'hover:bg-black/[0.02]'}`}
                                        onClick={() => setActiveId(c.id)}>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold flex-shrink-0"
                                            style={{ background: c.color }}>{c.initial}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[13px] font-semibold">{c.name}</span>
                                                <span className={`text-[11px] ${activeId === c.id ? 'text-white/70' : 'text-gray-400'}`}>{c.time}</span>
                                            </div>
                                            <div className={`text-[12px] truncate ${activeId === c.id ? 'text-white/70' : 'text-gray-400'}`}>{preview}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {tab === 'friends' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {authUser ? (
                            <div className="px-3 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                <div className="flex-1">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Your Tag</div>
                                    <div className="text-[13px] font-bold text-blue-600">#{authUser.friend_tag}</div>
                                </div>
                                <button onClick={() => navigator.clipboard?.writeText('#' + authUser.friend_tag)}
                                    className="text-[10px] text-blue-500 px-1.5 py-0.5 rounded border border-blue-200 bg-white">Copy</button>
                            </div>
                        ) : (
                            <div className="px-3 py-3 text-center text-gray-400 text-[12px]">Connecting…</div>
                        )}
                        <div className="p-3 border-b border-black/5">
                            <div className="flex gap-1.5">
                                <input value={searchTag} onChange={e => setSearchTag(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && searchUser()}
                                    placeholder="Add by tag…"
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-black/10 text-[12px] outline-none bg-white"/>
                                <button onClick={searchUser} disabled={searching}
                                    className="px-2.5 py-1.5 bg-blue-500 text-white text-[12px] rounded-lg disabled:opacity-50">
                                    {searching ? '…' : 'Find'}
                                </button>
                            </div>
                            {searchError && <div className="text-[10px] text-red-500 mt-1">{searchError}</div>}
                            {searchResult && (
                                <div className="mt-1.5 flex items-center justify-between p-2 bg-white rounded-lg border border-black/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                            style={{ background: searchResult.avatar_color || '#007AFF' }}>
                                            {(searchResult.display_name || '?')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-[12px] font-semibold">{searchResult.display_name}</div>
                                            <div className="text-[10px] text-gray-400">#{searchResult.friend_tag}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => sendRequest(searchResult.id)}
                                        className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-md">Add</button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {requests.length > 0 && (
                                <div>
                                    <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-orange-500 uppercase tracking-wide">Requests ({requests.length})</div>
                                    {requests.map(r => (
                                        <div key={r.id} className="flex items-center gap-2 px-3 py-2 border-b border-black/[0.03]">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                style={{ background: r.from_user?.avatar_color || '#FF9500' }}>
                                                {(r.from_user?.display_name || '?')[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[12px] font-semibold truncate">{r.from_user?.display_name}</div>
                                                <div className="text-[10px] text-gray-400">#{r.from_user?.friend_tag}</div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => acceptRequest(r.id)} className="w-6 h-6 bg-green-500 text-white text-[11px] rounded-full flex items-center justify-center">✓</button>
                                                <button onClick={() => declineRequest(r.id)} className="w-6 h-6 bg-gray-200 text-gray-500 text-[11px] rounded-full flex items-center justify-center">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Friends ({friends.length})</div>
                            {friends.length === 0 ? (
                                <div className="px-3 py-4 text-center text-gray-300 text-[12px]">No friends yet</div>
                            ) : friends.map(f => (
                                <div key={f.id}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 cursor-default border-b border-black/[0.03] group ${activeFriend?.id === f.id ? 'bg-blue-500' : 'hover:bg-black/[0.02]'}`}
                                    onClick={() => openDM(f)}>
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                        style={{ background: f.avatar_color || '#007AFF' }}>
                                        {(f.display_name || '?')[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-[13px] font-semibold truncate ${activeFriend?.id === f.id ? 'text-white' : ''}`}>{f.display_name}</div>
                                        <div className={`text-[11px] ${activeFriend?.id === f.id ? 'text-white/60' : 'text-gray-400'}`}>#{f.friend_tag}</div>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); removeFriend(f.id); }}
                                        className={`opacity-0 group-hover:opacity-100 p-1 rounded text-[11px] transition-opacity ${activeFriend?.id === f.id ? 'text-white/70 hover:text-white' : 'text-red-400 hover:text-red-600'}`}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Local chat panel ── */}
            {tab === 'messages' && (
                <div className="flex-1 flex flex-col bg-white">
                    <div className="px-4 py-2.5 border-b border-black/5 text-center font-semibold text-[14px]">{active?.name}</div>
                    <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                        {active?.messages.map((msg, i) => {
                            const isMe = msg.from === 'me';
                            return (
                                <div key={i} className={`max-w-[65%] px-3.5 py-2 text-[14px] leading-relaxed ${
                                    isMe
                                        ? 'bg-blue-500 text-white self-end rounded-2xl rounded-br-md'
                                        : 'bg-gray-200 text-gray-900 self-start rounded-2xl rounded-bl-md'
                                }`}>
                                    {renderBubble(msg.text, msg.rich, isMe)}
                                </div>
                            );
                        })}
                    </div>
                    <div className="px-4 py-3 border-t border-black/5 flex items-center gap-2 relative">
                        <div className="relative z-10">
                            <button onClick={() => setAttachMenuFor(attachMenuFor === 'local' ? null : 'local')}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-[18px] font-light transition-colors">
                                +
                            </button>
                            {attachMenuFor === 'local' && <AttachMenu target="local"/>}
                        </div>
                        <input type="text" value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="iMessage"
                            className="flex-1 px-4 py-2 rounded-full border border-black/10 text-[14px] outline-none font-sf"/>
                        <button onClick={sendMessage} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* ── DM empty state ── */}
            {tab === 'friends' && !activeFriend && (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 text-gray-300">
                    <svg viewBox="0 0 24 24" width="52" height="52" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    <div className="text-[14px] mt-3 font-medium">Select a friend to chat</div>
                    <div className="text-[12px] mt-1">or add friends using their tag</div>
                </div>
            )}

            {/* ── DM chat panel ── */}
            {tab === 'friends' && activeFriend && (
                <div className="flex-1 flex flex-col bg-white">
                    <div className="px-4 py-2.5 border-b border-black/5 flex items-center gap-3">
                        <button onClick={() => setActiveFriend(null)} className="text-blue-500 text-[13px] flex items-center gap-1">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                            Back
                        </button>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: activeFriend.avatar_color || '#007AFF' }}>
                            {(activeFriend.display_name || '?')[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-[14px] flex-1">{activeFriend.display_name}</span>
                        <span className="text-[11px] text-gray-400">#{activeFriend.friend_tag}</span>
                    </div>
                    <div ref={dmChatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                        {dmMessages.length === 0 && (
                            <div className="text-center text-gray-300 text-[13px] mt-10">No messages yet. Say hi!</div>
                        )}
                        {dmMessages.map((msg, i) => {
                            const isMe = msg.from_user_id === myId;
                            return (
                                <div key={msg.id || i} className={`max-w-[65%] px-3.5 py-2 text-[14px] leading-relaxed ${
                                    isMe
                                        ? 'bg-blue-500 text-white self-end rounded-2xl rounded-br-md'
                                        : 'bg-gray-200 text-gray-900 self-start rounded-2xl rounded-bl-md'
                                }`}>
                                    {renderBubble(msg.content, null, isMe)}
                                </div>
                            );
                        })}
                    </div>
                    <div className="px-4 py-3 border-t border-black/5 flex items-center gap-2 relative">
                        <div className="relative z-10">
                            <button onClick={() => setAttachMenuFor(attachMenuFor === 'dm' ? null : 'dm')}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-[18px] font-light transition-colors">
                                +
                            </button>
                            {attachMenuFor === 'dm' && <AttachMenu target="dm"/>}
                        </div>
                        <input type="text" value={dmInput} onChange={e => setDmInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendDM()}
                            placeholder={`Message ${activeFriend.display_name}…`}
                            className="flex-1 px-4 py-2 rounded-full border border-black/10 text-[14px] outline-none font-sf"/>
                        <button onClick={sendDM} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

window.MessagesApp = MessagesApp;
