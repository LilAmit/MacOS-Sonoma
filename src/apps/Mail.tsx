// Mail App - with different content per folder
const MailApp = () => {
    const [activeFolder, setActiveFolder] = React.useState('Inbox');
    const [activeEmail, setActiveEmail] = React.useState(0);
    const [confirmEmptyTrash, setConfirmEmptyTrash] = React.useState(false);

    const folders = [
        { name: 'Inbox', icon: '📥', badge: 3 },
        { name: 'Sent', icon: '📤' },
        { name: 'Drafts', icon: '📝', badge: 1 },
        { name: 'Flagged', icon: '⭐' },
        { name: 'Trash', icon: '🗑️' },
        { name: 'Archive', icon: '📦' },
        { name: 'Junk', icon: '🚫' },
    ];

    const emailsByFolder = {
        Inbox: [
            { sender: 'Apple', subject: 'Your Apple ID was used to sign in', preview: 'Your Apple ID (user@icloud.com) was used to sign in to iCloud...', time: '9:15 AM', unread: true,
              body: 'Dear User,\n\nYour Apple ID (user@icloud.com) was used to sign in to iCloud via a web browser.\n\nDate and Time: February 23, 2026 at 9:15 AM PST\nOperating System: macOS Sonoma\n\nIf you recently signed in to iCloud, you can disregard this email.\n\nRegards,\nApple Support' },
            { sender: 'GitHub', subject: 'Security alert: new sign-in', preview: 'We noticed a new sign-in to your GitHub account...', time: '8:42 AM', unread: true,
              body: 'Hi user,\n\nWe noticed a new sign-in to your GitHub account from a device we don\'t recognize.\n\nDevice: MacBook Pro\nLocation: Cupertino, CA\nTime: Feb 23, 2026 at 8:42 AM\n\nIf this was you, you can ignore this email.\n\nThe GitHub Team' },
            { sender: 'Sarah Johnson', subject: 'Re: Project Update', preview: 'Thanks for the update! Everything looks good...', time: 'Yesterday', unread: true,
              body: 'Hey!\n\nThanks for the update! Everything looks good. Let me know if you need anything else from my end.\n\nThe design files are ready whenever you need them.\n\nBest,\nSarah' },
            { sender: 'LinkedIn', subject: 'You have 5 new connection requests', preview: 'Accept connection requests from people you know...', time: 'Yesterday',
              body: 'You have 5 new connection requests.\n\nAccept connection requests from people you know to grow your network.\n\n- Alex Chen, Software Engineer at Google\n- Maria Garcia, Product Designer at Apple\n- David Kim, CTO at StartupXYZ' },
            { sender: 'Slack', subject: 'Digest for #engineering', preview: 'Here\'s what you missed in #engineering today...', time: 'Monday',
              body: '#engineering Digest\n\n@mike: Deployed v2.1 to staging\n@sarah: PR #342 ready for review\n@alex: Fixed the login bug (issue #89)\n@team: Sprint retro tomorrow at 2pm\n\n12 messages in 3 threads' },
        ],
        Sent: [
            { sender: 'Me', to: 'Sarah Johnson', subject: 'Project Update', preview: 'Hi Sarah, here is the latest update on the project...', time: 'Yesterday',
              body: 'Hi Sarah,\n\nHere is the latest update on the project:\n\n1. Frontend redesign is 90% complete\n2. API integration is done\n3. Testing phase starts next week\n\nLet me know if you have any questions.\n\nBest regards' },
            { sender: 'Me', to: 'Mike Thompson', subject: 'Re: Code Review', preview: 'Looks good! Just a few minor suggestions...', time: 'Monday',
              body: 'Hey Mike,\n\nLooks good! Just a few minor suggestions:\n\n1. Consider using a map instead of repeated if-else\n2. The error handling in line 42 could be more specific\n3. Great job on the unit tests!\n\nApproved with minor changes.' },
            { sender: 'Me', to: 'Team', subject: 'Meeting Notes - Sprint Planning', preview: 'Here are the notes from today\'s sprint planning...', time: 'Last Week',
              body: 'Team,\n\nHere are the notes from today\'s sprint planning:\n\nSprint Goals:\n- Complete user dashboard redesign\n- Implement notification system\n- Fix critical bugs from QA\n\nAssignments:\n- Sarah: Dashboard UI\n- Mike: Notification API\n- Alex: Bug fixes\n\nNext meeting: Friday 2pm' },
        ],
        Drafts: [
            { sender: 'Me', to: 'HR Department', subject: 'Vacation Request', preview: 'I would like to request time off from...', time: 'Today', draft: true,
              body: 'Dear HR,\n\nI would like to request time off from March 15-22, 2026.\n\nI have completed all urgent tasks and have arranged coverage with my team.\n\nPlease let me know if you need any additional information.\n\nThank you,' },
        ],
        Flagged: [
            { sender: 'Apple', subject: 'Your Apple ID was used to sign in', preview: 'Your Apple ID (user@icloud.com) was used to sign in to iCloud...', time: '9:15 AM', flagged: true,
              body: 'Dear User,\n\nYour Apple ID (user@icloud.com) was used to sign in to iCloud via a web browser.\n\nDate and Time: February 23, 2026 at 9:15 AM PST\nOperating System: macOS Sonoma\n\nIf you recently signed in to iCloud, you can disregard this email.\n\nRegards,\nApple Support' },
            { sender: 'Manager', subject: 'Performance Review - Action Required', preview: 'Please complete your self-review by end of week...', time: 'Last Week', flagged: true,
              body: 'Hi,\n\nPlease complete your self-review by end of this week. The link to the form is below.\n\nRemember to include:\n- Key accomplishments\n- Areas for growth\n- Goals for next quarter\n\nLet me know if you have questions.\n\nBest,\nYour Manager' },
        ],
        Trash: [
            { sender: 'Promo Store', subject: '🎉 50% OFF Everything!', preview: 'Don\'t miss our biggest sale of the year...', time: '2 days ago',
              body: '🎉 BIGGEST SALE OF THE YEAR! 🎉\n\n50% OFF EVERYTHING!\n\nUse code: SAVE50\n\nShop now before items sell out!\n\nTerms and conditions apply.' },
            { sender: 'Newsletter', subject: 'Weekly Tech Digest', preview: 'This week in tech: AI breakthroughs, new gadgets...', time: '3 days ago',
              body: 'WEEKLY TECH DIGEST\n\nTop Stories:\n1. New AI model breaks records\n2. Apple announces M4 Ultra chip\n3. SpaceX Starship completes orbital flight\n4. Quantum computing milestone achieved\n\nRead more at techdigest.com' },
            { sender: 'Old Contact', subject: 'Catching up', preview: 'Hey! It\'s been a while since we last talked...', time: 'Last Week',
              body: 'Hey!\n\nIt\'s been a while since we last talked. How have you been?\n\nI recently moved to San Francisco and would love to catch up if you\'re around.\n\nLet me know!\n\nCheers' },
        ],
        Archive: [
            { sender: 'IT Department', subject: 'Password Reset Confirmation', preview: 'Your password has been successfully reset...', time: 'Last Month',
              body: 'Your password for user@company.com has been successfully reset.\n\nIf you did not make this change, please contact IT support immediately.\n\nIT Department' },
            { sender: 'Amazon', subject: 'Your order has been delivered', preview: 'Your package was delivered to your front door...', time: 'Last Month',
              body: 'Your Amazon order #123-4567890 has been delivered!\n\nDelivered to: Front Door\nItems: MacBook Pro Sleeve, USB-C Hub\n\nRate your delivery experience.' },
            { sender: 'Bank', subject: 'Monthly Statement Available', preview: 'Your January 2026 statement is now available...', time: 'Jan 2026',
              body: 'Your monthly statement for January 2026 is now available.\n\nAccount ending in: 4532\nStatement Period: Jan 1 - Jan 31, 2026\n\nLog in to view your full statement.\n\nThank you for banking with us.' },
        ],
        Junk: [
            { sender: 'unknown@spam.com', subject: 'You\'ve Won $1,000,000!', preview: 'Congratulations! You have been selected as our lucky winner...', time: 'Today',
              body: 'CONGRATULATIONS!!!\n\nYou have been selected as our LUCKY WINNER of $1,000,000!\n\nTo claim your prize, simply send us your banking details...\n\n[This is clearly spam]' },
            { sender: 'crypto@deals.xyz', subject: 'Make 10x Returns GUARANTEED', preview: 'Invest now in this revolutionary crypto opportunity...', time: 'Yesterday',
              body: 'GUARANTEED 10X RETURNS!!!\n\nThis revolutionary crypto opportunity will change your life!\n\nInvest as little as $100 and watch it grow to $1000!\n\n[Definitely spam]' },
            { sender: 'prince@nigeria.com', subject: 'Urgent Business Proposal', preview: 'Dear friend, I am a prince with a business opportunity...', time: '3 days ago',
              body: 'Dear Friend,\n\nI am Prince Abubakar from Nigeria. I have a business proposition for you involving $45 million.\n\nPlease respond urgently.\n\n[Classic spam]' },
        ],
    };

    const currentEmails = emailsByFolder[activeFolder] || [];
    const active = currentEmails[activeEmail] || currentEmails[0];

    const handleEmptyMailTrash = () => {
        // Also empty from system trash
        emailsByFolder.Trash = [];
        setConfirmEmptyTrash(false);
        setActiveEmail(0);
    };

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-[200px] min-w-[200px] bg-gray-50/95 border-r border-black/5 p-2 overflow-y-auto">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-3">Mailboxes</div>
                {folders.map(f => (
                    <div key={f.name}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-default text-[13px] ${activeFolder === f.name ? 'bg-blue-500 text-white' : 'hover:bg-black/[0.03]'}`}
                        onClick={() => { setActiveFolder(f.name); setActiveEmail(0); }}>
                        <span>{f.icon}</span>
                        <span>{f.name}</span>
                        {f.badge && <span className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-medium ${activeFolder === f.name ? 'bg-white/30' : 'bg-blue-500 text-white'}`}>{f.badge}</span>}
                    </div>
                ))}
                {activeFolder === 'Trash' && emailsByFolder.Trash.length > 0 && (
                    <button
                        className="w-[calc(100%-8px)] mx-1 mt-3 px-3 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-medium hover:bg-red-600"
                        onClick={() => setConfirmEmptyTrash(true)}>
                        Empty Trash
                    </button>
                )}
            </div>

            {/* Email list */}
            <div className="w-[320px] min-w-[320px] border-r border-black/5 overflow-y-auto bg-white">
                {currentEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                        <span className="text-[32px] mb-2">📭</span>
                        <span className="text-[13px]">No Messages</span>
                    </div>
                ) : (
                    currentEmails.map((e, i) => (
                        <div key={i}
                            className={`px-4 py-3 border-b border-black/[0.04] cursor-default ${activeEmail === i ? 'bg-blue-500/[0.06]' : 'hover:bg-black/[0.02]'}`}
                            onClick={() => setActiveEmail(i)}>
                            <div className="flex justify-between items-center mb-0.5">
                                <span className={`text-[13px] font-semibold ${e.unread ? 'text-blue-500' : ''}`}>
                                    {e.unread && <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5"/>}
                                    {e.flagged && <span className="text-orange-400 mr-1">⚑</span>}
                                    {e.sender}
                                </span>
                                <span className="text-[10px] text-gray-400">{e.time}</span>
                            </div>
                            {e.to && <div className="text-[11px] text-gray-400 mb-0.5">To: {e.to}</div>}
                            <div className="text-[12px] font-medium truncate mb-0.5">{e.subject}</div>
                            <div className="text-[11px] text-gray-400 truncate">{e.preview}</div>
                            {e.draft && <span className="text-[10px] text-red-400 font-medium">DRAFT</span>}
                        </div>
                    ))
                )}
            </div>

            {/* Email content */}
            <div className="flex-1 p-6 overflow-y-auto bg-white">
                {active ? (
                    <>
                        <div className="mb-4 pb-3 border-b border-black/5">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-[18px] font-semibold">{active.subject}</h2>
                                {active.flagged && <span className="text-orange-400 text-lg">⚑</span>}
                            </div>
                            <div className="text-[13px] text-gray-400">
                                From: {active.sender}{active.sender === 'Me' ? ' <user@icloud.com>' : ''}<br/>
                                To: {active.to || 'user@icloud.com'}<br/>
                                Date: {active.time}
                            </div>
                        </div>
                        <div className="text-[14px] leading-relaxed text-gray-700 whitespace-pre-wrap">
                            {active.body}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                        <span className="text-[14px]">No Message Selected</span>
                    </div>
                )}
            </div>

            {/* Confirm empty trash */}
            {confirmEmptyTrash && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 rounded-b-xl">
                    <div className="bg-white rounded-xl shadow-2xl p-5 w-[320px]">
                        <h3 className="text-[14px] font-bold mb-2">Empty Trash?</h3>
                        <p className="text-[12px] text-gray-500 mb-4">Are you sure you want to permanently erase the items in Mail Trash?</p>
                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-1.5 rounded-lg bg-gray-100 text-[13px] font-medium hover:bg-gray-200"
                                onClick={() => setConfirmEmptyTrash(false)}>Cancel</button>
                            <button className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600"
                                onClick={handleEmptyMailTrash}>Empty Trash</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.MailApp = MailApp;
