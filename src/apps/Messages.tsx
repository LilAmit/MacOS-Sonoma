// Messages App - Interactive chat
const MessagesApp = () => {
    const [conversations, setConversations] = React.useState([
        { id: 1, name: 'John', initial: 'J', color: '#007AFF', messages: [
            { from: 'them', text: 'Hey! How\'s the project going?' },
            { from: 'me', text: 'Going really well! Almost done with the frontend.' },
            { from: 'them', text: 'That\'s awesome! Can\'t wait to see it.' },
            { from: 'me', text: 'I\'ll send you a preview tonight 🎉' },
            { from: 'them', text: 'Hey, are we still on for tomorrow?' },
        ], time: '9:30 AM' },
        { id: 2, name: 'Sarah', initial: 'S', color: '#FF3B30', messages: [
            { from: 'me', text: 'Just sent the files over' },
            { from: 'them', text: 'Thanks for sending that over!' },
        ], time: 'Yesterday' },
        { id: 3, name: 'Team Chat', initial: 'T', color: '#34C759', messages: [
            { from: 'them', text: 'The project is looking great 👍' },
            { from: 'me', text: 'Thanks! The team did an amazing job' },
        ], time: 'Tuesday' },
        { id: 4, name: 'Emma', initial: 'E', color: '#FF9500', messages: [
            { from: 'them', text: 'Can you review the PR?' },
            { from: 'me', text: 'Sure, I\'ll take a look' },
        ], time: 'Monday' },
    ]);
    const [activeId, setActiveId] = React.useState(1);
    const [input, setInput] = React.useState('');
    const chatRef = React.useRef(null);

    const active = conversations.find(c => c.id === activeId);

    const sendMessage = () => {
        if (!input.trim()) return;
        setConversations(prev => prev.map(c =>
            c.id === activeId ? {
                ...c,
                messages: [...c.messages, { from: 'me', text: input }],
                time: 'Just now'
            } : c
        ));
        setInput('');

        // Auto-reply after delay
        setTimeout(() => {
            const replies = ['That sounds great!', 'Got it 👍', 'Thanks!', 'Let me think about that...', 'Awesome!', '😂', 'Perfect!'];
            setConversations(prev => prev.map(c =>
                c.id === activeId ? {
                    ...c,
                    messages: [...c.messages, { from: 'them', text: replies[Math.floor(Math.random() * replies.length)] }]
                } : c
            ));
        }, 1000 + Math.random() * 2000);
    };

    React.useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [conversations, activeId]);

    return (
        <div className="flex h-full">
            <div className="w-[280px] min-w-[280px] bg-gray-50/95 border-r border-black/5 flex flex-col">
                <div className="p-3 border-b border-black/5">
                    <input type="text" placeholder="Search" className="w-full px-3 py-1.5 rounded-lg border border-black/5 bg-white/80 text-[13px] outline-none font-sf"/>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(c => (
                        <div key={c.id}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-default border-b border-black/[0.03] ${activeId === c.id ? 'bg-blue-500 text-white' : 'hover:bg-black/[0.02]'}`}
                            onClick={() => setActiveId(c.id)}
                        >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold flex-shrink-0"
                                style={{ background: c.color }}>{c.initial}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-[13px] font-semibold">{c.name}</span>
                                    <span className={`text-[11px] ${activeId === c.id ? 'text-white/70' : 'text-gray-400'}`}>{c.time}</span>
                                </div>
                                <div className={`text-[12px] truncate ${activeId === c.id ? 'text-white/70' : 'text-gray-400'}`}>
                                    {c.messages[c.messages.length - 1]?.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col bg-white">
                <div className="px-4 py-2.5 border-b border-black/5 text-center font-semibold text-[14px]">
                    {active?.name}
                </div>
                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                    {active?.messages.map((msg, i) => (
                        <div key={i} className={`max-w-[65%] px-3.5 py-2 text-[14px] leading-relaxed ${
                            msg.from === 'me'
                                ? 'bg-blue-500 text-white self-end rounded-2xl rounded-br-md'
                                : 'bg-gray-200 text-gray-900 self-start rounded-2xl rounded-bl-md'
                        }`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <div className="px-4 py-3 border-t border-black/5 flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="iMessage"
                        className="flex-1 px-4 py-2 rounded-full border border-black/10 text-[14px] outline-none font-sf"
                    />
                    <button onClick={sendMessage} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

window.MessagesApp = MessagesApp;
