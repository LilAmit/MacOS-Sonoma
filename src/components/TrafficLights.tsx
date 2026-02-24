// macOS Traffic Light Buttons (Close, Minimize, Maximize)
const TrafficLights = ({ windowId, focused = true }) => {
    const [hovered, setHovered] = React.useState(false);

    return (
        <div className="flex gap-2 z-10" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {/* Close */}
            <button
                onClick={(e) => { e.stopPropagation(); MacStore.closeWindow(windowId); }}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-all"
                style={{ background: focused ? '#FF5F57' : '#ccc', border: `0.5px solid ${focused ? '#E14942' : '#bbb'}` }}
            >
                {hovered && (
                    <svg viewBox="0 0 12 12" width="8" height="8">
                        <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="#4d0000" strokeWidth="1.3" fill="none"/>
                    </svg>
                )}
            </button>
            {/* Minimize */}
            <button
                onClick={(e) => { e.stopPropagation(); MacStore.minimizeWindow(windowId); }}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-all"
                style={{ background: focused ? '#FFBD2E' : '#ccc', border: `0.5px solid ${focused ? '#DFA123' : '#bbb'}` }}
            >
                {hovered && (
                    <svg viewBox="0 0 12 12" width="8" height="8">
                        <path d="M2.5 6h7" stroke="#995700" strokeWidth="1.3" fill="none"/>
                    </svg>
                )}
            </button>
            {/* Maximize */}
            <button
                onClick={(e) => { e.stopPropagation(); MacStore.toggleMaximize(windowId); }}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-all"
                style={{ background: focused ? '#28C840' : '#ccc', border: `0.5px solid ${focused ? '#1DAD2B' : '#bbb'}` }}
            >
                {hovered && (
                    <svg viewBox="0 0 12 12" width="8" height="8">
                        <path d="M2 2l3.5 0 0-2M10 10l-3.5 0 0 2M2 10l3.5 0 0 2M10 2l-3.5 0 0-2" stroke="#006500" strokeWidth="1" fill="none" transform="scale(0.75) translate(2,2)"/>
                    </svg>
                )}
            </button>
        </div>
    );
};

window.TrafficLights = TrafficLights;
