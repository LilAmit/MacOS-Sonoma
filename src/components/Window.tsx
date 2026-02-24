// macOS Window Component with full drag, resize, and focus management
const Window = ({ windowData, children }) => {
    const dragRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const [resizeDir, setResizeDir] = React.useState('');
    const startRef = React.useRef({ x: 0, y: 0, winX: 0, winY: 0, winW: 0, winH: 0 });

    const { id, title, focused, zIndex, minimized, maximized, opening, closing, x, y, width, height } = windowData;

    // Drag handlers
    const onDragStart = (e) => {
        if (e.target.closest('button')) return;
        setIsDragging(true);
        startRef.current = { x: e.clientX, y: e.clientY, winX: x, winY: y, winW: width, winH: height };
        document.body.style.cursor = 'move';
        e.preventDefault();
    };

    React.useEffect(() => {
        const onMouseMove = (e) => {
            if (isDragging) {
                const dx = e.clientX - startRef.current.x;
                const dy = e.clientY - startRef.current.y;
                MacStore.updateWindow(id, {
                    x: startRef.current.winX + dx,
                    y: Math.max(0, startRef.current.winY + dy),
                });
            }
            if (isResizing) {
                const dx = e.clientX - startRef.current.x;
                const dy = e.clientY - startRef.current.y;
                const { winX, winY, winW, winH } = startRef.current;
                let newW = winW, newH = winH, newX = winX, newY = winY;

                if (resizeDir.includes('e')) newW = Math.max(300, winW + dx);
                if (resizeDir.includes('w')) { newW = Math.max(300, winW - dx); newX = winX + (winW - newW); }
                if (resizeDir.includes('s')) newH = Math.max(200, winH + dy);
                if (resizeDir.includes('n')) { newH = Math.max(200, winH - dy); newY = Math.max(0, winY + (winH - newH)); }

                MacStore.updateWindow(id, { x: newX, y: newY, width: newW, height: newH });
            }
        };
        const onMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            document.body.style.cursor = '';
        };
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, isResizing, resizeDir, id]);

    const startResize = (dir) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeDir(dir);
        startRef.current = { x: e.clientX, y: e.clientY, winX: x, winY: y, winW: width, winH: height };
    };

    if (minimized) return null;

    const windowStyle = maximized
        ? { top: 0, left: 0, width: '100vw', height: 'calc(100vh - 25px)', zIndex, borderRadius: 0 }
        : { top: y, left: x, width, height, zIndex };

    const animClass = opening ? 'animate-window-open' : closing ? 'animate-window-close pointer-events-none' : '';
    const shadowClass = focused ? 'window-shadow-focused' : 'window-shadow-unfocused';

    return (
        <div
            className={`absolute flex flex-col rounded-xl overflow-hidden border border-black/10 ${shadowClass} ${animClass}`}
            style={windowStyle}
            onMouseDown={() => { if (!focused) MacStore.focusWindow(id); }}
        >
            {/* Translucent background */}
            <div className="absolute inset-0 glass pointer-events-none" style={{ zIndex: -1 }}/>

            {/* Title bar */}
            <div
                className={`flex items-center h-[38px] min-h-[38px] px-3 border-b border-black/5 relative cursor-default ${focused ? '' : 'bg-gray-200/80'}`}
                onMouseDown={onDragStart}
                onDoubleClick={() => MacStore.toggleMaximize(id)}
                style={{ background: focused ? 'rgba(236,236,236,0.95)' : 'rgba(230,230,230,0.95)' }}
            >
                <TrafficLights windowId={id} focused={focused} />
                <div className="absolute left-0 right-0 text-center text-[13px] font-medium text-gray-500 pointer-events-none select-none">
                    {title}
                </div>
            </div>

            {/* Window content */}
            <div className="flex-1 overflow-hidden relative bg-white">
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
