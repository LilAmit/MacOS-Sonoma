// Photos App - with real photos and functional tabs
const PhotosApp = () => {
    const [activeNav, setActiveNav] = React.useState('Library');
    const [selectedPhoto, setSelectedPhoto] = React.useState(null);

    // Real photos from Lorem Picsum - each ID gives a unique photo
    const allPhotos = [
        { id: 10, w: 4, h: 3, cat: 'nature', fav: true, person: 'Amit', place: 'Forest', album: 'Nature', date: 'Dec 2024' },
        { id: 11, w: 3, h: 4, cat: 'nature', fav: false, person: null, place: 'Lake', album: 'Nature', date: 'Dec 2024' },
        { id: 12, w: 4, h: 3, cat: 'nature', fav: true, person: null, place: 'Mountains', album: 'Nature', date: 'Nov 2024' },
        { id: 13, w: 4, h: 3, cat: 'nature', fav: false, person: null, place: null, album: 'Nature', date: 'Nov 2024' },
        { id: 14, w: 3, h: 4, cat: 'city', fav: false, person: 'Arina', place: 'New York', album: 'Travel', date: 'Oct 2024' },
        { id: 15, w: 4, h: 3, cat: 'city', fav: true, person: null, place: 'Paris', album: 'Travel', date: 'Oct 2024' },
        { id: 16, w: 4, h: 3, cat: 'city', fav: false, person: null, place: 'London', album: 'Travel', date: 'Oct 2024' },
        { id: 17, w: 4, h: 3, cat: 'nature', fav: false, person: 'Amit', place: 'Beach', album: 'Summer', date: 'Sep 2024' },
        { id: 18, w: 3, h: 4, cat: 'architecture', fav: true, person: null, place: 'Tokyo', album: 'Travel', date: 'Sep 2024' },
        { id: 19, w: 4, h: 3, cat: 'nature', fav: false, person: null, place: 'Desert', album: 'Nature', date: 'Aug 2024' },
        { id: 20, w: 4, h: 3, cat: 'city', fav: false, person: 'Bambi', place: 'San Francisco', album: 'Travel', date: 'Aug 2024' },
        { id: 21, w: 3, h: 4, cat: 'nature', fav: true, person: null, place: 'Canyon', album: 'Nature', date: 'Jul 2024' },
        { id: 22, w: 4, h: 3, cat: 'architecture', fav: false, person: null, place: 'Rome', album: 'Travel', date: 'Jul 2024' },
        { id: 23, w: 4, h: 3, cat: 'nature', fav: false, person: 'Arina', place: 'Waterfall', album: 'Nature', date: 'Jun 2024' },
        { id: 24, w: 4, h: 3, cat: 'city', fav: true, person: null, place: 'Barcelona', album: 'Travel', date: 'Jun 2024' },
        { id: 25, w: 3, h: 4, cat: 'nature', fav: false, person: null, place: 'Sunset', album: 'Summer', date: 'Jun 2024' },
        { id: 26, w: 4, h: 3, cat: 'nature', fav: false, person: 'Bambi', place: 'River', album: 'Nature', date: 'May 2024' },
        { id: 27, w: 4, h: 3, cat: 'architecture', fav: true, person: null, place: 'Dubai', album: 'Travel', date: 'May 2024' },
        { id: 28, w: 4, h: 3, cat: 'nature', fav: false, person: null, place: 'Hills', album: 'Nature', date: 'Apr 2024' },
        { id: 29, w: 3, h: 4, cat: 'city', fav: false, person: 'Amit', place: 'Amsterdam', album: 'Travel', date: 'Apr 2024' },
        { id: 30, w: 4, h: 3, cat: 'nature', fav: true, person: null, place: 'Ocean', album: 'Summer', date: 'Mar 2024' },
        { id: 31, w: 4, h: 3, cat: 'city', fav: false, person: null, place: 'Berlin', album: 'Travel', date: 'Mar 2024' },
        { id: 32, w: 4, h: 3, cat: 'nature', fav: false, person: 'Arina', place: 'Meadow', album: 'Nature', date: 'Feb 2024' },
        { id: 33, w: 3, h: 4, cat: 'architecture', fav: true, person: null, place: 'Sydney', album: 'Travel', date: 'Feb 2024' },
        { id: 34, w: 4, h: 3, cat: 'nature', fav: false, person: null, place: 'Snow', album: 'Winter', date: 'Jan 2024' },
        { id: 35, w: 4, h: 3, cat: 'nature', fav: false, person: 'Bambi', place: 'Cliff', album: 'Nature', date: 'Jan 2024' },
        { id: 36, w: 4, h: 3, cat: 'city', fav: true, person: null, place: 'Hong Kong', album: 'Travel', date: 'Dec 2023' },
        { id: 37, w: 3, h: 4, cat: 'nature', fav: false, person: null, place: 'Rainforest', album: 'Nature', date: 'Dec 2023' },
        { id: 38, w: 4, h: 3, cat: 'architecture', fav: false, person: 'Amit', place: 'Istanbul', album: 'Travel', date: 'Nov 2023' },
        { id: 39, w: 4, h: 3, cat: 'nature', fav: true, person: null, place: 'Aurora', album: 'Winter', date: 'Nov 2023' },
    ];

    const people = [
        { name: 'Amit', photoIds: [10, 17, 29, 38], color: '#FF3B30' },
        { name: 'Arina', photoIds: [14, 23, 32], color: '#AF52DE' },
        { name: 'Bambi', photoIds: [20, 26, 35], color: '#007AFF' },
    ];

    const places = [
        { name: 'Mountains', count: 4, photoId: 12 },
        { name: 'Beach & Ocean', count: 3, photoId: 30 },
        { name: 'Cities', count: 8, photoId: 15 },
        { name: 'Forest', count: 3, photoId: 10 },
        { name: 'Desert & Canyon', count: 2, photoId: 19 },
        { name: 'Snow & Winter', count: 2, photoId: 34 },
    ];

    const albums = [
        { name: 'Nature', count: 12, photoId: 12, colors: ['#34C759', '#28B463'] },
        { name: 'Travel', count: 10, photoId: 15, colors: ['#007AFF', '#5856D6'] },
        { name: 'Summer', count: 3, photoId: 25, colors: ['#FF9500', '#FF3B30'] },
        { name: 'Winter', count: 2, photoId: 34, colors: ['#5AC8FA', '#007AFF'] },
    ];

    const navItems = ['Library', 'Memories', 'People', 'Places', 'Favorites', 'Recents', 'Albums'];

    const getPhotoUrl = (id, size = 300) => `https://picsum.photos/id/${id}/${size}/${size}`;
    const getPhotoUrlWide = (id, w = 400, h = 300) => `https://picsum.photos/id/${id}/${w}/${h}`;

    const getFilteredPhotos = () => {
        switch (activeNav) {
            case 'Favorites': return allPhotos.filter(p => p.fav);
            case 'Recents': return allPhotos.slice(0, 12);
            default: return allPhotos;
        }
    };

    const renderPhotoGrid = (photos) => (
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {photos.map((p, i) => (
                <div key={p.id}
                    className="aspect-square rounded cursor-default hover:opacity-90 transition-opacity overflow-hidden bg-gray-100 relative group"
                    onClick={() => setSelectedPhoto(p)}
                >
                    <img src={getPhotoUrl(p.id)} alt="" className="w-full h-full object-cover" draggable="false"
                        loading="lazy" onError={(e) => { e.target.style.display = 'none'; }}/>
                    {p.fav && (
                        <div className="absolute top-1.5 right-1.5 text-white drop-shadow-md text-[12px]">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderSelectedPhoto = () => (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <button onClick={() => setSelectedPhoto(null)} className="text-blue-500 text-[13px] hover:underline">← Back</button>
                <div className="flex gap-2">
                    {selectedPhoto.place && <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{selectedPhoto.place}</span>}
                    <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{selectedPhoto.date}</span>
                    {selectedPhoto.fav && <span className="text-[11px] text-red-400 bg-red-50 px-2 py-0.5 rounded-full">Favorite</span>}
                </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <img src={getPhotoUrlWide(selectedPhoto.id, 800, 600)} alt="" className="max-w-full max-h-full object-contain" draggable="false"/>
            </div>
        </div>
    );

    const renderMemories = () => (
        <>
            <h2 className="text-[22px] font-bold mb-4">Memories</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                    { title: 'Summer Adventures', subtitle: 'Jun - Sep 2024', ids: [17, 25, 30] },
                    { title: 'City Exploring', subtitle: 'Across the world', ids: [14, 15, 20] },
                    { title: 'Nature Escapes', subtitle: 'Best of 2024', ids: [10, 12, 21] },
                    { title: 'Winter Vibes', subtitle: 'Nov 2023 - Jan 2024', ids: [34, 39, 37] },
                ].map((mem, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden cursor-default group h-[180px]">
                        <img src={getPhotoUrlWide(mem.ids[0], 500, 300)} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-[1.03]" draggable="false"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
                        <div className="absolute bottom-3 left-3 text-white">
                            <div className="text-[15px] font-semibold">{mem.title}</div>
                            <div className="text-[11px] opacity-80">{mem.subtitle}</div>
                        </div>
                        <div className="absolute bottom-3 right-3 flex -space-x-2">
                            {mem.ids.map(id => (
                                <div key={id} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden">
                                    <img src={getPhotoUrl(id, 50)} alt="" className="w-full h-full object-cover" draggable="false"/>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderPeople = () => (
        <>
            <h2 className="text-[22px] font-bold mb-4">People</h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
                {people.map(person => (
                    <div key={person.name} className="flex flex-col items-center cursor-default group"
                        onClick={() => setActiveNav('_person_' + person.name)}>
                        <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-3 mb-2 shadow-md transition-transform group-hover:scale-105"
                            style={{ borderColor: person.color, borderWidth: 3 }}>
                            <img src={getPhotoUrl(person.photoIds[0], 200)} alt="" className="w-full h-full object-cover" draggable="false"/>
                        </div>
                        <div className="text-[14px] font-medium">{person.name}</div>
                        <div className="text-[11px] text-gray-400">{person.photoIds.length} photos</div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderPlaces = () => (
        <>
            <h2 className="text-[22px] font-bold mb-4">Places</h2>
            <div className="grid grid-cols-3 gap-3">
                {places.map(place => (
                    <div key={place.name} className="rounded-xl overflow-hidden cursor-default group relative h-[140px]"
                        onClick={() => setActiveNav('_place_' + place.name)}>
                        <img src={getPhotoUrlWide(place.photoId, 400, 250)} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-[1.03]" draggable="false"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
                        <div className="absolute bottom-2 left-3 text-white">
                            <div className="text-[13px] font-semibold">{place.name}</div>
                            <div className="text-[10px] opacity-80">{place.count} photos</div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderAlbums = () => (
        <>
            <h2 className="text-[22px] font-bold mb-4">Albums</h2>
            <div className="grid grid-cols-3 gap-4">
                {albums.map(album => (
                    <div key={album.name} className="cursor-default group" onClick={() => setActiveNav('_album_' + album.name)}>
                        <div className="rounded-xl overflow-hidden shadow-md mb-2 h-[150px] transition-transform group-hover:scale-[1.02]">
                            <img src={getPhotoUrlWide(album.photoId, 400, 300)} alt="" className="w-full h-full object-cover" draggable="false"/>
                        </div>
                        <div className="text-[13px] font-medium">{album.name}</div>
                        <div className="text-[11px] text-gray-400">{album.count} photos</div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderPersonPhotos = (personName) => {
        const person = people.find(p => p.name === personName);
        if (!person) return null;
        const photos = allPhotos.filter(p => p.person === personName);
        return (
            <>
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setActiveNav('People')} className="text-blue-500 text-[13px] hover:underline">← People</button>
                    <h2 className="text-[22px] font-bold">{personName}</h2>
                    <span className="text-[13px] text-gray-400">{photos.length} photos</span>
                </div>
                {renderPhotoGrid(photos)}
            </>
        );
    };

    const renderPlacePhotos = (placeName) => {
        const photos = allPhotos.filter(p => p.place && p.place.toLowerCase().includes(placeName.toLowerCase().split(' ')[0]));
        return (
            <>
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setActiveNav('Places')} className="text-blue-500 text-[13px] hover:underline">← Places</button>
                    <h2 className="text-[22px] font-bold">{placeName}</h2>
                </div>
                {renderPhotoGrid(photos.length > 0 ? photos : allPhotos.slice(0, 6))}
            </>
        );
    };

    const renderAlbumPhotos = (albumName) => {
        const photos = allPhotos.filter(p => p.album === albumName);
        return (
            <>
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setActiveNav('Albums')} className="text-blue-500 text-[13px] hover:underline">← Albums</button>
                    <h2 className="text-[22px] font-bold">{albumName}</h2>
                    <span className="text-[13px] text-gray-400">{photos.length} photos</span>
                </div>
                {renderPhotoGrid(photos)}
            </>
        );
    };

    const renderContent = () => {
        if (selectedPhoto) return renderSelectedPhoto();

        if (activeNav.startsWith('_person_')) return renderPersonPhotos(activeNav.replace('_person_', ''));
        if (activeNav.startsWith('_place_')) return renderPlacePhotos(activeNav.replace('_place_', ''));
        if (activeNav.startsWith('_album_')) return renderAlbumPhotos(activeNav.replace('_album_', ''));

        switch (activeNav) {
            case 'Memories': return renderMemories();
            case 'People': return renderPeople();
            case 'Places': return renderPlaces();
            case 'Albums': return renderAlbums();
            case 'Favorites':
            case 'Recents':
                return (
                    <>
                        <h2 className="text-[22px] font-bold mb-4">{activeNav}</h2>
                        {renderPhotoGrid(getFilteredPhotos())}
                    </>
                );
            case 'Library':
            default: {
                const photos = allPhotos;
                const months = [...new Set(photos.map(p => p.date))];
                return (
                    <>
                        <h2 className="text-[22px] font-bold mb-1">Library</h2>
                        <div className="text-[12px] text-gray-400 mb-4">{photos.length} Photos</div>
                        {months.map(month => {
                            const monthPhotos = photos.filter(p => p.date === month);
                            return (
                                <div key={month} className="mb-5">
                                    <div className="text-[13px] font-semibold text-gray-500 mb-2">{month}</div>
                                    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                                        {monthPhotos.map(p => (
                                            <div key={p.id}
                                                className="aspect-square rounded cursor-default hover:opacity-90 transition-opacity overflow-hidden bg-gray-100 relative group"
                                                onClick={() => setSelectedPhoto(p)}
                                            >
                                                <img src={getPhotoUrl(p.id)} alt="" className="w-full h-full object-cover" draggable="false" loading="lazy"
                                                    onError={(e) => { e.target.style.display = 'none'; }}/>
                                                {p.fav && (
                                                    <div className="absolute top-1 right-1 text-white drop-shadow-md text-[10px]">
                                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                );
            }
        }
    };

    // Determine which nav item is actually active for sidebar highlighting
    const displayNav = activeNav.startsWith('_') ? activeNav.split('_')[1] === 'person' ? 'People' : activeNav.split('_')[1] === 'place' ? 'Places' : 'Albums' : activeNav;

    return (
        <div className="flex h-full">
            <div className="w-[180px] min-w-[180px] bg-gray-50/95 border-r border-black/5 p-2">
                {navItems.map(item => (
                    <div key={item}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-default text-[13px] ${displayNav === item ? 'bg-blue-500 text-white' : 'hover:bg-black/[0.03]'}`}
                        onClick={() => { setActiveNav(item); setSelectedPhoto(null); }}
                    >
                        {item}
                    </div>
                ))}
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-white">
                {renderContent()}
            </div>
        </div>
    );
};

window.PhotosApp = PhotosApp;
