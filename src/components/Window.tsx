// macOS Window Component with full drag, resize, and focus management
const Window = ({ windowData, children }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const dragState = React.useRef({ dragging: false, resizing: false, dir: '', startX: 0, startY: 0, winX: 0, winY: 0, winW: 0, winH: 0, winId: null });

    const { id, title, focused, zIndex, minimized, maximized, opening, closing, x, y, width, height } = windowData;
    const darkMode = useStore(s => s.darkMode);

    // Unified mouse handlers on window level - never lost even on fast moves
    React.useEffect(() => {
        const onMouseMove = (e) => {
            const ds = dragState.current;
            if (!ds.dragging && !ds.resizing) return;
            e.preventDefault();
            const dx = e.clientX - ds.startX;
            const dy = e.clientY - ds.startY;
            if (ds.dragging) {
                MacStore.updateWindow(ds.winId, {
                    x: ds.winX + dx,
                    y: Math.max(0, ds.winY + dy),
                });
            }
            if (ds.resizing) {
                let newW = ds.winW, newH = ds.winH, newX = ds.winX, newY = ds.winY;
                if (ds.dir.includes('e')) newW = Math.max(300, ds.winW + dx);
                if (ds.dir.includes('w')) { newW = Math.max(300, ds.winW - dx); newX = ds.winX + (ds.winW - newW); }
                if (ds.dir.includes('s')) newH = Math.max(200, ds.winH + dy);
                if (ds.dir.includes('n')) { newH = Math.max(200, ds.winH - dy); newY = Math.max(0, ds.winY + (ds.winH - newH)); }
                MacStore.updateWindow(ds.winId, { x: newX, y: newY, width: newW, height: newH });
            }
        };
        const onMouseUp = () => {
            if (!dragState.current.dragging && !dragState.current.resizing) return;
            dragState.current.dragging = false;
            dragState.current.resizing = false;
            setIsDragging(false);
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    // Drag handlers
    const onDragStart = (e) => {
        if (e.target.closest('button')) return;
        e.preventDefault();
        dragState.current = { dragging: true, resizing: false, dir: '', startX: e.clientX, startY: e.clientY, winX: x, winY: y, winW: width, winH: height, winId: id };
        setIsDragging(true);
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
    };

    const startResize = (dir) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragState.current = { dragging: false, resizing: true, dir, startX: e.clientX, startY: e.clientY, winX: x, winY: y, winW: width, winH: height, winId: id };
        setIsResizing(true);
        document.body.style.userSelect = 'none';
    };

    const { minimizing, restoring } = windowData;
    if (minimized && !minimizing) return null;

    const windowStyle = maximized
        ? { top: 0, left: 0, width: '100vw', height: 'calc(100vh - 25px)', zIndex, borderRadius: 0 }
        : { top: y, left: x, width, height, zIndex };

    const animClass = opening ? 'animate-window-open'
        : closing ? 'animate-window-close pointer-events-none'
        : minimizing ? 'animate-minimize pointer-events-none'
        : restoring ? 'animate-restore'
        : '';
    const shadowClass = isDragging ? 'window-shadow-dragging' : focused ? 'window-shadow-focused' : 'window-shadow-unfocused';
    const transitionClass = (!isDragging && !isResizing && !opening && !closing && !minimizing && !restoring) ? 'window-transition' : '';

    return (
        <div
            className={`absolute flex flex-col rounded-xl overflow-hidden border border-black/10 ${shadowClass} ${animClass} ${transitionClass}`}
            style={{ ...windowStyle, opacity: isDragging ? 0.88 : 1, transition: isDragging ? 'none' : undefined }}
            onMouseDown={() => { if (!focused) MacStore.focusWindow(id); }}
        >
            {/* Translucent background */}
            <div className="absolute inset-0 glass pointer-events-none" style={{ zIndex: -1 }}/>

            {/* Title bar */}
            <div
                className={`flex items-center h-[38px] min-h-[38px] px-3 border-b relative cursor-default ${darkMode ? 'border-white/5' : 'border-black/5'}`}
                onMouseDown={onDragStart}
                onDoubleClick={() => MacStore.toggleMaximize(id)}
                style={{ background: darkMode
                    ? (focused ? 'rgba(56,56,56,0.98)' : 'rgba(48,48,48,0.95)')
                    : (focused ? 'rgba(236,236,236,0.95)' : 'rgba(230,230,230,0.95)') }}
            >
                <TrafficLights windowId={id} focused={focused} />
                <div className={`absolute left-0 right-0 text-center text-[13px] font-medium pointer-events-none select-none ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {title}
                </div>
            </div>

            {/* Window content */}
            <div className={`flex-1 overflow-hidden relative ${darkMode ? 'bg-[#1e1e1e] text-gray-200' : 'bg-white'}`}>
                {children}
            </div>

            {/* Resize handles */}
            {!maximized && (
                <>
                    <div className="absolute top-0 left-1.5 right-1.5 h-1 cursor-n-resize" onMouseDown={startResize('n')}/>
                    <div className="absolute bottom-0 left-1.5 right-1.5 h-1 cursor-s-resize" onMouseDown={startResize('s')}/>
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 cursor-w-resize" onMouseDown={startResize('w')}/>
                    <div className="absolute right-0 top-1.5 bottom-1.5 w-1 cursor-e-resize" onMouseDown={startResize('e')}/>
                    <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" onMouseDown={startResize('ne')}/>
                    <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" onMouseDown={startResize('nw')}/>
                    <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" onMouseDown={startResize('se')}/>
                    <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" onMouseDown={startResize('sw')}/>
                </>
            )}
        </div>
    );
};

window.Window = Window;
