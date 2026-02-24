// Maps App - Real interactive map via OpenStreetMap
const MapsApp = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedPlace, setSelectedPlace] = React.useState(null);
    const [mapCenter, setMapCenter] = React.useState({ lat: 37.5, lng: -122.2 });
    const [mapZoom, setMapZoom] = React.useState(10);
    const iframeRef = React.useRef(null);

    const places = [
        { name: 'Apple Park', category: 'Landmark', address: 'One Apple Park Way, Cupertino, CA', lat: 37.3349, lng: -122.0090, color: '#FF3B30' },
        { name: 'Googleplex', category: 'Landmark', address: '1600 Amphitheatre Pkwy, Mountain View, CA', lat: 37.4220, lng: -122.0841, color: '#4285F4' },
        { name: 'Stanford University', category: 'Education', address: '450 Serra Mall, Stanford, CA', lat: 37.4275, lng: -122.1697, color: '#8C1515' },
        { name: 'San Francisco Airport', category: 'Airport', address: 'San Francisco, CA 94128', lat: 37.6213, lng: -122.3790, color: '#007AFF' },
        { name: 'Golden Gate Bridge', category: 'Landmark', address: 'Golden Gate Bridge, San Francisco, CA', lat: 37.8199, lng: -122.4783, color: '#FF9500' },
        { name: 'Fisherman\'s Wharf', category: 'Attraction', address: 'Fisherman\'s Wharf, San Francisco, CA', lat: 37.8080, lng: -122.4177, color: '#34C759' },
        { name: 'Alcatraz Island', category: 'Landmark', address: 'Alcatraz Island, San Francisco, CA', lat: 37.8267, lng: -122.4230, color: '#FF2D55' },
        { name: 'Pier 39', category: 'Attraction', address: 'Pier 39, San Francisco, CA', lat: 37.8087, lng: -122.4098, color: '#5856D6' },
    ];

    const filteredPlaces = searchQuery
        ? places.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.address.toLowerCase().includes(searchQuery.toLowerCase()))
        : places;

    const getMapUrl = (lat, lng, zoom) => {
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.5 / zoom * 10},${lat - 0.3 / zoom * 10},${lng + 0.5 / zoom * 10},${lat + 0.3 / zoom * 10}&layer=mapnik&marker=${lat},${lng}`;
    };

    const selectPlace = (index) => {
        setSelectedPlace(index);
        const place = filteredPlaces[index];
        setMapCenter({ lat: place.lat, lng: place.lng });
        setMapZoom(15);
    };

    const zoomIn = () => setMapZoom(z => Math.min(18, z + 2));
    const zoomOut = () => setMapZoom(z => Math.max(2, z - 2));

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            const found = places.findIndex(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (found >= 0) selectPlace(found);
        }
    };

    const mapUrl = selectedPlace !== null
        ? getMapUrl(filteredPlaces[selectedPlace].lat, filteredPlaces[selectedPlace].lng, mapZoom)
        : getMapUrl(mapCenter.lat, mapCenter.lng, mapZoom);

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-[280px] min-w-[280px] bg-gray-50/95 border-r border-black/5 flex flex-col">
                <div className="p-3 border-b border-black/5">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-black/5">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#999"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="Search Maps" className="flex-1 bg-transparent outline-none text-[13px] font-sf"/>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredPlaces.map((place, i) => (
                        <div key={i}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-default border-b border-black/[0.03] ${selectedPlace === i ? 'bg-blue-500/[0.08]' : 'hover:bg-black/[0.02]'}`}
                            onClick={() => selectPlace(i)}
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: place.color + '20' }}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill={place.color}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[13px] font-medium truncate">{place.name}</div>
                                <div className="text-[11px] text-gray-400 truncate">{place.category} · {place.address.split(',')[0]}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 border-t border-black/5 text-[10px] text-gray-400 text-center">
                    Powered by OpenStreetMap
                </div>
            </div>

            {/* Map area */}
            <div className="flex-1 relative overflow-hidden">
                <iframe
                    ref={iframeRef}
                    src={mapUrl}
                    className="w-full h-full border-none"
                    title="Map"
                    loading="lazy"
                />

                {/* Zoom controls */}
                <div className="absolute bottom-6 right-6 flex flex-col bg-white/90 rounded-lg shadow-lg border border-black/10 overflow-hidden">
                    <button onClick={zoomIn} className="px-3 py-2 text-[16px] hover:bg-black/5 border-b border-black/10">+</button>
                    <button onClick={zoomOut} className="px-3 py-2 text-[16px] hover:bg-black/5">−</button>
                </div>

                {/* Selected place info */}
                {selectedPlace !== null && (
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-black/10 p-4 max-w-[280px]">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: filteredPlaces[selectedPlace].color }}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            </div>
                            <div>
                                <div className="text-[15px] font-semibold">{filteredPlaces[selectedPlace].name}</div>
                                <div className="text-[12px] text-gray-500 mt-0.5">{filteredPlaces[selectedPlace].address}</div>
                                <div className="flex gap-2 mt-2">
                                    <a href={`https://www.openstreetmap.org/?mlat=${filteredPlaces[selectedPlace].lat}&mlon=${filteredPlaces[selectedPlace].lng}#map=16/${filteredPlaces[selectedPlace].lat}/${filteredPlaces[selectedPlace].lng}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="px-3 py-1 rounded-full bg-blue-500 text-white text-[11px] font-medium cursor-default">
                                        Directions
                                    </a>
                                    <button onClick={() => setSelectedPlace(null)}
                                        className="px-3 py-1 rounded-full bg-gray-100 text-[11px] font-medium">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

window.MapsApp = MapsApp;
