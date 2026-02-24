// macOS Sonoma App Icons - High Fidelity
const MacIcons = {
    Finder: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="fi1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6ee7ff"/><stop offset="100%" stopColor="#1b8de6"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#fi1)"/>
            <path d="M38 28h44c6 0 10 4 10 10v52c0 6-4 10-10 10H38c-6 0-10-4-10-10V38c0-6 4-10 10-10z" fill="#fff" opacity="0.95"/>
            <ellipse cx="48" cy="52" rx="5" ry="7" fill="#333"/><ellipse cx="72" cy="52" rx="5" ry="7" fill="#333"/>
            <line x1="60" y1="58" x2="60" y2="74" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
            <path d="M44 74 Q60 88 76 74" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
            <path d="M42 42 Q48 38 54 42" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M66 42 Q72 38 78 42" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    Safari: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="sa1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#58c6f8"/><stop offset="50%" stopColor="#2196F3"/><stop offset="100%" stopColor="#0d47a1"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#sa1)"/>
            <circle cx="60" cy="60" r="38" fill="none" stroke="white" strokeWidth="3"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
                const rad=(a-90)*Math.PI/180;
                return <line key={a} x1={60+Math.cos(rad)*35} y1={60+Math.sin(rad)*35} x2={60+Math.cos(rad)*38} y2={60+Math.sin(rad)*38} stroke="white" strokeWidth={a%90===0?2:1} opacity="0.8"/>;
            })}
            <text x="60" y="25" textAnchor="middle" fontSize="6" fill="white" fontWeight="700" fontFamily="Inter">N</text>
            <text x="60" y="101" textAnchor="middle" fontSize="6" fill="white" fontWeight="700" fontFamily="Inter">S</text>
            <text x="99" y="63" textAnchor="middle" fontSize="6" fill="white" fontWeight="700" fontFamily="Inter">E</text>
            <text x="21" y="63" textAnchor="middle" fontSize="6" fill="white" fontWeight="700" fontFamily="Inter">W</text>
            <polygon points="60,30 66,56 60,60 54,56" fill="#FF3B30"/>
            <polygon points="60,90 54,64 60,60 66,64" fill="white" opacity="0.9"/>
            <circle cx="60" cy="60" r="3" fill="white"/>
        </svg>
    ),
    Messages: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="ms1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5ef06c"/><stop offset="100%" stopColor="#25b835"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#ms1)"/>
            <path d="M30 44 C30 34 42 26 60 26 C78 26 90 34 90 44 L90 62 C90 72 78 80 60 80 C54 80 48 78.5 43 76 L28 86 L33 74 C30 70 28 66 28 62 Z" fill="white" opacity="0.95"/>
        </svg>
    ),
    Mail: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="ma1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5AC8FA"/><stop offset="100%" stopColor="#007AFF"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#ma1)"/>
            <rect x="22" y="38" width="76" height="50" rx="5" fill="white"/>
            <polyline points="22,43 60,68 98,43" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinejoin="round"/>
        </svg>
    ),
    Maps: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="mp1" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stopColor="#6fdb6f"/><stop offset="50%" stopColor="#4CAF50"/><stop offset="100%" stopColor="#2E7D32"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#mp1)"/>
            <path d="M30 22 L52 30 L52 100 L30 92 Z" fill="#81D4FA" opacity="0.6"/>
            <path d="M52 30 L78 22 L78 92 L52 100 Z" fill="#E8F5E9" opacity="0.5"/>
            <path d="M78 22 L100 26 L100 96 L78 92 Z" fill="#FFE082" opacity="0.5"/>
            <path d="M35 55 Q50 50 65 60 Q80 70 95 55" fill="none" stroke="white" strokeWidth="2" opacity="0.7"/>
            <path d="M68 40 C68 33 74 28 80 28 C86 28 92 33 92 40 C92 52 80 62 80 62 C80 62 68 52 68 40 Z" fill="#F44336"/>
            <circle cx="80" cy="39" r="5" fill="white"/>
        </svg>
    ),
    Photos: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="#fff"/>
            {[0,45,90,135,180,225,270,315].map((a,i) => {
                const rad=a*Math.PI/180; const cx=60+Math.cos(rad)*18; const cy=60+Math.sin(rad)*18;
                const colors=['#FF3B30','#FF9500','#FFCC00','#34C759','#5AC8FA','#007AFF','#5856D6','#AF52DE'];
                return <ellipse key={a} cx={cx} cy={cy} rx="14" ry="8" fill={colors[i]} opacity="0.85" transform={"rotate("+a+","+cx+","+cy+")"}/>;
            })}
            <circle cx="60" cy="60" r="8" fill="white"/>
        </svg>
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
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="#1C1C1E"/>
            <rect x="18" y="16" width="84" height="24" rx="6" fill="#505050"/>
            <text x="96" y="34" textAnchor="end" fontSize="16" fill="white" fontWeight="300" fontFamily="Inter">0</text>
            <circle cx="32" cy="52" r="9" fill="#A5A5A5"/><text x="32" y="55" textAnchor="middle" fontSize="7" fill="#333">AC</text>
            <circle cx="55" cy="52" r="9" fill="#A5A5A5"/><text x="55" y="55.5" textAnchor="middle" fontSize="9" fill="#333">±</text>
            <circle cx="78" cy="52" r="9" fill="#A5A5A5"/><text x="78" y="55" textAnchor="middle" fontSize="8" fill="#333">%</text>
            <circle cx="98" cy="52" r="9" fill="#FF9500"/><text x="98" y="56" textAnchor="middle" fontSize="10" fill="white">÷</text>
            <circle cx="32" cy="74" r="9" fill="#333"/><text x="32" y="77.5" textAnchor="middle" fontSize="9" fill="white">7</text>
            <circle cx="55" cy="74" r="9" fill="#333"/><text x="55" y="77.5" textAnchor="middle" fontSize="9" fill="white">8</text>
            <circle cx="78" cy="74" r="9" fill="#333"/><text x="78" y="77.5" textAnchor="middle" fontSize="9" fill="white">9</text>
            <circle cx="98" cy="74" r="9" fill="#FF9500"/><text x="98" y="78" textAnchor="middle" fontSize="10" fill="white">×</text>
            <circle cx="32" cy="96" r="9" fill="#333"/><text x="32" y="99.5" textAnchor="middle" fontSize="9" fill="white">4</text>
            <circle cx="55" cy="96" r="9" fill="#333"/><text x="55" y="99.5" textAnchor="middle" fontSize="9" fill="white">5</text>
            <circle cx="78" cy="96" r="9" fill="#333"/><text x="78" y="99.5" textAnchor="middle" fontSize="9" fill="white">6</text>
            <circle cx="98" cy="96" r="9" fill="#FF9500"/><text x="98" y="99.5" textAnchor="middle" fontSize="10" fill="white">−</text>
        </svg>
    ),
    Terminal: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="#000"/>
            <rect x="8" y="8" width="104" height="104" rx="22" fill="#1C1C1E"/>
            <circle cx="22" cy="18" r="3" fill="#FF5F57"/><circle cx="32" cy="18" r="3" fill="#FFBD2E"/><circle cx="42" cy="18" r="3" fill="#28C840"/>
            <path d="M28 50 L42 60 L28 70" fill="none" stroke="#28CD41" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="48" y1="70" x2="78" y2="70" stroke="#28CD41" strokeWidth="3" strokeLinecap="round"/>
            <rect x="82" y="64" width="3" height="12" fill="#28CD41" opacity="0.7"/>
        </svg>
    ),
    Settings: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="se1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8E8E93"/><stop offset="100%" stopColor="#636366"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#se1)"/>
            <circle cx="60" cy="60" r="20" fill="none" stroke="white" strokeWidth="8"/>
            <circle cx="60" cy="60" r="10" fill="white"/>
            {[0,45,90,135,180,225,270,315].map(a => {
                const rad=a*Math.PI/180;
                return <circle key={a} cx={60+Math.cos(rad)*28} cy={60+Math.sin(rad)*28} r="6" fill="white"/>;
            })}
        </svg>
    ),
    Launchpad: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="lp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3A3A3C"/><stop offset="100%" stopColor="#1C1C1E"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#lp1)"/>
            {[[36,36,'#FF3B30'],[56,36,'#FF9500'],[76,36,'#FFCC00'],[96,36,'#34C759'],
              [36,56,'#5AC8FA'],[56,56,'#007AFF'],[76,56,'#5856D6'],[96,56,'#AF52DE'],
              [36,76,'#FF2D55'],[56,76,'#00C7BE'],[76,76,'#FF9F0A'],[96,76,'#64D2FF'],
              [36,96,'#30D158'],[56,96,'#BF5AF2'],[76,96,'#FFD60A'],[96,96,'#AC8E68']
            ].map(([x,y,c],i) => <rect key={i} x={x-7} y={y-7} width="14" height="14" rx="4" fill={c}/>)}
        </svg>
    ),
    Calendar: ({ size = 54 }) => {
        const d = new Date().getDate();
        const wd = ['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date().getDay()];
        return (
            <svg viewBox="0 0 120 120" width={size} height={size}>
                <rect x="2" y="2" width="116" height="116" rx="26" fill="white"/>
                <rect x="2" y="2" width="116" height="32" rx="26" ry="16" fill="#FF3B30"/>
                <text x="60" y="26" textAnchor="middle" fontSize="11" fill="white" fontWeight="800" fontFamily="Inter">{wd}</text>
                <text x="60" y="86" textAnchor="middle" fontSize="52" fill="#1d1d1f" fontWeight="200" fontFamily="Inter">{d}</text>
            </svg>
        );
    },
    TextEdit: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="te1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0f0f0"/><stop offset="100%" stopColor="#d0d0d0"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#te1)"/>
            <rect x="18" y="18" width="84" height="84" rx="4" fill="white" stroke="#ccc" strokeWidth="1"/>
            <line x1="26" y1="34" x2="94" y2="34" stroke="#007AFF" strokeWidth="1"/>
            <line x1="26" y1="46" x2="88" y2="46" stroke="#ddd" strokeWidth="0.7"/>
            <line x1="26" y1="58" x2="82" y2="58" stroke="#ddd" strokeWidth="0.7"/>
            <line x1="26" y1="70" x2="94" y2="70" stroke="#ddd" strokeWidth="0.7"/>
            <path d="M88 80 L98 70 L104 76 L94 86 Z" fill="#FFD60A" stroke="#E5A100" strokeWidth="1.5"/>
        </svg>
    ),
    Music: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="mu1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fc354c"/><stop offset="50%" stopColor="#e8135a"/><stop offset="100%" stopColor="#FF2D55"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#mu1)"/>
            <ellipse cx="44" cy="80" rx="12" ry="9" fill="white" opacity="0.9" transform="rotate(-15,44,80)"/>
            <ellipse cx="82" cy="72" rx="12" ry="9" fill="white" opacity="0.9" transform="rotate(-15,82,72)"/>
            <rect x="54" y="28" width="3.5" height="52" fill="white" opacity="0.9" rx="1.5"/>
            <rect x="92" y="22" width="3.5" height="50" fill="white" opacity="0.9" rx="1.5"/>
            <path d="M54 28 L95.5 22 L95.5 36 L54 42 Z" fill="white" opacity="0.9"/>
        </svg>
    ),
    AppStore: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="as1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2997FF"/><stop offset="100%" stopColor="#0070E0"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#as1)"/>
            <path d="M60 24 L38 90" stroke="white" strokeWidth="7" strokeLinecap="round"/>
            <path d="M60 24 L82 90" stroke="white" strokeWidth="7" strokeLinecap="round"/>
            <line x1="42" y1="72" x2="78" y2="72" stroke="white" strokeWidth="7" strokeLinecap="round"/>
            <line x1="28" y1="72" x2="42" y2="72" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            <line x1="78" y1="72" x2="92" y2="72" stroke="white" strokeWidth="5" strokeLinecap="round"/>
        </svg>
    ),
    Trash: ({ size = 54 }) => (
        <svg viewBox="0 0 120 120" width={size} height={size}>
            <defs><linearGradient id="tr1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#98989d"/><stop offset="100%" stopColor="#636366"/></linearGradient></defs>
            <rect x="2" y="2" width="116" height="116" rx="26" fill="url(#tr1)" opacity="0.4"/>
            <path d="M36 42 L40 96 C40 100 44 102 48 102 L72 102 C76 102 80 100 80 96 L84 42" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
            <rect x="30" y="34" width="60" height="8" rx="3" fill="none" stroke="white" strokeWidth="3"/>
            <path d="M48 34 L48 28 C48 24 52 22 56 22 L64 22 C68 22 72 24 72 28 L72 34" fill="none" stroke="white" strokeWidth="2.5"/>
            <line x1="50" y1="52" x2="50" y2="92" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
            <line x1="60" y1="52" x2="60" y2="92" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
            <line x1="70" y1="52" x2="70" y2="92" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
        </svg>
    ),
};
