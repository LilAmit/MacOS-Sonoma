// System Settings App - Fully Functional
const SettingsApp = () => {
    const [activeSection, setActiveSection] = React.useState('apple-id');
    const wifiOn = useStore(s => s.wifiOn);
    const bluetoothOn = useStore(s => s.bluetoothOn);
    const volume = useStore(s => s.volume);
    const brightness = useStore(s => s.brightness);
    const focusOn = useStore(s => s.focusOn);
    const darkMode = useStore(s => s.darkMode);
    const wallpaperIndex = useStore(s => s.wallpaperIndex);
    const accentColor = useStore(s => s.accentColor);

    // Keys that sync to global store (affect other components)
    const globalKeys = {
        dockSize: 'dockSize', dockMagnification: 'dockMagnification',
        dockAutoHide: 'dockAutoHide', dockPosition: 'dockPosition',
        showRecents: 'showRecents', accentColor: 'accentColor',
        nightShift: 'nightShift', reduceMotion: 'reduceMotion',
        increaseContrast: 'increaseContrast', reduceTransparency: 'reduceTransparency',
        largerText: 'largerText', showPercentage: 'showBatteryPercentage',
        notifSounds: 'notifSounds', notifLockScreen: 'notifLockScreen',
    };

    // Local toggles persisted to localStorage
    const [local, setLocal] = React.useState(() => {
        const saved = localStorage.getItem('macos_settings_local');
        const state = MacStore.getState();
        const defaults = {
            airDrop: true, handoff: true, autoUpdates: true, locationServices: true,
            analytics: false, siri: true, trueTone: true, nightShift: state.nightShift || false,
            notifSounds: state.notifSounds !== undefined ? state.notifSounds : true,
            notifBadges: true, notifBanners: true,
            notifLockScreen: state.notifLockScreen !== undefined ? state.notifLockScreen : true,
            alertSound: 'Glass', outputDevice: 'MacBook Pro Speakers', inputDevice: 'MacBook Pro Microphone',
            inputVolume: 70, reduceMotion: state.reduceMotion || false,
            increaseContrast: state.increaseContrast || false,
            reduceTransparency: state.reduceTransparency || false,
            largerText: state.largerText || false,
            dockSize: state.dockSize || 48, dockMagnification: state.dockMagnification !== false,
            dockAutoHide: state.dockAutoHide || false, dockPosition: state.dockPosition || 'bottom',
            showRecents: state.showRecents !== false, minimizeEffect: 'Genie',
            resolution: 'Default', nightShiftSchedule: false,
            lowPowerMode: false, optimizedCharging: true,
            showPercentage: state.showBatteryPercentage !== false,
            keyRepeatSpeed: 6, delayUntilRepeat: 3, capsLockAction: 'Caps Lock',
            trackingSpeed: 5, tapToClick: true, naturalScrolling: true, forceClick: true,
            accentColor: state.accentColor || '#007AFF', highlightColor: state.accentColor || '#007AFF',
        };
        if (saved) try { return { ...defaults, ...JSON.parse(saved) }; } catch(e) {}
        return defaults;
    });

    const setLocalKey = (key, value) => {
        setLocal(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem('macos_settings_local', JSON.stringify(next));
            return next;
        });
        // Sync to global store if this key affects other components
        if (globalKeys[key]) {
            MacStore.setState({ [globalKeys[key]]: value });
        }
    };

    const toggleLocal = (key) => setLocalKey(key, !local[key]);

    const Toggle = ({ checked, onChange }) => (
        <div
            className={`w-[38px] h-[22px] rounded-full relative cursor-default transition-colors ${checked ? '' : 'bg-gray-300'}`}
            style={checked ? { background: '#34C759' } : undefined}
            onClick={onChange}
        >
            <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] shadow-md transition-all ${checked ? 'left-[18px]' : 'left-[2px]'}`}/>
        </div>
    );

    const Slider = ({ value, onChange, min = 0, max = 100 }) => (
        <div className="flex items-center gap-3 flex-1">
            <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: accentColor }}/>
            <span className="text-[12px] text-gray-400 w-8 text-right">{value}%</span>
        </div>
    );

    const sections = [
        { id: 'apple-id', label: 'Apple ID', isProfile: true },
        { sep: true },
        { id: 'wifi', label: 'Wi-Fi', icon: '📶', color: '#007AFF' },
        { id: 'bluetooth', label: 'Bluetooth', icon: '🔵', color: '#007AFF' },
        { id: 'network', label: 'Network', icon: '🌐', color: '#007AFF' },
        { sep: true },
        { id: 'notifications', label: 'Notifications', icon: '🔔', color: '#FF3B30' },
        { id: 'sound', label: 'Sound', icon: '🔊', color: '#FF3B30' },
        { id: 'focus', label: 'Focus', icon: '🌙', color: '#5856D6' },
        { sep: true },
        { id: 'general', label: 'General', icon: '⚙️', color: '#8E8E93' },
        { id: 'appearance', label: 'Appearance', icon: '🎨', color: '#34C759' },
        { id: 'accessibility', label: 'Accessibility', icon: '♿', color: '#007AFF' },
        { sep: true },
        { id: 'privacy', label: 'Privacy & Security', icon: '🔒', color: '#FF9500' },
        { id: 'desktop', label: 'Desktop & Dock', icon: '🖥️', color: '#007AFF' },
        { id: 'displays', label: 'Displays', icon: '💻', color: '#5856D6' },
        { id: 'wallpaper', label: 'Wallpaper', icon: '🖼️', color: '#34C759' },
        { id: 'battery', label: 'Battery', icon: '🔋', color: '#34C759' },
        { id: 'keyboard', label: 'Keyboard', icon: '⌨️', color: '#8E8E93' },
        { id: 'trackpad', label: 'Trackpad', icon: '🖱️', color: '#8E8E93' },
    ];

    const renderContent = () => {
        switch(activeSection) {
            case 'apple-id':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Apple ID</h2>
                        <SettingsGroup>
                            <SettingsRow label="Name, Phone Numbers, Email" hasArrow />
                            <SettingsRow label="Password & Security" hasArrow />
                            <SettingsRow label="iCloud" detail="5 GB of 5 GB used" hasArrow />
                            <SettingsRow label="Media & Purchases" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup>
                            <SettingsRow label="Family Sharing" detail="Set Up" hasArrow />
                        </SettingsGroup>
                    </div>
                );

            case 'wifi':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Wi-Fi</h2>
                        <SettingsGroup>
                            <SettingsRow label="Wi-Fi" right={<Toggle checked={wifiOn} onChange={() => MacStore.setState(s => ({ wifiOn: !s.wifiOn }))}/>} />
                        </SettingsGroup>
                        {wifiOn && (<>
                            <SettingsGroup title="Current Network">
                                <SettingsRow label="Home Wi-Fi" detail="Connected" hasArrow />
                            </SettingsGroup>
                            <SettingsGroup title="Known Networks">
                                <SettingsRow label="Office-5G" hasArrow />
                                <SettingsRow label="CoffeeShop_Free" hasArrow />
                            </SettingsGroup>
                            <SettingsGroup title="Other Networks">
                                <SettingsRow label="Guest-2.4G" hasArrow />
                                <SettingsRow label="NETGEAR-5G" hasArrow />
                            </SettingsGroup>
                            <SettingsGroup>
                                <SettingsRow label="Ask to join networks" right={<Toggle checked={true} onChange={() => {}}/>} />
                            </SettingsGroup>
                        </>)}
                    </div>
                );

            case 'bluetooth':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Bluetooth</h2>
                        <SettingsGroup>
                            <SettingsRow label="Bluetooth" right={<Toggle checked={bluetoothOn} onChange={() => MacStore.setState(s => ({ bluetoothOn: !s.bluetoothOn }))}/>} />
                        </SettingsGroup>
                        {bluetoothOn && (<>
                            <SettingsGroup title="My Devices">
                                <SettingsRow label="AirPods Pro" detail="Connected" hasArrow />
                                <SettingsRow label="Magic Mouse" detail="Connected" hasArrow />
                                <SettingsRow label="Magic Keyboard" detail="Not Connected" hasArrow />
                            </SettingsGroup>
                            <SettingsGroup title="Nearby Devices">
                                <SettingsRow label="JBL Speaker" detail="Speaker" hasArrow />
                                <SettingsRow label="Sony WH-1000XM5" detail="Headphones" hasArrow />
                            </SettingsGroup>
                        </>)}
                    </div>
                );

            case 'network':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Network</h2>
                        <SettingsGroup>
                            <SettingsRow label="Wi-Fi" detail={wifiOn ? 'Connected' : 'Off'} hasArrow />
                            <SettingsRow label="Ethernet" detail="Not Connected" hasArrow />
                            <SettingsRow label="Thunderbolt Bridge" detail="Not Connected" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup title="VPN">
                            <SettingsRow label="Add VPN Configuration..." hasArrow />
                        </SettingsGroup>
                        <SettingsGroup>
                            <SettingsRow label="Firewall" detail="Active" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup title="Other Services">
                            <SettingsRow label="DNS" detail="Automatic" hasArrow />
                            <SettingsRow label="WINS" hasArrow />
                            <SettingsRow label="Proxies" detail="Off" hasArrow />
                        </SettingsGroup>
                    </div>
                );

            case 'notifications':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Notifications</h2>
                        <SettingsGroup>
                            <SettingsRow label="Show previews" detail="When Unlocked" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup title="Notification Style">
                            <SettingsRow label="Play sound for notifications" right={<Toggle checked={local.notifSounds} onChange={() => toggleLocal('notifSounds')}/>} />
                            <SettingsRow label="Show notifications on lock screen" right={<Toggle checked={local.notifLockScreen} onChange={() => toggleLocal('notifLockScreen')}/>} />
                            <SettingsRow label="Allow notifications when mirroring" right={<Toggle checked={false} onChange={() => {}}/>} />
                        </SettingsGroup>
                        <SettingsGroup title="Application Notifications">
                            <SettingsRow label="Calendar" detail="Banners" hasArrow />
                            <SettingsRow label="FaceTime" detail="Alerts" hasArrow />
                            <SettingsRow label="Mail" detail="Banners, Badges" hasArrow />
                            <SettingsRow label="Messages" detail="Alerts, Badges, Sounds" hasArrow />
                            <SettingsRow label="Safari" detail="Banners" hasArrow />
                        </SettingsGroup>
                    </div>
                );

            case 'sound':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Sound</h2>
                        <SettingsGroup title="Output">
                            <SettingsRow label="Output Device" detail={local.outputDevice} />
                            <div className="px-4 py-3 border-b border-black/[0.04]">
                                <div className="flex items-center gap-3">
                                    <span className="text-[16px]">🔈</span>
                                    <Slider value={volume} onChange={v => MacStore.setState({ volume: v })}/>
                                    <span className="text-[16px]">🔊</span>
                                </div>
                            </div>
                        </SettingsGroup>
                        <SettingsGroup title="Input">
                            <SettingsRow label="Input Device" detail={local.inputDevice} />
                            <div className="px-4 py-3 border-b border-black/[0.04]">
                                <div className="flex items-center gap-3">
                                    <span className="text-[13px] text-gray-500">Input volume</span>
                                    <Slider value={local.inputVolume} onChange={v => setLocalKey('inputVolume', v)}/>
                                </div>
                            </div>
                        </SettingsGroup>
                        <SettingsGroup title="Sound Effects">
                            <div className="px-4 py-2">
                                <div className="text-[13px] mb-2">Alert sound</div>
                                <div className="grid grid-cols-3 gap-1">
                                    {['Boop','Breeze','Bubble','Crystal','Funky','Glass','Hero','Jump','Mezzo','Pebble','Pluck','Sonar'].map(s => (
                                        <div key={s} className={`px-2 py-1 rounded text-[12px] cursor-default ${local.alertSound === s ? 'text-white' : 'hover:bg-gray-100'}`}
                                            style={local.alertSound === s ? { background: accentColor } : undefined}
                                            onClick={() => setLocalKey('alertSound', s)}>{s}</div>
                                    ))}
                                </div>
                            </div>
                            <SettingsRow label="Play sound on startup" right={<Toggle checked={true} onChange={() => {}}/>} />
                            <SettingsRow label="Play user interface sound effects" right={<Toggle checked={local.notifSounds} onChange={() => toggleLocal('notifSounds')}/>} />
                        </SettingsGroup>
                    </div>
                );

            case 'focus':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Focus</h2>
                        <SettingsGroup>
                            <SettingsRow label="Do Not Disturb" right={<Toggle checked={focusOn} onChange={() => MacStore.setState(s => ({ focusOn: !s.focusOn }))}/>} />
                        </SettingsGroup>
                        {focusOn && (
                            <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[16px]">🌙</span>
                                    <span className="text-[13px] font-semibold text-purple-700">Focus is On</span>
                                </div>
                                <span className="text-[12px] text-purple-500">Notifications are silenced. Only allowed contacts can reach you.</span>
                            </div>
                        )}
                        <SettingsGroup title="Focus Modes">
                            <SettingsRow label="🌙  Do Not Disturb" detail={focusOn ? 'On' : 'Off'} hasArrow />
                            <SettingsRow label="💼  Work" detail="Off" hasArrow />
                            <SettingsRow label="🎮  Gaming" detail="Off" hasArrow />
                            <SettingsRow label="😴  Sleep" detail="Off" hasArrow />
                            <SettingsRow label="🚗  Driving" detail="Off" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup>
                            <SettingsRow label="Share across devices" right={<Toggle checked={true} onChange={() => {}}/>} />
                            <SettingsRow label="Focus Status" detail="On" hasArrow />
                        </SettingsGroup>
                    </div>
                );

            case 'general':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">General</h2>
                        <SettingsGroup>
                            <SettingsRow label="About" detail="macOS Sonoma 14.3.1" hasArrow />
                            <SettingsRow label="Software Update" detail="Up to date" hasArrow />
                            <SettingsRow label="Storage" detail="245 GB of 460 GB used" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup>
                            <SettingsRow label="AirDrop" right={<Toggle checked={local.airDrop} onChange={() => toggleLocal('airDrop')}/>} />
                            <SettingsRow label="Handoff" right={<Toggle checked={local.handoff} onChange={() => toggleLocal('handoff')}/>} />
                        </SettingsGroup>
                        <SettingsGroup>
                            <SettingsRow label="Login Items & Extensions" hasArrow />
                            <SettingsRow label="Language & Region" detail="English (US)" hasArrow />
                            <SettingsRow label="Date & Time" detail={new Date().toLocaleDateString()} hasArrow />
                            <SettingsRow label="Sharing" hasArrow />
                            <SettingsRow label="Time Machine" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup>
                            <SettingsRow label="Automatic Updates" right={<Toggle checked={local.autoUpdates} onChange={() => toggleLocal('autoUpdates')}/>} />
                        </SettingsGroup>
                    </div>
                );

            case 'appearance':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Appearance</h2>
                        <div className="flex gap-4 mb-6">
                            {['Light', 'Dark', 'Auto'].map(mode => {
                                const isSelected = (mode === 'Light' && !darkMode) || (mode === 'Dark' && darkMode);
                                return (
                                <div key={mode} className="flex flex-col items-center gap-2 cursor-default"
                                    onClick={() => {
                                        if (mode === 'Dark' && !darkMode) MacStore.setState({ darkMode: true });
                                        else if (mode === 'Light' && darkMode) MacStore.setState({ darkMode: false });
                                    }}>
                                    <div className={`w-20 h-14 rounded-lg border-2 ${isSelected ? '' : 'border-gray-300'}`}
                                        style={{ background: mode === 'Dark' ? '#1c1c1e' : mode === 'Auto' ? 'linear-gradient(90deg, white 50%, #1c1c1e 50%)' : 'white',
                                            borderColor: isSelected ? accentColor : undefined }}/>
                                    <span className="text-[12px]">{mode}</span>
                                </div>
                                );
                            })}
                        </div>
                        <SettingsGroup title="Accent Color">
                            <div className="flex gap-3 px-4 py-3">
                                {[
                                    { c: '#007AFF', n: 'Blue' }, { c: '#5856D6', n: 'Purple' }, { c: '#FF2D55', n: 'Pink' },
                                    { c: '#FF9500', n: 'Orange' }, { c: '#FFCC00', n: 'Yellow' }, { c: '#34C759', n: 'Green' },
                                    { c: '#8E8E93', n: 'Graphite' }, { c: '#FF3B30', n: 'Red' },
                                ].map(item => (
                                    <div key={item.c} className="flex flex-col items-center gap-1 cursor-default" onClick={() => setLocalKey('accentColor', item.c)}>
                                        <div className={`w-6 h-6 rounded-full border-2 ${accentColor === item.c ? 'border-gray-800 scale-110' : 'border-black/10'}`}
                                            style={{ background: item.c }}/>
                                        <span className="text-[9px] text-gray-400">{item.n}</span>
                                    </div>
                                ))}
                            </div>
                        </SettingsGroup>
                        <SettingsGroup title="Sidebar Icon Size">
                            <div className="flex gap-4 px-4 py-3">
                                {['Small', 'Medium', 'Large'].map(s => (
                                    <label key={s} className="flex items-center gap-2 cursor-default text-[13px]">
                                        <input type="radio" name="sidebarSize" defaultChecked={s === 'Medium'} className="accent-current"/>
                                        {s}
                                    </label>
                                ))}
                            </div>
                        </SettingsGroup>
                        <SettingsGroup>
                            <SettingsRow label="Allow wallpaper tinting in windows" right={<Toggle checked={true} onChange={() => {}}/>} />
                        </SettingsGroup>
                    </div>
                );

            case 'accessibility':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Accessibility</h2>
                        <SettingsGroup title="Vision">
                            <SettingsRow label="VoiceOver" detail="Off" hasArrow />
                            <SettingsRow label="Zoom" hasArrow />
                            <SettingsRow label="Increase Contrast" right={<Toggle checked={local.increaseContrast} onChange={() => toggleLocal('increaseContrast')}/>} />
                            <SettingsRow label="Reduce Transparency" right={<Toggle checked={local.reduceTransparency} onChange={() => toggleLocal('reduceTransparency')}/>} />
                            <SettingsRow label="Larger Text" right={<Toggle checked={local.largerText} onChange={() => toggleLocal('largerText')}/>} />
                        </SettingsGroup>
                        <SettingsGroup title="Motor">
                            <SettingsRow label="Voice Control" detail="Off" hasArrow />
                            <SettingsRow label="Keyboard" hasArrow />
                            <SettingsRow label="Pointer Control" hasArrow />
                            <SettingsRow label="Switch Control" detail="Off" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup title="General">
                            <SettingsRow label="Reduce Motion" right={<Toggle checked={local.reduceMotion} onChange={() => toggleLocal('reduceMotion')}/>} />
                            <SettingsRow label="Siri" right={<Toggle checked={local.siri} onChange={() => toggleLocal('siri')}/>} />
                        </SettingsGroup>
                    </div>
                );

            case 'privacy':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Privacy & Security</h2>
                        <SettingsGroup title="Privacy">
                            <SettingsRow label="Location Services" right={<Toggle checked={local.locationServices} onChange={() => toggleLocal('locationServices')}/>} />
                            <SettingsRow label="Contacts" hasArrow />
                            <SettingsRow label="Calendars" hasArrow />
                            <SettingsRow label="Photos" hasArrow />
                            <SettingsRow label="Camera" hasArrow />
                            <SettingsRow label="Microphone" hasArrow />
                            <SettingsRow label="Files and Folders" hasArrow />
                            <SettingsRow label="Full Disk Access" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup title="Security">
                            <SettingsRow label="FileVault" detail="On" hasArrow />
                            <SettingsRow label="Firewall" detail="Active" hasArrow />
                            <SettingsRow label="Lockdown Mode" detail="Off" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup>
                            <SettingsRow label="Analytics & Improvements" right={<Toggle checked={local.analytics} onChange={() => toggleLocal('analytics')}/>} />
                        </SettingsGroup>
                    </div>
                );

            case 'desktop':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Desktop & Dock</h2>
                        <SettingsGroup title="Dock">
                            <div className="px-4 py-3 border-b border-black/[0.04]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[13px]">Size</span>
                                    <span className="text-[12px] text-gray-400">{local.dockSize}px</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-gray-400">Small</span>
                                    <input type="range" min="32" max="80" value={local.dockSize}
                                        onChange={e => setLocalKey('dockSize', Number(e.target.value))}
                                        className="flex-1 h-1 appearance-none cursor-pointer"/>
                                    <span className="text-[11px] text-gray-400">Large</span>
                                </div>
                            </div>
                            <SettingsRow label="Magnification" right={<Toggle checked={local.dockMagnification} onChange={() => toggleLocal('dockMagnification')}/>} />
                            <div className="px-4 py-2.5 border-b border-black/[0.04]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px]">Position on screen</span>
                                    <div className="flex gap-1">
                                        {['Left', 'Bottom', 'Right'].map(pos => (
                                            <button key={pos}
                                                className={`px-3 py-1 rounded text-[12px] ${local.dockPosition === pos.toLowerCase() ? 'text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                                style={local.dockPosition === pos.toLowerCase() ? { background: accentColor } : undefined}
                                                onClick={() => setLocalKey('dockPosition', pos.toLowerCase())}>{pos}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <SettingsRow label="Automatically hide and show the Dock" right={<Toggle checked={local.dockAutoHide} onChange={() => toggleLocal('dockAutoHide')}/>} />
                            <SettingsRow label="Show recent applications in Dock" right={<Toggle checked={local.showRecents} onChange={() => toggleLocal('showRecents')}/>} />
                        </SettingsGroup>
                        <SettingsGroup title="Windows">
                            <div className="px-4 py-2.5 border-b border-black/[0.04]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px]">Minimize windows using</span>
                                    <select className="bg-gray-100 rounded px-2 py-1 text-[12px] outline-none border-0"
                                        value={local.minimizeEffect} onChange={e => setLocalKey('minimizeEffect', e.target.value)}>
                                        <option>Genie</option><option>Scale</option>
                                    </select>
                                </div>
                            </div>
                            <SettingsRow label="Double-click title bar to" detail="Zoom" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup title="Desktop">
                            <SettingsRow label="Show items on desktop" right={<Toggle checked={true} onChange={() => {}}/>} />
                        </SettingsGroup>
                    </div>
                );

            case 'displays':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Displays</h2>
                        <SettingsGroup title="Built-in Display">
                            <div className="px-4 py-3 border-b border-black/[0.04]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[13px]">Brightness</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[16px]">🔅</span>
                                    <Slider value={brightness} onChange={v => MacStore.setState({ brightness: v })}/>
                                    <span className="text-[16px]">🔆</span>
                                </div>
                            </div>
                            <SettingsRow label="True Tone" right={<Toggle checked={local.trueTone} onChange={() => toggleLocal('trueTone')}/>} />
                            <SettingsRow label="Automatically adjust brightness" right={<Toggle checked={true} onChange={() => {}}/>} />
                        </SettingsGroup>
                        <SettingsGroup title="Resolution">
                            <div className="flex gap-2 px-4 py-3">
                                {['Larger Text', 'Default', 'More Space'].map(r => (
                                    <div key={r} className={`flex-1 py-2 rounded-lg text-center text-[12px] cursor-default ${local.resolution === r ? 'text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                        style={local.resolution === r ? { background: accentColor } : undefined}
                                        onClick={() => setLocalKey('resolution', r)}>{r}</div>
                                ))}
                            </div>
                        </SettingsGroup>
                        <SettingsGroup title="Night Shift">
                            <SettingsRow label="Schedule" right={<Toggle checked={local.nightShift} onChange={() => toggleLocal('nightShift')}/>} />
                            <SettingsRow label="Night Shift" right={<Toggle checked={local.nightShiftSchedule} onChange={() => toggleLocal('nightShiftSchedule')}/>} />
                        </SettingsGroup>
                    </div>
                );

            case 'wallpaper':
                const WallpaperCard = ({ wp, i }) => {
                    const [loaded, setLoaded] = React.useState(!wp.path.startsWith('http'));
                    return (
                        <div key={i}
                            className={`cursor-default rounded-xl overflow-hidden border-2 transition-all ${wallpaperIndex === i ? 'shadow-lg' : 'border-transparent hover:border-gray-300'}`}
                            style={wallpaperIndex === i ? { borderColor: accentColor, boxShadow: '0 0 0 2px ' + accentColor + '40' } : undefined}
                            onClick={() => MacStore.setWallpaper(i)}>
                            <div className="relative bg-gray-200" style={{ minHeight: '90px' }}>
                                {!loaded && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }}/></div>}
                                <img src={wp.path} alt={wp.name} className={`w-full h-[90px] object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`} draggable="false"
                                    loading="lazy" onLoad={() => setLoaded(true)} onError={e => { e.target.style.display = 'none'; setLoaded(true); }}/>
                                {wallpaperIndex === i && (
                                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: accentColor }}>
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                    </div>
                                )}
                            </div>
                            <div className="py-1.5 px-1 bg-gray-50 text-center">
                                <span className="text-[11px] font-medium">{wp.name}</span>
                            </div>
                        </div>
                    );
                };
                const localWPs = WALLPAPERS.filter(w => !w.path.startsWith('http'));
                const onlineWPs = WALLPAPERS.filter(w => w.path.startsWith('http'));
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Wallpaper</h2>
                        <p className="text-[13px] text-gray-500 mb-4">Choose a wallpaper for your desktop and lock screen.</p>
                        <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Included</div>
                        <div className="grid grid-cols-4 gap-3 mb-5">
                            {localWPs.map((wp, i) => <WallpaperCard key={i} wp={wp} i={WALLPAPERS.indexOf(wp)}/>)}
                        </div>
                        <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-2">macOS Collection</div>
                        <div className="grid grid-cols-4 gap-3">
                            {onlineWPs.map((wp, i) => <WallpaperCard key={i} wp={wp} i={WALLPAPERS.indexOf(wp)}/>)}
                        </div>
                    </div>
                );

            case 'battery':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Battery</h2>
                        <SettingsGroup>
                            <div className="px-4 py-4">
                                <div className="flex items-center gap-4 mb-3">
                                    <svg viewBox="0 0 48 24" width="64" height="32" fill="none" stroke="#34C759" strokeWidth="1.5">
                                        <rect x="1" y="2" width="38" height="18" rx="4" fill="none"/>
                                        <rect x="3" y="4" width="34" height="14" rx="2" fill="#34C759" opacity="0.3"/>
                                        <rect x="3" y="4" width="28" height="14" rx="2" fill="#34C759"/>
                                        <path d="M41 8 v6" strokeWidth="2.5" strokeLinecap="round"/>
                                    </svg>
                                    <div>
                                        <div className="text-[18px] font-bold">82%</div>
                                        <div className="text-[12px] text-gray-500">Power Source: Power Adapter</div>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }}/>
                                </div>
                            </div>
                        </SettingsGroup>
                        <SettingsGroup>
                            <SettingsRow label="Low Power Mode" right={<Toggle checked={local.lowPowerMode} onChange={() => toggleLocal('lowPowerMode')}/>} />
                            <SettingsRow label="Optimized Battery Charging" right={<Toggle checked={local.optimizedCharging} onChange={() => toggleLocal('optimizedCharging')}/>} />
                            <SettingsRow label="Show battery percentage" right={<Toggle checked={local.showPercentage} onChange={() => toggleLocal('showPercentage')}/>} />
                        </SettingsGroup>
                        <SettingsGroup title="Battery Health">
                            <SettingsRow label="Maximum Capacity" detail="96%" />
                            <SettingsRow label="Cycle Count" detail="127" />
                            <SettingsRow label="Condition" detail="Normal" />
                        </SettingsGroup>
                        <SettingsGroup title="Usage History">
                            <div className="px-4 py-3">
                                <div className="flex justify-between text-[11px] text-gray-400 mb-2">
                                    <span>Last 24 hours</span><span>Last 10 days</span>
                                </div>
                                <div className="flex items-end gap-1 h-[60px]">
                                    {[65,72,80,45,60,82,70,55,75,68,82,90].map((v,i) => (
                                        <div key={i} className="flex-1 bg-green-400 rounded-t" style={{ height: v + '%' }}/>
                                    ))}
                                </div>
                            </div>
                        </SettingsGroup>
                    </div>
                );

            case 'keyboard':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Keyboard</h2>
                        <SettingsGroup title="Keyboard">
                            <div className="px-4 py-3 border-b border-black/[0.04]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[13px]">Key repeat rate</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-gray-400">Slow</span>
                                    <input type="range" min="1" max="10" value={local.keyRepeatSpeed}
                                        onChange={e => setLocalKey('keyRepeatSpeed', Number(e.target.value))}
                                        className="flex-1 h-1 appearance-none cursor-pointer"/>
                                    <span className="text-[11px] text-gray-400">Fast</span>
                                </div>
                            </div>
                            <div className="px-4 py-3 border-b border-black/[0.04]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[13px]">Delay until repeat</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-gray-400">Long</span>
                                    <input type="range" min="1" max="6" value={local.delayUntilRepeat}
                                        onChange={e => setLocalKey('delayUntilRepeat', Number(e.target.value))}
                                        className="flex-1 h-1 appearance-none cursor-pointer"/>
                                    <span className="text-[11px] text-gray-400">Short</span>
                                </div>
                            </div>
                            <SettingsRow label="Turn keyboard backlight off after inactivity" detail="After 5 Minutes" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup title="Text Input">
                            <SettingsRow label="Correct spelling automatically" right={<Toggle checked={true} onChange={() => {}}/>} />
                            <SettingsRow label="Capitalize words automatically" right={<Toggle checked={true} onChange={() => {}}/>} />
                            <SettingsRow label="Add period with double-space" right={<Toggle checked={true} onChange={() => {}}/>} />
                        </SettingsGroup>
                        <SettingsGroup title="Shortcuts">
                            <SettingsRow label="Spotlight" detail="⌘ Space" hasArrow />
                            <SettingsRow label="Input Sources" hasArrow />
                            <SettingsRow label="Screenshots" detail="⇧⌘3, ⇧⌘4" hasArrow />
                        </SettingsGroup>
                    </div>
                );

            case 'trackpad':
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">Trackpad</h2>
                        <SettingsGroup title="Point & Click">
                            <div className="px-4 py-3 border-b border-black/[0.04]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[13px]">Tracking speed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-gray-400">Slow</span>
                                    <input type="range" min="1" max="10" value={local.trackingSpeed}
                                        onChange={e => setLocalKey('trackingSpeed', Number(e.target.value))}
                                        className="flex-1 h-1 appearance-none cursor-pointer"/>
                                    <span className="text-[11px] text-gray-400">Fast</span>
                                </div>
                            </div>
                            <SettingsRow label="Tap to click" right={<Toggle checked={local.tapToClick} onChange={() => toggleLocal('tapToClick')}/>} />
                            <SettingsRow label="Force Click and haptic feedback" right={<Toggle checked={local.forceClick} onChange={() => toggleLocal('forceClick')}/>} />
                            <SettingsRow label="Look up & data detectors" detail="Force Click with One Finger" hasArrow />
                            <SettingsRow label="Secondary click" detail="Click or Tap with Two Fingers" hasArrow />
                        </SettingsGroup>
                        <SettingsGroup title="Scroll & Zoom">
                            <SettingsRow label="Natural scrolling" right={<Toggle checked={local.naturalScrolling} onChange={() => toggleLocal('naturalScrolling')}/>} />
                            <SettingsRow label="Zoom in or out" detail="Pinch with two fingers" />
                            <SettingsRow label="Smart zoom" detail="Double-tap with two fingers" />
                            <SettingsRow label="Rotate" detail="Rotate with two fingers" />
                        </SettingsGroup>
                        <SettingsGroup title="More Gestures">
                            <SettingsRow label="Swipe between pages" detail="Scroll Left or Right with Two Fingers" hasArrow />
                            <SettingsRow label="Swipe between full-screen apps" detail="Swipe Left or Right with Three Fingers" hasArrow />
                            <SettingsRow label="Mission Control" detail="Swipe Up with Three Fingers" hasArrow />
                            <SettingsRow label="Launchpad" detail="Pinch with Thumb and Three Fingers" hasArrow />
                            <SettingsRow label="Show Desktop" detail="Spread with Thumb and Three Fingers" hasArrow />
                        </SettingsGroup>
                    </div>
                );

            default:
                return (
                    <div>
                        <h2 className="text-[22px] font-bold mb-5">{sections.find(s => s.id === activeSection)?.label || 'Settings'}</h2>
                        <SettingsGroup><SettingsRow label="Coming soon..." /></SettingsGroup>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-full">
            <div className="w-[260px] min-w-[260px] bg-gray-50/95 border-r border-black/5 overflow-y-auto p-2">
                <input type="text" placeholder="Search" className="w-full mb-3 px-3 py-1.5 rounded-lg border border-black/5 bg-white/80 text-[13px] outline-none font-sf"/>
                {sections.map((s, i) => {
                    if (s.sep) return <div key={i} className="h-px bg-black/5 my-2 mx-4"/>;
                    if (s.isProfile) return (
                        <div key={s.id}
                            className={`flex items-center gap-3 p-3 mx-1 rounded-xl cursor-default ${activeSection === s.id ? 'text-white' : 'hover:bg-black/[0.03]'}`}
                            style={activeSection === s.id ? { background: accentColor } : undefined}
                            onClick={() => setActiveSection(s.id)}>
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                <svg viewBox="0 0 100 100" width="48" height="48"><circle cx="50" cy="50" r="50" fill="#c7c7cc"/><circle cx="50" cy="38" r="18" fill="#e5e5ea"/><ellipse cx="50" cy="80" rx="30" ry="22" fill="#e5e5ea"/></svg>
                            </div>
                            <div>
                                <div className="text-[14px] font-semibold">User</div>
                                <div className={`text-[11px] ${activeSection === s.id ? 'text-white/70' : 'text-gray-400'}`}>Apple ID, iCloud+</div>
                            </div>
                        </div>
                    );
                    return (
                        <div key={s.id}
                            className={`flex items-center gap-2.5 px-3 py-[5px] mx-1 rounded-lg cursor-default text-[13px] ${activeSection === s.id ? 'text-white' : 'hover:bg-black/[0.03]'}`}
                            style={activeSection === s.id ? { background: accentColor } : undefined}
                            onClick={() => setActiveSection(s.id)}>
                            <span className="text-sm">{s.icon}</span>
                            <span>{s.label}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-white">
                {renderContent()}
            </div>
        </div>
    );
};

const SettingsGroup = ({ title, children }) => (
    <div className="mb-4">
        {title && <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-1 px-1">{title}</div>}
        <div className="bg-gray-50 rounded-xl overflow-hidden">{children}</div>
    </div>
);

const SettingsRow = ({ label, detail, hasArrow, right }) => (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.04] last:border-0 text-[13px]">
        <span>{label}</span>
        <div className="flex items-center gap-2">
            {detail && <span className="text-[12px] text-gray-400">{detail}</span>}
            {right}
            {hasArrow && <svg viewBox="0 0 24 24" width="14" height="14" fill="#c7c7cc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>}
        </div>
    </div>
);

window.SettingsApp = SettingsApp;
