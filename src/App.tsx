// Main App - root component with boot screen
const App = () => {
    const locked = useStore(s => s.locked);
    const [booting, setBooting] = React.useState(true);
    const [bootProgress, setBootProgress] = React.useState(0);

    // Real boot: preload wallpapers + app icons, track actual progress
    React.useEffect(() => {
        if (!booting) return;

        // Collect all image URLs that need preloading
        const imageUrls = [
            // Local wallpapers only (skip online ones to avoid slow boot)
            ...WALLPAPERS.filter(w => !w.path.startsWith('http')).map(w => w.path),
            // App icon images (from MacIcons that use <img>)
            'app icons/fidnericon.png',
            'app icons/safariicon.png',
            'app icons/messagesicon.png',
            'app icons/mailicon.png',
            'app icons/mapsicon.png',
            'app icons/photosicon.png',
            'app icons/calculatoricon.jfif',
            'app icons/terminalicon.jfif',
            'app icons/settingsicon.jpg',
            'app icons/launchpadicon.png',
            'app icons/calendericon.jfif',
            'app icons/wordicon.png',
            'app icons/musicicon.png',
            'app icons/appstoreicon.png',
            'app icons/vscodeicon.jfif',
            'app icons/trashicon.jpg',
        ];

        const total = imageUrls.length;
        let loaded = 0;
        let allLoaded = false;
        let minTimePassed = false;
        let done = false;
        const minDuration = 3000; // Minimum 3 seconds boot time
        const startTime = Date.now();

        const tryFinish = () => {
            if (done || !allLoaded || !minTimePassed) return;
            done = true;
            setBootProgress(100);
            setTimeout(() => setBooting(false), 500);
        };

        const updateProgress = () => {
            loaded++;
            // Scale real loading progress to 0-90%, reserve last 10% for min timer
            const loadRatio = loaded / total;
            const elapsed = Date.now() - startTime;
            const timeRatio = Math.min(elapsed / minDuration, 1);
            // Progress is the slower of the two (load vs time), eased
            const progress = Math.min(loadRatio, timeRatio);
            const eased = 1 - Math.pow(1 - progress, 2);
            setBootProgress(eased * 100);

            if (loaded >= total) {
                allLoaded = true;
                tryFinish();
            }
        };

        imageUrls.forEach(url => {
            const img = new Image();
            img.onload = updateProgress;
            img.onerror = updateProgress;
            img.src = url;
        });

        // Animate progress smoothly during the minimum wait period
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const timeRatio = Math.min(elapsed / minDuration, 1);
            const loadRatio = loaded / total;
            const progress = Math.min(loadRatio, timeRatio);
            const eased = 1 - Math.pow(1 - progress, 2);
            setBootProgress(eased * 100);
        }, 50);

        // Minimum 3s timer
        const minTimer = setTimeout(() => {
            minTimePassed = true;
            clearInterval(progressInterval);
            tryFinish();
        }, minDuration);

        // Safety timeout: if loading takes more than 10s, finish anyway
        const safetyTimer = setTimeout(() => {
            if (!done) {
                done = true;
                clearInterval(progressInterval);
                setBootProgress(100);
                setTimeout(() => setBooting(false), 500);
            }
        }, 10000);

        return () => {
            clearTimeout(minTimer);
            clearTimeout(safetyTimer);
            clearInterval(progressInterval);
        };
    }, []);

    // Send a welcome notification after unlock
    const prevLocked = React.useRef(true);
    React.useEffect(() => {
        if (prevLocked.current && !locked) {
            setTimeout(() => {
                MacStore.addNotification('macOS Sonoma', 'Welcome Back', 'You have 2 new messages and 1 reminder.');
            }, 1500);
        }
        prevLocked.current = locked;
    }, [locked]);

    if (booting) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[99999]"
                style={{ transition: 'opacity 0.5s ease', opacity: bootProgress >= 100 ? 0 : 1 }}>
                {/* Apple Logo */}
                <svg viewBox="0 0 170 170" width="80" height="80" fill="white" className="mb-8">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.04-7.41-11.73-14.04-5.03-7.08-9.17-15.29-12.41-24.65-3.47-10.11-5.21-19.9-5.21-29.38 0-10.86 2.35-20.22 7.04-28.07 3.69-6.3 8.61-11.27 14.76-14.92s12.79-5.51 19.95-5.63c3.91 0 9.05 1.21 15.43 3.59 6.36 2.39 10.45 3.6 12.26 3.6 1.35 0 5.94-1.42 13.72-4.24 7.36-2.62 13.57-3.71 18.66-3.27 13.79 1.11 24.13 6.54 31.01 16.32-12.32 7.47-18.41 17.94-18.28 31.37.12 10.46 3.91 19.17 11.35 26.08 3.38 3.21 7.15 5.68 11.34 7.44-.91 2.64-1.87 5.17-2.89 7.59zM119.11 7.24c0 8.2-3 15.86-8.96 22.95-7.19 8.4-15.89 13.25-25.32 12.49-.12-.97-.19-2-.19-3.07 0-7.87 3.43-16.31 9.51-23.19 3.04-3.49 6.9-6.4 11.58-8.72 4.67-2.29 9.09-3.55 13.24-3.8.12 1.13.14 2.25.14 3.34z"/>
                </svg>
                {/* Progress bar */}
                <div className="w-[200px] h-[4px] bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-100"
                        style={{ width: bootProgress + '%' }}/>
                </div>
            </div>
        );
    }

    return (
        <>
            <Desktop />
            <LockScreen />
        </>
    );
};

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
