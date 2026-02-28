// Custom macOS-style slider with reliable dragging
const MacSlider = ({ min = 0, max = 100, value, onChange, className = '', accentColor }) => {
    const trackRef = React.useRef(null);
    const draggingRef = React.useRef(false);
    const onChangeRef = React.useRef(onChange);
    const propsRef = React.useRef({ min, max });
    const [, forceUpdate] = React.useState(0);

    // Keep refs in sync with latest props
    onChangeRef.current = onChange;
    propsRef.current = { min, max };

    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

    const calcValue = (clientX) => {
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const { min: mn, max: mx } = propsRef.current;
        return Math.round(mn + ratio * (mx - mn));
    };

    const onMouseDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        draggingRef.current = true;
        forceUpdate(n => n + 1);
        onChangeRef.current(calcValue(e.clientX));

        const onMove = (ev) => {
            ev.preventDefault();
            onChangeRef.current(calcValue(ev.clientX));
        };
        const onUp = () => {
            draggingRef.current = false;
            forceUpdate(n => n + 1);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    const darkMode = document.documentElement.classList.contains('dark-mode');
    const trackBg = darkMode ? '#4a4a4a' : '#d1d5db';
    const fillColor = accentColor || 'var(--accent-color, #007AFF)';
    const thumbBg = darkMode ? '#e5e5e7' : 'white';
    const thumbShadow = darkMode
        ? '0 0.5px 1px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)'
        : '0 0.5px 1px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15)';

    return (
        <div
            ref={trackRef}
            className={`relative cursor-pointer ${className}`}
            style={{ height: '20px', minWidth: '60px' }}
            onMouseDown={onMouseDown}
        >
            {/* Track background */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full" style={{ height: '4px', background: trackBg }}/>
            {/* Track fill */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full" style={{ height: '4px', width: pct + '%', background: fillColor }}/>
            {/* Thumb */}
            <div
                className="absolute top-1/2 -translate-y-1/2 rounded-full"
                style={{
                    width: '18px', height: '18px',
                    left: `calc(${pct}% - 9px)`,
                    background: thumbBg,
                    boxShadow: thumbShadow,
                    border: darkMode ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(0,0,0,0.08)',
                    transition: draggingRef.current ? 'none' : 'left 0.1s ease',
                }}
            />
        </div>
    );
};

window.MacSlider = MacSlider;
