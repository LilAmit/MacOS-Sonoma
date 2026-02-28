// Music App - Interactive music player with real 30s previews, search, playlists
// Default songs defined outside component so they're stable across renders
const _defaultSongs = [
    { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '0:30', color: '#FF0000', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/600x600bb.jpg', search: 'Blinding Lights The Weeknd', genre: 'Pop' },
    { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '0:30', color: '#FF69B4', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e9/c5/a8/e9c5a8a0-d698-137b-2e85-cf3a8d9548f8/190295303372.jpg/600x600bb.jpg', search: 'Levitating Dua Lipa', genre: 'Pop' },
    { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', album: 'Stay', duration: '0:30', color: '#8B5CF6', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/89/59/6a/89596ab9-fa3c-8d08-4d95-a6450fa2013c/886449400515.jpg/600x600bb.jpg', search: 'Stay Kid LAROI Justin Bieber', genre: 'Pop' },
    { title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: '0:30', color: '#F59E0B', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/44/2e/2e/442e2e48-677d-592a-5f5a-145c67236e75/21UMGIM85445.rgb.jpg/600x600bb.jpg', search: 'Heat Waves Glass Animals', genre: 'Indie' },
    { title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: '0:30', color: '#3B82F6', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/600x600bb.jpg', search: 'Save Your Tears Weeknd', genre: 'Pop' },
    { title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: '0:30', color: '#F97316', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e0/92/da/e092da2d-9f6d-11dc-7843-2021e95a2b61/21UMGIM17518.rgb.jpg/600x600bb.jpg', search: 'Peaches Justin Bieber', genre: 'R&B' },
    { title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR', duration: '0:30', color: '#A855F7', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/02/ed/8c/02ed8cab-c089-2fdd-7ce6-ab334a9a4e19/21UMGIM26093.rgb.jpg/600x600bb.jpg', search: 'good 4 u Olivia Rodrigo', genre: 'Pop Rock' },
    { title: 'Montero', artist: 'Lil Nas X', album: 'Montero', duration: '0:30', color: '#EF4444', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4b/42/21/4b422136-2cfd-222c-ca7c-7573bf23139c/886449537204.jpg/600x600bb.jpg', search: 'Montero Call Me By Your Name Lil Nas X', genre: 'Hip-Hop' },
    { title: 'Kiss Me More', artist: 'Doja Cat ft. SZA', album: 'Planet Her', duration: '0:30', color: '#EC4899', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/4f/4b/ee/4f4bee71-d197-67ab-2a42-913dc416df0d/886449138869.jpg/600x600bb.jpg', search: 'Kiss Me More Doja Cat SZA', genre: 'Pop' },
    { title: 'Butter', artist: 'BTS', album: 'Butter', duration: '0:30', color: '#EAB308', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/27/80/dc/2780dce3-3cdd-d8aa-ec8c-05bf8ad90f9d/196006771362_Cover.jpg/600x600bb.jpg', search: 'Butter BTS', genre: 'K-Pop' },
];

// Global URL cache that persists across re-renders
const _urlCache = {};

// Pre-fetch all default song preview URLs immediately
_defaultSongs.forEach(s => {
    const key = s.title + '|||' + s.artist;
    fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(s.search || s.title + ' ' + s.artist) + '&limit=1&media=music')
        .then(r => r.json())
        .then(data => {
            if (data.results && data.results[0] && data.results[0].previewUrl) {
                _urlCache[key] = data.results[0].previewUrl;
            }
        }).catch(() => {});
});

const MusicApp = () => {
    const [activeNav, setActiveNav] = React.useState('Listen Now');
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentSongIdx, setCurrentSongIdx] = React.useState(0);
    const [progress, setProgress] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [audioDuration, setAudioDuration] = React.useState(30);
    const [volume, setVolume] = React.useState(70);
    const [shuffle, setShuffle] = React.useState(false);
    const [repeat, setRepeat] = React.useState(false);
    const [loadingAudio, setLoadingAudio] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [searchLoading, setSearchLoading] = React.useState(false);
    const [library, setLibrary] = React.useState([]);
    const [nowPlayingList, setNowPlayingList] = React.useState([]);
    const [nowPlayingSong, setNowPlayingSong] = React.useState(null);
    const [playlists, setPlaylists] = React.useState([]);
    const [viewingPlaylist, setViewingPlaylist] = React.useState(null);
    const [showNewPlaylist, setShowNewPlaylist] = React.useState(false);
    const [newPlaylistName, setNewPlaylistName] = React.useState('');
    const [addToPlaylistSong, setAddToPlaylistSong] = React.useState(null);
    const [confirmDeletePlaylist, setConfirmDeletePlaylist] = React.useState(null);
    const audioElRef = React.useRef(null);
    const searchTimeout = React.useRef(null);
    const npListRef = React.useRef([]);
    const npIdxRef = React.useRef(0);

    const defaultSongs = _defaultSongs;

    React.useEffect(() => {
        const saved = localStorage.getItem('macos_music_library');
        if (saved) { try { setLibrary(JSON.parse(saved)); } catch(e) {} }
        const savedPl = localStorage.getItem('macos_music_playlists');
        if (savedPl) { try { setPlaylists(JSON.parse(savedPl)); } catch(e) {} }
    }, []);

    // Get the audio element ref (rendered in JSX below)
    const getAudio = () => audioElRef.current;

    const savePlaylists = (pls) => {
        setPlaylists(pls);
        localStorage.setItem('macos_music_playlists', JSON.stringify(pls));
    };

    const createPlaylist = (name) => {
        if (!name.trim()) return;
        const pl = { id: Date.now(), name: name.trim(), songs: [], colors: ['#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'), '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')] };
        savePlaylists([...playlists, pl]);
        setShowNewPlaylist(false);
        setNewPlaylistName('');
    };

    const deletePlaylist = (id) => {
        setConfirmDeletePlaylist(id);
    };

    const confirmDelete = () => {
        if (!confirmDeletePlaylist) return;
        savePlaylists(playlists.filter(p => p.id !== confirmDeletePlaylist));
        if (viewingPlaylist && viewingPlaylist.id === confirmDeletePlaylist) setViewingPlaylist(null);
        setConfirmDeletePlaylist(null);
    };

    const addSongToPlaylist = (plId, song) => {
        const updated = playlists.map(p => {
            if (p.id === plId) {
                if (p.songs.some(s => s.title === song.title && s.artist === song.artist)) return p;
                return { ...p, songs: [...p.songs, song] };
            }
            return p;
        });
        savePlaylists(updated);
        setAddToPlaylistSong(null);
    };

    const removeSongFromPlaylist = (plId, songIdx) => {
        const updated = playlists.map(p => {
            if (p.id === plId) return { ...p, songs: p.songs.filter((_, i) => i !== songIdx) };
            return p;
        });
        savePlaylists(updated);
        if (viewingPlaylist && viewingPlaylist.id === plId) {
            setViewingPlaylist(updated.find(p => p.id === plId));
        }
    };

    const builtinPlaylists = {
        'Favorites Mix': { filter: (s) => ['Blinding Lights','Levitating','Good 4 U','Heat Waves','Butter'].includes(s.title), colors: ['#FF3B30', '#FF9500'] },
        'Chill Vibes': { filter: (s) => ['Heat Waves','Save Your Tears','Kiss Me More','Peaches'].includes(s.title), colors: ['#5856D6', '#007AFF'] },
        'Workout': { filter: (s) => ['Good 4 U','Montero','Levitating','Blinding Lights','Butter'].includes(s.title), colors: ['#34C759', '#30D158'] },
        'Focus': { filter: (s) => ['Heat Waves','Stay','Save Your Tears','Kiss Me More'].includes(s.title), colors: ['#AF52DE', '#BF5AF2'] },
    };

    const navItems = ['Listen Now', 'Browse', 'Radio', 'Library', 'Search'];

    const isCurrent = (s) => nowPlayingSong && s.title === nowPlayingSong.title && s.artist === nowPlayingSong.artist;

    const formatTime = (seconds) => { const m = Math.floor(seconds / 60); const sec = Math.floor(seconds % 60); return m + ':' + String(sec).padStart(2, '0'); };

    // Get URL: from song's previewUrl, or from global cache
    const getUrl = (s) => s.previewUrl || _urlCache[s.title + '|||' + s.artist] || null;

    // Fetch URL from iTunes (returns promise)
    const fetchUrl = (s) => {
        const key = s.title + '|||' + s.artist;
        if (_urlCache[key]) return Promise.resolve(_urlCache[key]);
        return fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(s.search || s.title + ' ' + s.artist) + '&limit=1&media=music')
            .then(r => r.json())
            .then(data => {
                if (data.results && data.results[0] && data.results[0].previewUrl) {
                    _urlCache[key] = data.results[0].previewUrl;
                    return _urlCache[key];
                }
                return null;
            }).catch(() => null);
    };

    // Core play function — keeps it synchronous when URL is available
    const playSong = (index, list) => {
        const audio = getAudio();
        if (!audio || !list || !list[index]) return;
        const s = list[index];

        // Update state
        npListRef.current = list;
        npIdxRef.current = index;
        setNowPlayingList(list);
        setNowPlayingSong(s);
        setCurrentSongIdx(index);
        setProgress(0);
        setCurrentTime(0);

        const url = getUrl(s);
        if (url) {
            // Play immediately — synchronous from user click
            audio.src = url;
            audio.load();
            audio.play().catch(() => {});
            setIsPlaying(true);
            setLoadingAudio(false);
        } else {
            // Need to fetch URL first
            setLoadingAudio(true);
            fetchUrl(s).then(fetchedUrl => {
                if (fetchedUrl) {
                    audio.src = fetchedUrl;
                    audio.load();
                    audio.play().catch(() => {});
                    setIsPlaying(true);
                }
                setLoadingAudio(false);
            });
        }
    };

    // Audio event handlers via onXxx props on <audio> element
    const onTimeUpdate = () => {
        const audio = getAudio();
        if (!audio) return;
        const dur = audio.duration || 30;
        setCurrentTime(audio.currentTime);
        setAudioDuration(dur);
        setProgress((audio.currentTime / dur) * 100);
    };

    const onEnded = () => {
        const audio = getAudio();
        if (repeat && audio) { audio.currentTime = 0; audio.play(); return; }
        const curList = npListRef.current;
        const curIdx = npIdxRef.current;
        if (curList.length > 0) {
            const next = shuffle ? Math.floor(Math.random() * curList.length) : (curIdx + 1) % curList.length;
            playSong(next, curList);
        }
    };

    React.useEffect(() => {
        const audio = getAudio();
        if (audio) audio.volume = volume / 100;
    }, [volume]);

    const togglePlay = () => {
        const audio = getAudio();
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            if (!audio.src || audio.currentSrc === '') {
                playSong(0, defaultSongs);
            } else {
                audio.play().catch(() => {});
                setIsPlaying(true);
            }
        }
    };

    const prevSong = () => {
        if (npListRef.current.length === 0) return;
        const prev = npIdxRef.current === 0 ? npListRef.current.length - 1 : npIdxRef.current - 1;
        playSong(prev, npListRef.current);
    };

    const nextSong = () => {
        if (npListRef.current.length === 0) return;
        const next = shuffle ? Math.floor(Math.random() * npListRef.current.length) : (npIdxRef.current + 1) % npListRef.current.length;
        playSong(next, npListRef.current);
    };

    const seekTo = (val) => {
        const audio = getAudio();
        if (!audio) return;
        const dur = audio.duration || 30;
        audio.currentTime = (val / 100) * dur;
        setProgress(val);
    };

    // Search iTunes API
    const doSearch = (query) => {
        if (!query.trim()) { setSearchResults([]); return; }
        setSearchLoading(true);
        fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&limit=25&media=music')
            .then(r => r.json())
            .then(data => {
                setSearchResults((data.results || []).filter(r => r.previewUrl).map(r => ({
                    title: r.trackName, artist: r.artistName, album: r.collectionName,
                    duration: formatTime((r.trackTimeMillis || 30000) / 1000),
                    color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'),
                    cover: (r.artworkUrl100 || '').replace('100x100', '600x600'),
                    search: r.trackName + ' ' + r.artistName,
                    genre: r.primaryGenreName || 'Music',
                    previewUrl: r.previewUrl,
                })));
                setSearchLoading(false);
            }).catch(() => { setSearchResults([]); setSearchLoading(false); });
    };

    const handleSearchInput = (val) => {
        setSearchQuery(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => doSearch(val), 500);
    };

    const addToLibrary = (s) => {
        if (isInLibrary(s)) return;
        const newLib = [...library, s];
        setLibrary(newLib);
        localStorage.setItem('macos_music_library', JSON.stringify(newLib));
    };

    const removeFromLibrary = (idx) => {
        const nl = library.filter((_,j) => j !== idx);
        setLibrary(nl);
        localStorage.setItem('macos_music_library', JSON.stringify(nl));
    };

    const isInLibrary = (s) => library.some(l => l.title === s.title && l.artist === s.artist);

    const CoverArt = ({ src, color, size = 36, rounded = 'rounded-md' }) => (
        <div className={`${rounded} flex-shrink-0 overflow-hidden`} style={{ width: size, height: size, background: `linear-gradient(135deg, ${color || '#666'}, ${color || '#666'}dd)` }}>
            <img src={src} alt="" width={size} height={size} className="w-full h-full object-cover" draggable="false" onError={(e) => { e.target.style.display = 'none'; }}/>
        </div>
    );

    const SongRow = ({ s, i, list, showAdd, showPlaylist, onRemove }) => {
        const playing = isCurrent(s) && isPlaying;
        const current = isCurrent(s);
        return (
            <div className={`flex items-center gap-3 px-4 py-2 border-b border-black/[0.03] cursor-pointer select-none ${playing ? 'bg-red-500/[0.06]' : 'hover:bg-black/[0.03]'}`}
                onClick={() => playSong(i, list)}>
                <span className="text-[12px] text-gray-400 w-5 text-right flex-shrink-0">
                    {playing ? (
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="#FF3B30"><rect x="2" y="3" width="3" height="10" rx="1"><animate attributeName="height" values="10;4;10" dur="0.8s" repeatCount="indefinite"/><animate attributeName="y" values="3;6;3" dur="0.8s" repeatCount="indefinite"/></rect><rect x="7" y="1" width="3" height="14" rx="1"><animate attributeName="height" values="14;6;14" dur="0.6s" repeatCount="indefinite"/><animate attributeName="y" values="1;5;1" dur="0.6s" repeatCount="indefinite"/></rect><rect x="12" y="4" width="3" height="8" rx="1"><animate attributeName="height" values="8;12;8" dur="0.7s" repeatCount="indefinite"/><animate attributeName="y" values="4;2;4" dur="0.7s" repeatCount="indefinite"/></rect></svg>
                    ) : current ? (
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="#FF3B30"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (i + 1)}
                </span>
                <CoverArt src={s.cover} color={s.color} size={36}/>
                <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-medium truncate ${current ? 'text-red-500' : ''}`}>{s.title}</div>
                    <div className="text-[11px] text-gray-400 truncate">{s.artist} — {s.album}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {showPlaylist && playlists.length > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); setAddToPlaylistSong(s); }} className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-medium hover:bg-purple-500/20" title="Add to playlist">+PL</button>
                    )}
                    {showAdd && !isInLibrary(s) && (
                        <button onClick={(e) => { e.stopPropagation(); addToLibrary(s); }} className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-medium hover:bg-red-500/20">+ Library</button>
                    )}
                    {showAdd && isInLibrary(s) && (
                        <span className="text-[10px] text-green-500 font-medium px-1">Added</span>
                    )}
                    {onRemove && (
                        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-gray-800 hover:text-red-500 text-[18px] font-bold ml-1 leading-none" title="Remove from playlist">&times;</button>
                    )}
                </div>
                <span className="text-[12px] text-gray-400 flex-shrink-0 w-10 text-right">0:30</span>
            </div>
        );
    };

    const radioStations = [
        { name: 'Apple Music 1', desc: 'Pop Hits, 24/7', color: '#FF2D55', searchTerm: 'pop hits 2024' },
        { name: 'Apple Music Hits', desc: 'Songs you know and love', color: '#FF9500', searchTerm: 'greatest hits' },
        { name: 'Apple Music Country', desc: 'Country music all day', color: '#AF52DE', searchTerm: 'country music' },
        { name: 'Chill Radio', desc: 'Lo-fi & ambient', color: '#5856D6', searchTerm: 'lo-fi chill beats' },
        { name: 'Hip-Hop Hits', desc: 'Top rap & hip-hop', color: '#FF3B30', searchTerm: 'hip hop 2024' },
        { name: 'R&B Now', desc: 'R&B essentials', color: '#34C759', searchTerm: 'r&b 2024' },
    ];

    const playRadio = (station) => {
        setSearchLoading(true);
        fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(station.searchTerm) + '&limit=20&media=music')
            .then(r => r.json())
            .then(data => {
                const songs = (data.results || []).filter(r => r.previewUrl).map(r => ({
                    title: r.trackName, artist: r.artistName, album: r.collectionName,
                    duration: formatTime((r.trackTimeMillis || 30000) / 1000),
                    color: station.color,
                    cover: (r.artworkUrl100 || '').replace('100x100', '600x600'),
                    search: r.trackName + ' ' + r.artistName,
                    genre: r.primaryGenreName || 'Music',
                    previewUrl: r.previewUrl,
                }));
                if (songs.length > 0) playSong(0, songs);
                setSearchLoading(false);
            }).catch(() => { setSearchLoading(false); });
    };

    const renderContent = () => {
        switch (activeNav) {
            case 'Search':
                return (
                    <>
                        <div className="mb-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-black/5">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="#999"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                                <input type="text" value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)}
                                    placeholder="Search any song, artist, or album..." className="flex-1 bg-transparent outline-none text-[14px]" autoFocus/>
                                {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-gray-400 text-[18px]">&times;</button>}
                            </div>
                        </div>
                        {searchLoading && <div className="text-center text-[13px] text-gray-400 py-8">Searching iTunes...</div>}
                        {!searchLoading && searchResults.length > 0 && (
                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                                <div className="px-4 py-2 text-[11px] text-gray-400 border-b border-black/5 flex items-center gap-2">
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#34C759"><path d="M8 5v14l11-7z"/></svg>
                                    {searchResults.length} songs found — click any to play 30-second preview
                                </div>
                                {searchResults.map((s, i) => <SongRow key={i} s={s} i={i} list={searchResults} showAdd={true} showPlaylist={true}/>)}
                            </div>
                        )}
                        {!searchLoading && searchQuery && searchResults.length === 0 && <div className="text-center text-[13px] text-gray-400 py-8">No results found</div>}
                        {!searchQuery && (
                            <div className="text-center text-gray-400 text-[13px] py-12">
                                <svg viewBox="0 0 24 24" width="48" height="48" fill="#ccc" className="mx-auto mb-3"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                                Search for any song, artist, or album worldwide<br/>
                                <span className="text-[11px] mt-1 block">Every result is a playable 30-second preview from iTunes</span>
                            </div>
                        )}
                    </>
                );
            case 'Browse':
                const genres = ['Pop', 'Hip-Hop', 'Rock', 'R&B', 'Electronic', 'Country', 'Jazz', 'Classical', 'Latin', 'K-Pop', 'Indie', 'Metal'];
                return (
                    <>
                        <div className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Browse by Genre</div>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {genres.map(g => (
                                <div key={g} className="rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity text-white font-bold text-[15px]"
                                    style={{ background: `linear-gradient(135deg, hsl(${genres.indexOf(g)*30},70%,50%), hsl(${genres.indexOf(g)*30+30},70%,40%))` }}
                                    onClick={() => { setActiveNav('Search'); handleSearchInput(g + ' music'); setViewingPlaylist(null); }}>
                                    {g}
                                </div>
                            ))}
                        </div>
                        <div className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Songs</div>
                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                            {defaultSongs.slice(0,5).map((s, i) => <SongRow key={i} s={s} i={i} list={defaultSongs} showPlaylist={true} showAdd={true}/>)}
                        </div>
                    </>
                );
            case 'Radio':
                return (
                    <>
                        <div className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Live Radio Stations</div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {radioStations.map(st => (
                                <div key={st.name} className="rounded-xl p-5 cursor-pointer hover:scale-[1.02] transition-transform text-white"
                                    style={{ background: `linear-gradient(135deg, ${st.color}, ${st.color}cc)` }}
                                    onClick={() => playRadio(st)}>
                                    <div className="text-[16px] font-bold">{st.name}</div>
                                    <div className="text-[12px] opacity-80 mt-1">{st.desc}</div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"/>
                                        <span className="text-[11px] opacity-70">LIVE</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-[11px] text-gray-400 text-center">Click a station to load and play 30-second previews from that genre</div>
                    </>
                );
            case 'Library':
                return (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[13px] text-gray-400">{library.length} songs in your library</span>
                        </div>
                        {library.length === 0 ? (
                            <div className="text-center text-gray-400 text-[13px] py-12">
                                Your library is empty.<br/>
                                <span className="text-[11px]">Search for songs and click "+ Library" to add them!</span>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                                {library.map((s, i) => (
                                    <SongRow key={i} s={s} i={i} list={library} showPlaylist={true} onRemove={() => removeFromLibrary(i)}/>
                                ))}
                            </div>
                        )}
                    </>
                );
            case 'Listen Now':
            default:
                return (
                    <>
                        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                            {defaultSongs.slice(0, 5).map((s, i) => (
                                <div key={i} className="flex-shrink-0 cursor-pointer group" onClick={() => playSong(i, defaultSongs)}>
                                    <div className="w-[160px] h-[160px] rounded-xl shadow-md mb-2 overflow-hidden transition-transform group-hover:scale-[1.02] relative"
                                        style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)` }}>
                                        <img src={s.cover} alt={s.album} className="w-full h-full object-cover" draggable="false" onError={(e) => { e.target.style.display = 'none'; }}/>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                <svg viewBox="0 0 24 24" width="18" height="18" fill="#333"><path d="M8 5v14l11-7z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[13px] font-medium truncate w-[160px]">{s.album}</div>
                                    <div className="text-[11px] text-gray-400 truncate w-[160px]">{s.artist}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mb-4 bg-red-50 rounded-xl p-3 text-[12px] text-red-600 border border-red-100 flex items-center gap-2">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF3B30"><path d="M8 5v14l11-7z"/></svg>
                            Click any song to hear a 30-second preview. Use Search to find anything worldwide!
                        </div>
                        <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Top Songs</div>
                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                            {defaultSongs.map((s, i) => <SongRow key={i} s={s} i={i} list={defaultSongs} showPlaylist={true} showAdd={true}/>)}
                        </div>
                    </>
                );
        }
    };

    const activeBuiltinPlaylist = Object.keys(builtinPlaylists).find(name => activeNav === name);

    const renderPlaylistContent = (plName) => {
        const pl = builtinPlaylists[plName];
        const plSongs = defaultSongs.filter(pl.filter);
        return (
            <>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-[120px] h-[120px] rounded-xl shadow-lg" style={{ background: `linear-gradient(135deg, ${pl.colors[0]}, ${pl.colors[1]})` }}/>
                    <div>
                        <div className="text-[22px] font-bold">{plName}</div>
                        <div className="text-[13px] text-gray-400">{plSongs.length} songs</div>
                        <button className="mt-2 px-4 py-1.5 rounded-full bg-red-500 text-white text-[12px] font-medium hover:bg-red-600"
                            onClick={() => { if (plSongs.length > 0) playSong(0, plSongs); }}>Play All</button>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                    {plSongs.map((s, i) => <SongRow key={i} s={s} i={i} list={plSongs} showPlaylist={true}/>)}
                </div>
            </>
        );
    };

    const renderUserPlaylist = (pl) => (
        <>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-[120px] h-[120px] rounded-xl shadow-lg flex items-center justify-center text-white text-[32px] overflow-hidden" style={{ background: `linear-gradient(135deg, ${pl.colors[0]}, ${pl.colors[1]})` }}>
                    {pl.songs.length > 0 && pl.songs[0].cover ? (
                        <img src={pl.songs[0].cover} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }}/>
                    ) : '...'}
                </div>
                <div>
                    <div className="text-[22px] font-bold">{pl.name}</div>
                    <div className="text-[13px] text-gray-400">{pl.songs.length} songs</div>
                    <div className="flex gap-2 mt-2">
                        {pl.songs.length > 0 && (
                            <button className="px-4 py-1.5 rounded-full bg-red-500 text-white text-[12px] font-medium hover:bg-red-600"
                                onClick={() => playSong(0, pl.songs)}>Play All</button>
                        )}
                        <button className="px-4 py-1.5 rounded-full bg-gray-200 text-gray-600 text-[12px] font-medium hover:bg-gray-300"
                            onClick={() => deletePlaylist(pl.id)}>Delete</button>
                    </div>
                </div>
            </div>
            {pl.songs.length === 0 ? (
                <div className="text-center text-gray-400 text-[13px] py-12">
                    This playlist is empty.<br/>
                    <span className="text-[11px]">Use the +PL button on any song to add it here.</span>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                    {pl.songs.map((s, i) => <SongRow key={i} s={s} i={i} list={pl.songs} onRemove={() => removeSongFromPlaylist(pl.id, i)}/>)}
                </div>
            )}
        </>
    );

    let displayNav = activeNav;
    if (activeBuiltinPlaylist) displayNav = activeBuiltinPlaylist;
    if (viewingPlaylist) displayNav = viewingPlaylist.name;

    const npSong = nowPlayingSong || defaultSongs[0];

    return (
        <div className="flex flex-col h-full bg-white" style={{ position: 'relative' }}>
            {/* Real audio element in the DOM */}
            <audio ref={audioElRef} onTimeUpdate={onTimeUpdate} onEnded={onEnded}
                onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
                onLoadedMetadata={() => { const a = getAudio(); if (a) setAudioDuration(a.duration || 30); }}
                preload="auto" style={{ display: 'none' }}/>

            {/* Add to playlist modal */}
            {addToPlaylistSong && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }} onClick={() => setAddToPlaylistSong(null)}>
                    <div className="bg-white rounded-xl shadow-2xl p-4 w-[280px]" onClick={e => e.stopPropagation()}>
                        <div className="text-[14px] font-semibold mb-3">Add to Playlist</div>
                        <div className="text-[12px] text-gray-400 mb-3 truncate">"{addToPlaylistSong.title}" by {addToPlaylistSong.artist}</div>
                        {playlists.length === 0 ? (
                            <div className="text-[12px] text-gray-400 py-4 text-center">No playlists yet. Create one first!</div>
                        ) : (
                            <div className="max-h-[200px] overflow-y-auto">
                                {playlists.map(pl => (
                                    <div key={pl.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer text-[13px]"
                                        onClick={() => addSongToPlaylist(pl.id, addToPlaylistSong)}>
                                        <div className="w-6 h-6 rounded" style={{ background: `linear-gradient(135deg, ${pl.colors[0]}, ${pl.colors[1]})` }}/>
                                        <span>{pl.name}</span>
                                        <span className="text-[11px] text-gray-400 ml-auto">{pl.songs.length} songs</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setAddToPlaylistSong(null)} className="mt-3 w-full py-1.5 rounded-lg bg-gray-100 text-[12px] text-gray-600 hover:bg-gray-200">Cancel</button>
                    </div>
                </div>
            )}

            {/* Delete playlist confirmation modal */}
            {confirmDeletePlaylist && (() => {
                const pl = playlists.find(p => p.id === confirmDeletePlaylist);
                return (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 51, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }} onClick={() => setConfirmDeletePlaylist(null)}>
                        <div className="bg-white rounded-xl shadow-2xl p-5 w-[280px] text-center" onClick={e => e.stopPropagation()}>
                            <div className="text-[14px] font-semibold mb-2">Delete Playlist?</div>
                            <div className="text-[12px] text-gray-400 mb-4">Are you sure you want to delete "{pl ? pl.name : ''}"? This action cannot be undone.</div>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmDeletePlaylist(null)} className="flex-1 py-1.5 rounded-lg bg-gray-100 text-[12px] text-gray-600 font-medium hover:bg-gray-200">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-1.5 rounded-lg bg-red-500 text-[12px] text-white font-medium hover:bg-red-600">Delete</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className="flex flex-1 overflow-hidden">
                <div className="w-[220px] min-w-[220px] bg-gray-50/95 border-r border-black/5 p-2 overflow-y-auto">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1 mt-1">Apple Music</div>
                    {navItems.map(item => (
                        <div key={item} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-[13px] ${displayNav === item ? 'bg-red-500 text-white' : 'hover:bg-black/[0.03]'}`}
                            onClick={() => { setActiveNav(item); setViewingPlaylist(null); }}>{item}</div>
                    ))}
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1 mt-4">Apple Mixes</div>
                    {Object.keys(builtinPlaylists).map(plName => (
                        <div key={plName} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-[13px] ${displayNav === plName ? 'bg-red-500 text-white' : 'hover:bg-black/[0.03]'}`}
                            onClick={() => { setActiveNav(plName); setViewingPlaylist(null); }}>
                            <div className="w-5 h-5 rounded" style={{ background: `linear-gradient(135deg, ${builtinPlaylists[plName].colors[0]}, ${builtinPlaylists[plName].colors[1]})` }}/>
                            {plName}
                        </div>
                    ))}
                    <div className="flex items-center justify-between px-3 py-1 mt-4">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">My Playlists</span>
                        <button onClick={() => setShowNewPlaylist(true)} className="text-red-500 text-[16px] hover:text-red-600 leading-none" title="New Playlist">+</button>
                    </div>
                    {showNewPlaylist && (
                        <div className="px-3 py-1">
                            <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') createPlaylist(newPlaylistName); if (e.key === 'Escape') { setShowNewPlaylist(false); setNewPlaylistName(''); } }}
                                placeholder="Playlist name..." className="w-full text-[12px] px-2 py-1 rounded border border-gray-300 outline-none focus:border-red-500" autoFocus/>
                        </div>
                    )}
                    {playlists.map(pl => (
                        <div key={pl.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-[13px] ${viewingPlaylist && viewingPlaylist.id === pl.id ? 'bg-red-500 text-white' : 'hover:bg-black/[0.03]'}`}
                            onClick={() => { setViewingPlaylist(pl); setActiveNav('__playlist'); }}>
                            <div className="w-5 h-5 rounded" style={{ background: `linear-gradient(135deg, ${pl.colors[0]}, ${pl.colors[1]})` }}/>
                            <span className="truncate">{pl.name}</span>
                            <span className="text-[10px] opacity-60 ml-auto">{pl.songs.length}</span>
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <h2 className="text-[26px] font-bold mb-6">{displayNav}</h2>
                    {viewingPlaylist ? renderUserPlaylist(viewingPlaylist) : activeBuiltinPlaylist ? renderPlaylistContent(activeBuiltinPlaylist) : renderContent()}
                </div>
            </div>
            {/* Now Playing bar */}
            <div className="h-[64px] border-t border-black/5 bg-gray-50/95 flex items-center px-4 gap-4">
                <div className="flex items-center gap-3 w-[220px]">
                    <CoverArt src={npSong.cover} color={npSong.color} size={40}/>
                    <div className="min-w-0"><div className="text-[13px] font-medium truncate">{npSong.title}</div><div className="text-[11px] text-gray-400 truncate">{npSong.artist}</div></div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShuffle(!shuffle)} className={`p-1 rounded ${shuffle ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
                        </button>
                        <button onClick={prevSong} className="text-gray-500 hover:text-gray-700"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                        <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">
                            {loadingAudio ? (<svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 019.95 9" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                            ) : isPlaying ? (<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M8 5v14l11-7z"/></svg>)}
                        </button>
                        <button onClick={nextSong} className="text-gray-500 hover:text-gray-700"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
                        <button onClick={() => setRepeat(!repeat)} className={`p-1 rounded ${repeat ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 w-full max-w-[400px]">
                        <span className="text-[10px] text-gray-400 w-8 text-right">{formatTime(currentTime)}</span>
                        <MacSlider min={0} max={100} value={progress} onChange={v => seekTo(v)} className="flex-1" accentColor="#ef4444"/>
                        <span className="text-[10px] text-gray-400 w-8">{formatTime(audioDuration)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-[140px]">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#999"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>
                    <MacSlider min={0} max={100} value={volume} onChange={v => setVolume(v)} className="flex-1" accentColor="#6b7280"/>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#999"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                </div>
            </div>
        </div>
    );
};

window.MusicApp = MusicApp;
