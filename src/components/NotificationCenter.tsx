// Notification Center with Widgets - unified panel (date/time click)
const NotificationCenter = () => {
    const isOpen = useStore(s => s.notificationCenterOpen);
    const darkMode = useStore(s => s.darkMode);
    const [checkedReminders, setCheckedReminders] = React.useState(new Set());

    const { shouldRender, isClosing } = useAnimatedVisibility(isOpen, 200);
    if (!shouldRender) return null;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const wTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Build mini calendar
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const calDays = [];
    for (let i = firstDay - 1; i >= 0; i--) calDays.push({ day: prevDays - i, other: true });
    for (let d = 1; d <= daysInMonth; d++) calDays.push({ day: d, today: d === now.getDate(), other: false });
    const remaining = (7 - calDays.length % 7) % 7;
    for (let d = 1; d <= remaining; d++) calDays.push({ day: d, other: true });

    const reminders = ['Review pull requests', 'Update documentation', 'Team meeting at 3 PM', 'Deploy v2.0 to staging'];

    const toggleReminder = (i) => {
        const s = new Set(checkedReminders);
        s.has(i) ? s.delete(i) : s.add(i);
        setCheckedReminders(s);
    };

    return (
        <div className="fixed z-[10001]" style={{ top: '31px', right: '12px' }} onClick={e => e.stopPropagation()}>
            <div className={`w-[340px] max-h-[calc(100vh-100px)] glass rounded-2xl shadow-2xl border border-black/10 overflow-y-auto ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}>

                {/* Notifications section */}
                <div className="p-3.5 pb-0">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Notifications</div>
                    <div className={`rounded-xl p-3 mb-3 ${darkMode ? 'bg-white/10' : 'bg-white/70'} shadow-sm`}>
                        <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">m</div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="text-[11px] text-gray-400 font-medium">Messages</span>
                                    <span className="text-[10px] text-gray-400">2m ago</span>
                                </div>
                                <div className="text-[13px] font-semibold">New Message</div>
                                <div className="text-[12px] text-gray-500">Hey, are you free for lunch?</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Widgets section */}
                <div className="p-3.5 pt-0">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Widgets</div>

                    {/* Clock Widget */}
                    <div className={`rounded-xl p-4 mb-3 ${darkMode ? 'bg-white/10' : 'bg-white/70'} shadow-sm`}>
                        <div className={`text-[32px] font-light ${darkMode ? 'text-white' : 'text-gray-900'}`}>{wTime}</div>
                        <div className={`text-[13px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{dateStr}</div>
                    </div>

                    {/* Calendar Widget */}
                    <div className={`rounded-xl p-3.5 mb-3 ${darkMode ? 'bg-white/10' : 'bg-white/70'} shadow-sm`}>
                        <div className="flex justify-between items-center mb-2.5">
                            <span className="text-[14px] font-semibold">{monthName}</span>
                        </div>
                        <div className="grid grid-cols-7 gap-px text-center">
                            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                                <div key={d} className="text-[10px] font-semibold text-gray-400 py-1">{d}</div>
                            ))}
                            {calDays.map((d, i) => (
                                <div key={i}
                                    className={`text-[11px] py-0.5 w-7 h-7 flex items-center justify-center mx-auto rounded-full cursor-default
                                        ${d.today ? 'bg-red-500 text-white font-semibold' : d.other ? 'text-gray-300' : 'hover:bg-black/5'}`}>
                                    {d.day}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weather Widget */}
                    <div className="rounded-xl p-3.5 mb-3 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[13px] opacity-70">My Location</div>
                                <div className="text-[38px] font-extralight leading-none my-1">22°</div>
                                <div className="text-[13px] opacity-80">Partly Cloudy</div>
                            </div>
                            <div className="text-[44px]">&#9925;</div>
                        </div>
                        <div className="flex justify-between text-[12px] opacity-60 mt-2">
                            <span>H: 26°</span>
                            <span>L: 18°</span>
                        </div>
                    </div>

                    {/* Reminders Widget */}
                    <div className={`rounded-xl p-3.5 mb-3 ${darkMode ? 'bg-white/10' : 'bg-white/70'} shadow-sm`}>
                        <div className="text-[14px] font-semibold mb-2.5">Reminders</div>
                        {reminders.map((r, i) => (
                            <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-black/[0.04] last:border-0">
                                <div
                                    className={`w-[18px] h-[18px] rounded-full border-[1.5px] cursor-default flex items-center justify-center flex-shrink-0 transition-all
                                        ${checkedReminders.has(i) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-500'}`}
                                    onClick={() => toggleReminder(i)}
                                >
                                    {checkedReminders.has(i) && <svg viewBox="0 0 24 24" width="12" height="12" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                                </div>
                                <span className={`text-[13px] ${checkedReminders.has(i) ? 'line-through text-gray-400' : ''}`}>{r}</span>
                            </div>
                        ))}
                    </div>

                    {/* Screen Time Widget */}
                    <div className={`rounded-xl p-3.5 ${darkMode ? 'bg-white/10' : 'bg-white/70'} shadow-sm`}>
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Screen Time</div>
                        <div className={`text-[22px] font-light ${darkMode ? 'text-white' : 'text-gray-900'}`}>3h 24m</div>
                        <div className={`text-[12px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>15% less than yesterday</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.NotificationCenter = NotificationCenter;
