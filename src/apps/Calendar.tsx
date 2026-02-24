// Calendar App
const CalendarApp = () => {
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const now = new Date();
    const month = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const year = selectedDate.getFullYear();
    const monthIdx = selectedDate.getMonth();
    const firstDay = new Date(year, monthIdx, 1).getDay();
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const prevDays = new Date(year, monthIdx, 0).getDate();

    const events = [
        { day: now.getDate(), title: 'Team Standup', time: '9:00 AM', color: '#007AFF' },
        { day: now.getDate(), title: 'Lunch with Sarah', time: '12:30 PM', color: '#34C759' },
        { day: now.getDate() + 1, title: 'Design Review', time: '2:00 PM', color: '#FF9500' },
        { day: now.getDate() + 2, title: 'Sprint Planning', time: '10:00 AM', color: '#5856D6' },
    ];

    const prevMonth = () => setSelectedDate(new Date(year, monthIdx - 1, 1));
    const nextMonth = () => setSelectedDate(new Date(year, monthIdx + 1, 1));
    const goToday = () => setSelectedDate(new Date());

    const todayEvents = events.filter(e => e.day === now.getDate());

    return (
        <div className="flex h-full">
            <div className="w-[200px] min-w-[200px] bg-gray-50/95 border-r border-black/5 p-3">
                <div className="text-[13px] font-semibold mb-2">Calendars</div>
                {[{name:'Home',color:'#007AFF'},{name:'Work',color:'#34C759'},{name:'Family',color:'#FF9500'},{name:'Birthdays',color:'#AF52DE'}].map(cal => (
                    <label key={cal.name} className="flex items-center gap-2 py-1 text-[12px] cursor-default">
                        <div className="w-3 h-3 rounded" style={{ background: cal.color }}/> {cal.name}
                    </label>
                ))}
                <div className="mt-6 text-[13px] font-semibold mb-2">Today's Events</div>
                {todayEvents.length > 0 ? todayEvents.map((e,i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 text-[12px]">
                        <div className="w-1 h-6 rounded" style={{ background: e.color }}/>
                        <div>
                            <div className="font-medium">{e.title}</div>
                            <div className="text-gray-400">{e.time}</div>
                        </div>
                    </div>
                )) : <div className="text-[12px] text-gray-400">No events today</div>}
            </div>
            <div className="flex-1 p-6 bg-white">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[22px] font-bold">{month}</h2>
                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="w-7 h-7 rounded-md hover:bg-black/5 flex items-center justify-center text-gray-400">◀</button>
                        <button onClick={goToday} className="px-3 py-1 rounded-md hover:bg-black/5 text-[12px] text-blue-500 font-medium">Today</button>
                        <button onClick={nextMonth} className="w-7 h-7 rounded-md hover:bg-black/5 flex items-center justify-center text-gray-400">▶</button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-px text-center">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                        <div key={d} className="py-2 text-[11px] font-semibold text-gray-400">{d}</div>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`p${i}`} className="py-3 text-[14px] text-gray-300">{prevDays - firstDay + i + 1}</div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isToday = day === now.getDate() && monthIdx === now.getMonth() && year === now.getFullYear();
                        const hasEvent = events.some(e => e.day === day);
                        return (
                            <div key={day}
                                className={`py-3 text-[14px] cursor-default relative ${isToday ? 'text-white font-semibold' : ''}`}
                            >
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-blue-500' : 'hover:bg-black/5'}`}>
                                    {day}
                                </span>
                                {hasEvent && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"/>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

window.CalendarApp = CalendarApp;
