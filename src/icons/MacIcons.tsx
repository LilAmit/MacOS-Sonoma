// macOS App Icons - using real icon images
const MacIcons = {
    Finder: ({ size = 54 }) => (
        <img src="app icons/fidnericon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Finder"/>
    ),
    Safari: ({ size = 54 }) => (
        <img src="app icons/safariicon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Safari"/>
    ),
    Messages: ({ size = 54 }) => (
        <img src="app icons/messagesicon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Messages"/>
    ),
    Mail: ({ size = 54 }) => (
        <img src="app icons/mailicon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Mail"/>
    ),
    Maps: ({ size = 54 }) => (
        <img src="app icons/mapsicon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Maps"/>
    ),
    Photos: ({ size = 54 }) => (
        <img src="app icons/photosicon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Photos"/>
    ),
    Notes: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="no1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFE066"/><stop offset="100%" stopColor="#FFD60A"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#no1)"/>
            <rect x="26" y="14" width="68" height="92" rx="6" fill="white"/>
            <line x1="34" y1="32" x2="86" y2="32" stroke="#E5E5EA" strokeWidth="1"/><line x1="34" y1="44" x2="86" y2="44" stroke="#E5E5EA" strokeWidth="1"/>
            <line x1="34" y1="56" x2="86" y2="56" stroke="#E5E5EA" strokeWidth="1"/><line x1="34" y1="68" x2="86" y2="68" stroke="#E5E5EA" strokeWidth="1"/>
            <line x1="34" y1="80" x2="70" y2="80" stroke="#E5E5EA" strokeWidth="1"/>
            <text x="34" y="28" fontSize="8" fill="#1d1d1f" fontWeight="700" fontFamily="Inter">Notes</text>
        </svg>
    ),
    Calculator: ({ size = 54 }) => (
        <img src="app icons/calculatoricon.jfif" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Calculator"/>
    ),
    Terminal: ({ size = 54 }) => (
        <img src="app icons/terminalicon.jfif" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Terminal"/>
    ),
    Settings: ({ size = 54 }) => (
        <img src="app icons/settingsicon.jpg" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Settings"/>
    ),
    Launchpad: ({ size = 54 }) => (
        <img src="app icons/launchpadicon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Launchpad"/>
    ),
    Calendar: ({ size = 54 }) => (
        <img src="app icons/calendericon.jfif" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Calendar"/>
    ),
    Word: ({ size = 54 }) => (
        <img src="app icons/wordicon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Word"/>
    ),
    Music: ({ size = 54 }) => (
        <img src="app icons/musicicon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Music"/>
    ),
    AppStore: ({ size = 54 }) => (
        <img src="app icons/appstoreicon.png" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="App Store"/>
    ),
    Snake: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="#34C759"/>
            <rect x="20" y="50" width="14" height="14" rx="3" fill="white"/>
            <rect x="34" y="50" width="14" height="14" rx="3" fill="white" opacity="0.9"/>
            <rect x="48" y="50" width="14" height="14" rx="3" fill="white" opacity="0.8"/>
            <rect x="62" y="50" width="14" height="14" rx="3" fill="white" opacity="0.7"/>
            <rect x="62" y="64" width="14" height="14" rx="3" fill="white" opacity="0.6"/>
            <rect x="62" y="78" width="14" height="14" rx="3" fill="white" opacity="0.5"/>
            <circle cx="90" cy="35" r="7" fill="#FF3B30"/>
        </svg>
    ),
    Tetris: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="#00BCD4"/>
            <rect x="30" y="25" width="18" height="18" rx="2" fill="#FFD60A"/>
            <rect x="48" y="25" width="18" height="18" rx="2" fill="#FFD60A"/>
            <rect x="30" y="43" width="18" height="18" rx="2" fill="#FFD60A"/>
            <rect x="48" y="43" width="18" height="18" rx="2" fill="#FFD60A"/>
            <rect x="54" y="61" width="18" height="18" rx="2" fill="#AF52DE"/>
            <rect x="36" y="61" width="18" height="18" rx="2" fill="#AF52DE"/>
            <rect x="72" y="61" width="18" height="18" rx="2" fill="#AF52DE"/>
            <rect x="54" y="79" width="18" height="18" rx="2" fill="#AF52DE"/>
            <rect x="66" y="25" width="18" height="18" rx="2" fill="#FF3B30"/>
            <rect x="66" y="43" width="18" height="18" rx="2" fill="#FF3B30"/>
            <rect x="84" y="43" width="18" height="18" rx="2" fill="#FF3B30"/>
        </svg>
    ),
    Game2048: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="#EDA028"/>
            <rect x="18" y="35" width="26" height="26" rx="5" fill="white" opacity="0.9"/>
            <rect x="47" y="35" width="26" height="26" rx="5" fill="white" opacity="0.7"/>
            <rect x="76" y="35" width="26" height="26" rx="5" fill="white" opacity="0.5"/>
            <rect x="18" y="64" width="26" height="26" rx="5" fill="white" opacity="0.6"/>
            <rect x="47" y="64" width="26" height="26" rx="5" fill="white" opacity="0.8"/>
            <rect x="76" y="64" width="26" height="26" rx="5" fill="white"/>
            <text x="60" y="30" textAnchor="middle" fontSize="16" fill="white" fontWeight="800" fontFamily="Inter">2048</text>
        </svg>
    ),
    VSCode: ({ size = 54 }) => (
        <img src="app icons/vscodeicon.jfif" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="VS Code"/>
    ),
    Paint: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="#FF3B30"/>
            <circle cx="40" cy="45" r="8" fill="#FFD60A"/>
            <circle cx="60" cy="35" r="8" fill="#34C759"/>
            <circle cx="80" cy="45" r="8" fill="#007AFF"/>
            <circle cx="50" cy="62" r="8" fill="#AF52DE"/>
            <circle cx="70" cy="62" r="8" fill="#FF9500"/>
            <path d="M55 75L50 100Q60 105 65 100L60 75Z" fill="white" opacity="0.9"/>
            <rect x="53" y="70" width="14" height="10" rx="2" fill="#8B5E3C"/>
        </svg>
    ),
    AboutDev: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs>
                <linearGradient id="abd1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366F1"/>
                    <stop offset="100%" stopColor="#8B5CF6"/>
                </linearGradient>
            </defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#abd1)"/>
            <circle cx="60" cy="42" r="16" fill="white" opacity="0.9"/>
            <ellipse cx="60" cy="82" rx="26" ry="18" fill="white" opacity="0.9"/>
            <text x="60" y="108" textAnchor="middle" fontSize="9" fill="white" opacity="0.7" fontFamily="Inter" fontWeight="600">DEV</text>
        </svg>
    ),
    Trash: ({ size = 54 }) => (
        <img src="app icons/trashicon.jpg" width={size} height={size} style={{ borderRadius: size * 0.22, objectFit: 'cover' }} draggable="false" alt="Trash"/>
    ),
};

window.MacIcons = MacIcons;
