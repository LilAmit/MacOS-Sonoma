// macOS Apps
function openApp(appType) {
    // Check if already open - if minimized, restore it
    const existingWin = MacOS.windows.find(w => w.appType === appType);
    if (existingWin) {
        if (existingWin.minimized) {
            MacOS.restoreWindow(existingWin.id);
        } else {
            MacOS.focusWindow(existingWin.id);
        }
        return;
    }

    switch (appType) {
        case 'finder': openFinder(); break;
        case 'safari': openSafari(); break;
        case 'calculator': openCalculator(); break;
        case 'notes': openNotes(); break;
        case 'terminal': openTerminal(); break;
        case 'settings': openSettings(); break;
        case 'messages': openMessages(); break;
        case 'mail': openMail(); break;
        case 'maps': openMaps(); break;
        case 'photos': openPhotos(); break;
        case 'trash': openTrash(); break;
        case 'launchpad': openLaunchpad(); break;
        case 'textedit': openTextEdit(); break;
        case 'calendar': openCalendar(); break;
        default: break;
    }
}

function openFinder() {
    const folderIcon = `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M6 8h14l4 4h18c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="#64B5F6"/><rect x="4" y="14" width="40" height="24" rx="2" fill="#42A5F5"/></svg>`;
    const fileIcon = `<svg viewBox="0 0 48 48" width="48" height="48"><rect x="8" y="4" width="32" height="40" rx="4" fill="#E8E8E8"/><rect x="8" y="4" width="32" height="40" rx="4" fill="none" stroke="#CCC" stroke-width="1"/><line x1="14" y1="16" x2="34" y2="16" stroke="#CCC" stroke-width="1.5"/><line x1="14" y1="22" x2="34" y2="22" stroke="#CCC" stroke-width="1.5"/><line x1="14" y1="28" x2="28" y2="28" stroke="#CCC" stroke-width="1.5"/></svg>`;
    const imgIcon = `<svg viewBox="0 0 48 48" width="48" height="48"><rect x="6" y="6" width="36" height="36" rx="4" fill="#C8E6C9"/><circle cx="18" cy="18" r="4" fill="#FFD54F"/><path d="M6 34l10-12 8 10 6-6 12 16H6z" fill="#66BB6A" opacity="0.6"/></svg>`;

    const finderItems = [
        { name: 'Applications', icon: folderIcon },
        { name: 'Documents', icon: folderIcon },
        { name: 'Downloads', icon: folderIcon },
        { name: 'Desktop', icon: folderIcon },
        { name: 'Movies', icon: folderIcon },
        { name: 'Music', icon: folderIcon },
        { name: 'Pictures', icon: folderIcon },
        { name: 'readme.txt', icon: fileIcon },
        { name: 'project.json', icon: fileIcon },
        { name: 'vacation.jpg', icon: imgIcon },
        { name: 'notes.md', icon: fileIcon },
        { name: 'screenshot.png', icon: imgIcon },
    ];

    const itemsHTML = finderItems.map(item => `
        <div class="finder-item" onclick="this.classList.toggle('selected')">
            <div class="finder-item-icon">${item.icon}</div>
            <div class="finder-item-name">${item.name}</div>
        </div>
    `).join('');

    const content = `
        <div class="finder-app">
            <div class="finder-sidebar">
                <div class="finder-sidebar-section">
                    <div class="finder-sidebar-header">Favorites</div>
                    <div class="finder-sidebar-item active">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="#007AFF"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>
                        <span>Recents</span>
                    </div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="#34C759"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></div>
                        <span>Home</span>
                    </div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="#007AFF"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg></div>
                        <span>Desktop</span>
                    </div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="#64B5F6"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></div>
                        <span>Documents</span>
                    </div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="#5856D6"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg></div>
                        <span>Downloads</span>
                    </div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="#FF9500"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zm-6-7l-4 5h3v4h2v-4h3l-4-5z"/></svg></div>
                        <span>Applications</span>
                    </div>
                </div>
                <div class="finder-sidebar-section">
                    <div class="finder-sidebar-header">iCloud</div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="#007AFF"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg></div>
                        <span>iCloud Drive</span>
                    </div>
                </div>
                <div class="finder-sidebar-section">
                    <div class="finder-sidebar-header">Locations</div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="#8E8E93"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg></div>
                        <span>Macintosh HD</span>
                    </div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="#8E8E93"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg></div>
                        <span>Network</span>
                    </div>
                </div>
                <div class="finder-sidebar-section">
                    <div class="finder-sidebar-header">Tags</div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="5" fill="#FF3B30"/></svg></div>
                        <span>Red</span>
                    </div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="5" fill="#FF9500"/></svg></div>
                        <span>Orange</span>
                    </div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="5" fill="#34C759"/></svg></div>
                        <span>Green</span>
                    </div>
                    <div class="finder-sidebar-item">
                        <div class="finder-sidebar-icon"><svg viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="5" fill="#007AFF"/></svg></div>
                        <span>Blue</span>
                    </div>
                </div>
            </div>
            <div class="finder-content">${itemsHTML}</div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Home',
        appName: 'Finder',
        appType: 'finder',
        width: 900,
        height: 550,
        content,
        hasToolbar: true,
        toolbarContent: `
            <button class="safari-nav-btn" title="Back"><svg viewBox="0 0 24 24" width="16" height="16" fill="#666"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
            <button class="safari-nav-btn" title="Forward"><svg viewBox="0 0 24 24" width="16" height="16" fill="#ccc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
            <span style="flex:1"></span>
            <button class="safari-nav-btn" title="View"><svg viewBox="0 0 24 24" width="16" height="16" fill="#666"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg></button>
            <button class="safari-nav-btn" title="Sort"><svg viewBox="0 0 24 24" width="16" height="16" fill="#666"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg></button>
            <button class="safari-nav-btn" title="Search"><svg viewBox="0 0 24 24" width="14" height="14" fill="#666"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></button>
        `,
        hasPathBar: true,
        pathBarContent: `<svg viewBox="0 0 24 24" width="12" height="12" fill="#86868b"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4z"/></svg> Macintosh HD ▸ Users ▸ User ▸ Home`
    });
}

function openSafari() {
    const content = `
        <div class="safari-app">
            <div class="safari-toolbar">
                <div class="safari-nav-btns">
                    <button class="safari-nav-btn"><svg viewBox="0 0 24 24" width="16" height="16" fill="#666"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
                    <button class="safari-nav-btn"><svg viewBox="0 0 24 24" width="16" height="16" fill="#ccc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
                </div>
                <div class="safari-url-bar">
                    <input type="text" value="" placeholder="Search or enter website name" id="safari-url-input">
                </div>
                <button class="safari-nav-btn"><svg viewBox="0 0 24 24" width="16" height="16" fill="#666"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></button>
            </div>
            <div class="safari-tabs">
                <div class="safari-tab active">
                    <span class="safari-tab-close">&times;</span>
                    <span>Start Page</span>
                </div>
            </div>
            <div class="safari-content">
                <div class="safari-start-page">
                    <h2>Favorites</h2>
                    <div class="safari-favorites-grid">
                        <div class="safari-favorite">
                            <div class="safari-favorite-icon" style="background:linear-gradient(135deg,#1DA1F2,#0D8ECF)">A</div>
                            <div class="safari-favorite-name">Apple</div>
                        </div>
                        <div class="safari-favorite">
                            <div class="safari-favorite-icon" style="background:linear-gradient(135deg,#DB4437,#E57373)">G</div>
                            <div class="safari-favorite-name">Google</div>
                        </div>
                        <div class="safari-favorite">
                            <div class="safari-favorite-icon" style="background:linear-gradient(135deg,#FF0000,#CC0000)">Y</div>
                            <div class="safari-favorite-name">YouTube</div>
                        </div>
                        <div class="safari-favorite">
                            <div class="safari-favorite-icon" style="background:linear-gradient(135deg,#1877F2,#1565C0)">f</div>
                            <div class="safari-favorite-name">Facebook</div>
                        </div>
                        <div class="safari-favorite">
                            <div class="safari-favorite-icon" style="background:linear-gradient(135deg,#E4405F,#C13584)">I</div>
                            <div class="safari-favorite-name">Instagram</div>
                        </div>
                        <div class="safari-favorite">
                            <div class="safari-favorite-icon" style="background:linear-gradient(135deg,#333,#555)">G</div>
                            <div class="safari-favorite-name">GitHub</div>
                        </div>
                        <div class="safari-favorite">
                            <div class="safari-favorite-icon" style="background:linear-gradient(135deg,#FF6600,#FF8533)">R</div>
                            <div class="safari-favorite-name">Reddit</div>
                        </div>
                        <div class="safari-favorite">
                            <div class="safari-favorite-icon" style="background:linear-gradient(135deg,#1DB954,#1AA34A)">S</div>
                            <div class="safari-favorite-name">Spotify</div>
                        </div>
                    </div>
                    <h2 style="margin-top:40px;">Reading List</h2>
                    <div style="color:#86868b;font-size:13px;">No unread items</div>
                </div>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Start Page',
        appName: 'Safari',
        appType: 'safari',
        width: 1000,
        height: 650,
        content
    });
}

function openCalculator() {
    const calcHTML = `
        <div class="calculator-app">
            <div class="calc-display">
                <div class="calc-display-text" id="calc-display">0</div>
            </div>
            <div class="calc-buttons">
                <button class="calc-btn function" onclick="calcAction('clear')">AC</button>
                <button class="calc-btn function" onclick="calcAction('negate')">±</button>
                <button class="calc-btn function" onclick="calcAction('percent')">%</button>
                <button class="calc-btn operator" onclick="calcAction('operator', '÷')" data-op="÷">÷</button>
                <button class="calc-btn number" onclick="calcAction('number', '7')">7</button>
                <button class="calc-btn number" onclick="calcAction('number', '8')">8</button>
                <button class="calc-btn number" onclick="calcAction('number', '9')">9</button>
                <button class="calc-btn operator" onclick="calcAction('operator', '×')" data-op="×">×</button>
                <button class="calc-btn number" onclick="calcAction('number', '4')">4</button>
                <button class="calc-btn number" onclick="calcAction('number', '5')">5</button>
                <button class="calc-btn number" onclick="calcAction('number', '6')">6</button>
                <button class="calc-btn operator" onclick="calcAction('operator', '−')" data-op="−">−</button>
                <button class="calc-btn number" onclick="calcAction('number', '1')">1</button>
                <button class="calc-btn number" onclick="calcAction('number', '2')">2</button>
                <button class="calc-btn number" onclick="calcAction('number', '3')">3</button>
                <button class="calc-btn operator" onclick="calcAction('operator', '+')" data-op="+">+</button>
                <button class="calc-btn number zero" onclick="calcAction('number', '0')">0</button>
                <button class="calc-btn number" onclick="calcAction('decimal')">.</button>
                <button class="calc-btn operator" onclick="calcAction('equals')">=</button>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Calculator',
        appName: 'Calculator',
        appType: 'calculator',
        width: 250,
        height: 380,
        content: calcHTML,
        resizable: false
    });
}

// Calculator logic
const calc = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null
};

function calcAction(type, value) {
    const display = document.getElementById('calc-display');
    if (!display) return;

    switch (type) {
        case 'number':
            if (calc.waitingForSecondOperand) {
                calc.displayValue = value;
                calc.waitingForSecondOperand = false;
            } else {
                calc.displayValue = calc.displayValue === '0' ? value : calc.displayValue + value;
            }
            break;
        case 'decimal':
            if (calc.waitingForSecondOperand) {
                calc.displayValue = '0.';
                calc.waitingForSecondOperand = false;
                break;
            }
            if (!calc.displayValue.includes('.')) {
                calc.displayValue += '.';
            }
            break;
        case 'operator':
            const inputValue = parseFloat(calc.displayValue);
            if (calc.operator && calc.waitingForSecondOperand) {
                calc.operator = value;
                updateOperatorButtons(value);
                break;
            }
            if (calc.firstOperand === null) {
                calc.firstOperand = inputValue;
            } else if (calc.operator) {
                const result = performCalc(calc.firstOperand, inputValue, calc.operator);
                calc.displayValue = String(result);
                calc.firstOperand = result;
            }
            calc.waitingForSecondOperand = true;
            calc.operator = value;
            updateOperatorButtons(value);
            break;
        case 'equals':
            if (!calc.operator || calc.waitingForSecondOperand) break;
            const second = parseFloat(calc.displayValue);
            const res = performCalc(calc.firstOperand, second, calc.operator);
            calc.displayValue = String(res);
            calc.firstOperand = null;
            calc.operator = null;
            calc.waitingForSecondOperand = false;
            updateOperatorButtons(null);
            break;
        case 'clear':
            calc.displayValue = '0';
            calc.firstOperand = null;
            calc.operator = null;
            calc.waitingForSecondOperand = false;
            updateOperatorButtons(null);
            break;
        case 'negate':
            calc.displayValue = String(-parseFloat(calc.displayValue));
            break;
        case 'percent':
            calc.displayValue = String(parseFloat(calc.displayValue) / 100);
            break;
    }

    // Format display
    let displayText = calc.displayValue;
    if (displayText.length > 10) {
        const num = parseFloat(displayText);
        displayText = num.toPrecision(8);
    }
    display.textContent = displayText;
}

function performCalc(first, second, op) {
    switch (op) {
        case '+': return first + second;
        case '−': return first - second;
        case '×': return first * second;
        case '÷': return second !== 0 ? first / second : 'Error';
        default: return second;
    }
}

function updateOperatorButtons(activeOp) {
    document.querySelectorAll('.calc-btn.operator').forEach(btn => {
        if (btn.dataset.op === activeOp) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function openNotes() {
    const notes = [
        { title: 'Meeting Notes', preview: 'Discussed Q1 roadmap and priorities...', date: 'Today' },
        { title: 'Shopping List', preview: 'Milk, eggs, bread, butter, apples...', date: 'Yesterday' },
        { title: 'Project Ideas', preview: 'Build a macOS web replica with full...', date: 'Feb 10' },
        { title: 'Book Recommendations', preview: 'The Design of Everyday Things...', date: 'Feb 8' },
        { title: 'Recipe - Pasta', preview: 'Ingredients: 400g spaghetti, olive oil...', date: 'Feb 5' },
    ];

    const listHTML = notes.map((n, i) => `
        <div class="notes-list-item ${i === 0 ? 'active' : ''}" onclick="selectNote(this)">
            <div class="notes-list-title">${n.title}</div>
            <div class="notes-list-date">${n.date}</div>
            <div class="notes-list-preview">${n.preview}</div>
        </div>
    `).join('');

    const content = `
        <div class="notes-app">
            <div class="notes-sidebar">
                <div class="notes-sidebar-header">
                    <h3>Notes</h3>
                    <button class="notes-new-btn" title="New Note">+</button>
                </div>
                <div class="notes-list">${listHTML}</div>
            </div>
            <div class="notes-editor">
                <input type="text" class="notes-editor-title" value="Meeting Notes" placeholder="Title">
                <textarea class="notes-editor-body" placeholder="Start typing...">Discussed Q1 roadmap and priorities for the team. Key takeaways:\n\n• Focus on performance improvements\n• Ship v2.0 by end of March\n• Hire two more engineers\n• Weekly design reviews starting next Monday\n\nAction items:\n- Set up project board\n- Schedule kickoff meeting\n- Review technical spec document</textarea>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Notes',
        appName: 'Notes',
        appType: 'notes',
        width: 800,
        height: 550,
        content
    });
}

function selectNote(el) {
    el.parentElement.querySelectorAll('.notes-list-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

function openTerminal() {
    const content = `
        <div class="terminal-app">
            <div class="terminal-body" id="terminal-body">
                <div class="terminal-output">Last login: Thu Feb 13 09:41:00 on ttys000</div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt">user@MacBook-Pro ~ % </span>
                    <input type="text" class="terminal-input" id="terminal-input" autofocus spellcheck="false">
                </div>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Terminal',
        appName: 'Terminal',
        appType: 'terminal',
        width: 650,
        height: 420,
        content
    });

    // Setup terminal input
    setTimeout(() => {
        const input = document.getElementById('terminal-input');
        if (input) {
            input.focus();
            input.addEventListener('keydown', handleTerminalInput);
        }
    }, 300);
}

function handleTerminalInput(e) {
    if (e.key !== 'Enter') return;
    const input = e.target;
    const command = input.value.trim();
    const body = document.getElementById('terminal-body');
    if (!body) return;

    // Remove the input line
    const inputLine = input.closest('.terminal-input-line');
    const commandDisplay = document.createElement('div');
    commandDisplay.className = 'terminal-line';
    commandDisplay.innerHTML = `<span class="terminal-prompt">user@MacBook-Pro ~ % </span><span class="terminal-command">${command}</span>`;
    inputLine.replaceWith(commandDisplay);

    // Process command
    let output = '';
    const cmd = command.toLowerCase().split(' ')[0];
    const args = command.split(' ').slice(1).join(' ');

    switch (cmd) {
        case '':
            break;
        case 'ls':
            output = 'Applications  Desktop  Documents  Downloads  Library  Movies  Music  Pictures  Public';
            break;
        case 'pwd':
            output = '/Users/user';
            break;
        case 'whoami':
            output = 'user';
            break;
        case 'date':
            output = new Date().toString();
            break;
        case 'echo':
            output = args;
            break;
        case 'uname':
            output = args === '-a' ? 'Darwin MacBook-Pro.local 23.3.0 Darwin Kernel Version 23.3.0 RELEASE_ARM64_T6031 arm64' : 'Darwin';
            break;
        case 'sw_vers':
            output = 'ProductName:\t\tmacOS\nProductVersion:\t\t14.3.1\nBuildVersion:\t\t23D60';
            break;
        case 'cal':
            output = generateCalendar();
            break;
        case 'uptime':
            output = ' 9:41  up 3 days, 14:23, 2 users, load averages: 1.82 1.65 1.71';
            break;
        case 'clear':
            body.innerHTML = '';
            break;
        case 'neofetch':
            output = `                    'c.          user@MacBook-Pro
                 ,xNMM.          -------------------
               .OMMMMo           OS: macOS 14.3.1 23D60 arm64
               OMMM0,            Host: MacBook Pro (14-inch, 2023)
     .;loddo:' loolloddol;.     Kernel: 23.3.0
   cKMMMMMMMMMMNWMMMMMMMMMM0:   Uptime: 3 days, 14 hours
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.   Shell: zsh 5.9
 XMMMMMMMMMMMMMMMMMMMMMMMX.     Resolution: 3024x1964
;MMMMMMMMMMMMMMMMMMMMMMMM:      DE: Aqua
:MMMMMMMMMMMMMMMMMMMMMMMM:      WM: Quartz Compositor
.MMMMMMMMMMMMMMMMMMMMMMMMX.     Terminal: Terminal.app
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.   CPU: Apple M3 Pro
 .XMMMMMMMMMMMMMMMMMMMMMMMMk    Memory: 8192MiB / 18432MiB
  .XMMMMMMMMMMMMMMMMMMMMK.
    kMMMMMMMMMMMMMMMMMMd.
     ;KMMMMMMMWXXWMMMMMk.
       .cooc,.    .,coo:.`;
            break;
        case 'help':
            output = 'Available commands: ls, pwd, whoami, date, echo, uname, sw_vers, cal, uptime, clear, neofetch, help';
            break;
        default:
            output = `zsh: command not found: ${cmd}`;
    }

    if (output && cmd !== 'clear') {
        const outputEl = document.createElement('div');
        outputEl.className = 'terminal-output';
        outputEl.textContent = output;
        body.appendChild(outputEl);
    }

    // New input line
    const newInputLine = document.createElement('div');
    newInputLine.className = 'terminal-input-line';
    newInputLine.innerHTML = `<span class="terminal-prompt">user@MacBook-Pro ~ % </span><input type="text" class="terminal-input" id="terminal-input" autofocus spellcheck="false">`;
    body.appendChild(newInputLine);

    const newInput = newInputLine.querySelector('.terminal-input');
    newInput.addEventListener('keydown', handleTerminalInput);
    newInput.focus();
    body.scrollTop = body.scrollHeight;
}

function generateCalendar() {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear();
    const firstDay = new Date(year, now.getMonth(), 1).getDay();
    const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
    const today = now.getDate();

    let cal = `    ${month} ${year}\nSu Mo Tu We Th Fr Sa\n`;
    let line = '   '.repeat(firstDay);
    for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = d < 10 ? ` ${d}` : `${d}`;
        line += (d === today ? `[${dayStr}]` : ` ${dayStr} `).substring(0, 3);
        if ((firstDay + d) % 7 === 0) {
            cal += line + '\n';
            line = '';
        }
    }
    if (line) cal += line;
    return cal;
}

function openSettings() {
    const navItems = [
        { icon: '#007AFF', label: 'Wi-Fi', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>' },
        { icon: '#007AFF', label: 'Bluetooth', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29z"/></svg>' },
        { icon: '#007AFF', label: 'Network', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>' },
        { sep: true },
        { icon: '#FF3B30', label: 'Notifications', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>' },
        { icon: '#FF3B30', label: 'Sound', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>' },
        { icon: '#5856D6', label: 'Focus', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>' },
        { sep: true },
        { icon: '#8E8E93', label: 'General', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>' },
        { icon: '#34C759', label: 'Appearance', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/></svg>' },
        { icon: '#007AFF', label: 'Accessibility', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>' },
        { sep: true },
        { icon: '#FF9500', label: 'Privacy & Security', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>' },
        { icon: '#007AFF', label: 'Desktop & Dock', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>' },
        { icon: '#5856D6', label: 'Displays', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>' },
        { icon: '#34C759', label: 'Battery', svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>' },
    ];

    const navHTML = navItems.map(item => {
        if (item.sep) return '<div class="settings-nav-separator"></div>';
        return `<div class="settings-nav-item" onclick="selectSettingsNav(this)">
            <div class="settings-nav-icon" style="background:${item.icon}">${item.svg}</div>
            <span>${item.label}</span>
        </div>`;
    }).join('');

    const content = `
        <div class="settings-app">
            <div class="settings-sidebar">
                <input type="text" class="settings-search" placeholder="Search">
                <div class="settings-profile active" onclick="selectSettingsNav(this)">
                    <div class="settings-profile-avatar">
                        <svg viewBox="0 0 100 100" width="48" height="48"><circle cx="50" cy="50" r="50" fill="#c7c7cc"/><circle cx="50" cy="38" r="18" fill="#e5e5ea"/><ellipse cx="50" cy="80" rx="30" ry="22" fill="#e5e5ea"/></svg>
                    </div>
                    <div class="settings-profile-info">
                        <div class="settings-profile-name">User</div>
                        <div class="settings-profile-subtitle">Apple ID, iCloud+, Media & Purchases</div>
                    </div>
                </div>
                ${navHTML}
            </div>
            <div class="settings-content">
                <h2>Apple ID</h2>
                <div class="settings-group">
                    <div class="settings-row">
                        <span>Name, Phone Numbers, Email</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#c7c7cc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </div>
                    <div class="settings-row">
                        <span>Password & Security</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#c7c7cc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </div>
                    <div class="settings-row">
                        <span>iCloud</span>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="color:#86868b;font-size:12px;">5 GB of 5 GB used</span>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="#c7c7cc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                        </div>
                    </div>
                    <div class="settings-row">
                        <span>Media & Purchases</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#c7c7cc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </div>
                </div>
                <div class="settings-group">
                    <div class="settings-row">
                        <span>Family Sharing</span>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="color:#86868b;font-size:12px;">Set Up</span>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="#c7c7cc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                        </div>
                    </div>
                </div>
                <div class="settings-group">
                    <div class="settings-row">
                        <span>Devices</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#c7c7cc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </div>
                </div>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'System Settings',
        appName: 'System Settings',
        appType: 'settings',
        width: 920,
        height: 600,
        content
    });
}

function selectSettingsNav(el) {
    const sidebar = el.closest('.settings-sidebar');
    sidebar.querySelectorAll('.settings-nav-item, .settings-profile').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

function openMessages() {
    const contacts = [
        { name: 'John', initial: 'J', color: '#007AFF', preview: 'Hey, are we still on for tomorrow?', time: '9:30 AM' },
        { name: 'Sarah', initial: 'S', color: '#FF3B30', preview: 'Thanks for sending that over!', time: 'Yesterday' },
        { name: 'Mike', initial: 'M', color: '#34C759', preview: 'The project is looking great 👍', time: 'Tuesday' },
        { name: 'Emma', initial: 'E', color: '#FF9500', preview: 'Can you review the PR?', time: 'Monday' },
    ];

    const listHTML = contacts.map((c, i) => `
        <div class="messages-list-item ${i === 0 ? 'active' : ''}" onclick="selectMessage(this, '${c.name}')">
            <div class="messages-avatar" style="background:${c.color}">${c.initial}</div>
            <div class="messages-item-info">
                <div class="messages-item-name">${c.name}</div>
                <div class="messages-item-preview">${c.preview}</div>
            </div>
            <div class="messages-item-time">${c.time}</div>
        </div>
    `).join('');

    const content = `
        <div class="messages-app">
            <div class="messages-sidebar">
                <div class="messages-search-bar">
                    <input type="text" placeholder="Search">
                </div>
                <div class="messages-list">${listHTML}</div>
            </div>
            <div class="messages-chat">
                <div class="messages-chat-header">John</div>
                <div class="messages-chat-body">
                    <div class="message-bubble received">Hey! How's the project going?</div>
                    <div class="message-bubble sent">Going really well! Almost done with the frontend.</div>
                    <div class="message-bubble received">That's awesome! Can't wait to see it.</div>
                    <div class="message-bubble sent">I'll send you a preview tonight 🎉</div>
                    <div class="message-bubble received">Hey, are we still on for tomorrow?</div>
                </div>
                <div class="messages-input-bar">
                    <input type="text" class="messages-input" placeholder="iMessage">
                </div>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Messages',
        appName: 'Messages',
        appType: 'messages',
        width: 800,
        height: 550,
        content
    });
}

function selectMessage(el, name) {
    el.parentElement.querySelectorAll('.messages-list-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

function openMail() {
    const emails = [
        { sender: 'Apple', subject: 'Your Apple ID was used to sign in', preview: 'Your Apple ID (user@icloud.com) was used to sign in to iCloud via a web browser.', time: '9:15 AM', unread: true },
        { sender: 'GitHub', subject: 'Security alert: new sign-in', preview: 'We noticed a new sign-in to your GitHub account from a device we don\'t recognize.', time: '8:42 AM', unread: true },
        { sender: 'Sarah Johnson', subject: 'Re: Project Update', preview: 'Thanks for the update! Everything looks good. Let me know if you need anything else.', time: 'Yesterday' },
        { sender: 'LinkedIn', subject: 'You have 5 new connection requests', preview: 'Accept connection requests from people you know to grow your network.', time: 'Yesterday' },
        { sender: 'Team Slack', subject: 'Digest for #engineering', preview: 'Here\'s what you missed in #engineering today...', time: 'Monday' },
    ];

    const listHTML = emails.map((e, i) => `
        <div class="mail-list-item ${i === 0 ? 'active' : ''}">
            <span class="mail-list-time">${e.time}</span>
            <div class="mail-list-sender" style="${e.unread ? 'color:var(--accent-color)' : ''}">${e.unread ? '● ' : ''}${e.sender}</div>
            <div class="mail-list-subject">${e.subject}</div>
            <div class="mail-list-preview">${e.preview}</div>
        </div>
    `).join('');

    const content = `
        <div class="mail-app">
            <div class="mail-sidebar">
                <div class="mail-folder active">
                    <span class="mail-folder-icon">📥</span>
                    <span>Inbox</span>
                    <span class="mail-folder-badge">2</span>
                </div>
                <div class="mail-folder">
                    <span class="mail-folder-icon">📤</span>
                    <span>Sent</span>
                </div>
                <div class="mail-folder">
                    <span class="mail-folder-icon">📝</span>
                    <span>Drafts</span>
                </div>
                <div class="mail-folder">
                    <span class="mail-folder-icon">⭐</span>
                    <span>Flagged</span>
                </div>
                <div class="mail-folder">
                    <span class="mail-folder-icon">🗑️</span>
                    <span>Trash</span>
                </div>
                <div class="mail-folder">
                    <span class="mail-folder-icon">📦</span>
                    <span>Archive</span>
                </div>
                <div class="mail-folder">
                    <span class="mail-folder-icon">🚫</span>
                    <span>Junk</span>
                </div>
            </div>
            <div class="mail-list">${listHTML}</div>
            <div class="mail-detail">
                <div class="mail-detail-header">
                    <div class="mail-detail-subject">Your Apple ID was used to sign in</div>
                    <div class="mail-detail-from">From: Apple &lt;no-reply@apple.com&gt;<br>To: user@icloud.com<br>Date: Today at 9:15 AM</div>
                </div>
                <div class="mail-detail-body">
                    <p>Dear User,</p>
                    <p>Your Apple ID (user@icloud.com) was used to sign in to iCloud via a web browser.</p>
                    <p><strong>Date and Time:</strong> February 13, 2026 at 9:15 AM PST</p>
                    <p><strong>Operating System:</strong> macOS Sonoma</p>
                    <p>If you recently signed in to iCloud, you can disregard this email. If you didn't sign in recently and believe someone may have accessed your account, go to Apple ID (https://appleid.apple.com) and change your password as soon as possible.</p>
                    <p>Regards,<br>Apple Support</p>
                </div>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Mail - Inbox',
        appName: 'Mail',
        appType: 'mail',
        width: 1000,
        height: 600,
        content
    });
}

function openMaps() {
    const content = `
        <div class="maps-app">
            <div class="maps-toolbar">
                <input type="text" class="maps-search" placeholder="Search Maps">
                <button class="safari-nav-btn" title="Current Location"><svg viewBox="0 0 24 24" width="16" height="16" fill="#007AFF"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></button>
            </div>
            <div class="maps-content">
                <div class="maps-grid"></div>
                <div class="maps-road horizontal"></div>
                <div class="maps-road vertical"></div>
                <div class="maps-road highway horizontal"></div>
                <div class="maps-road highway vertical"></div>
                <div class="maps-pin">📍</div>
                <div style="position:absolute;bottom:12px;right:12px;background:rgba(255,255,255,0.9);backdrop-filter:blur(10px);padding:6px 12px;border-radius:8px;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    Apple Park, Cupertino, CA
                </div>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Maps',
        appName: 'Maps',
        appType: 'maps',
        width: 850,
        height: 550,
        content
    });
}

function openPhotos() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
        '#F1948A', '#AED6F1', '#A3E4D7', '#FAD7A0', '#D7BDE2', '#A9CCE3',
        '#F9E79F', '#ABEBC6', '#F5B7B1', '#D5F5E3', '#FADBD8', '#D4E6F1'
    ];

    const photosHTML = colors.map(c => `
        <div class="photos-grid-item" style="background:${c};"></div>
    `).join('');

    const content = `
        <div class="photos-app">
            <div class="photos-sidebar">
                <div class="photos-nav-item active">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>
                    <span>Library</span>
                </div>
                <div class="photos-nav-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <span>Memories</span>
                </div>
                <div class="photos-nav-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/></svg>
                    <span>People</span>
                </div>
                <div class="photos-nav-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                    <span>Places</span>
                </div>
                <div class="photos-nav-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <span>Favorites</span>
                </div>
                <div class="photos-nav-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>
                    <span>Albums</span>
                </div>
            </div>
            <div class="photos-content">
                <h2 style="font-size:22px;font-weight:700;margin-bottom:16px;">Library</h2>
                <div class="photos-grid">${photosHTML}</div>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Photos',
        appName: 'Photos',
        appType: 'photos',
        width: 900,
        height: 600,
        content
    });
}

function openTrash() {
    const content = `
        <div class="trash-app">
            <div class="trash-empty">
                <svg viewBox="0 0 120 120" width="80" height="80">
                    <rect x="35" y="35" width="50" height="55" rx="3" fill="none" stroke="#c7c7cc" stroke-width="3"/>
                    <rect x="30" y="28" width="60" height="8" rx="3" fill="none" stroke="#c7c7cc" stroke-width="3"/>
                    <rect x="48" y="22" width="24" height="8" rx="3" fill="none" stroke="#c7c7cc" stroke-width="3"/>
                    <line x1="48" y1="48" x2="48" y2="80" stroke="#c7c7cc" stroke-width="2"/>
                    <line x1="60" y1="48" x2="60" y2="80" stroke="#c7c7cc" stroke-width="2"/>
                    <line x1="72" y1="48" x2="72" y2="80" stroke="#c7c7cc" stroke-width="2"/>
                </svg>
                <span>Trash is Empty</span>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Trash',
        appName: 'Finder',
        appType: 'trash',
        width: 600,
        height: 400,
        content
    });
}

function openLaunchpad() {
    // Remove existing launchpad if any
    const existing = document.querySelector('.launchpad-overlay');
    if (existing) { existing.remove(); return; }

    const apps = [
        { name: 'Finder', app: 'finder', color: '#2196F3' },
        { name: 'Safari', app: 'safari', color: '#2F80ED' },
        { name: 'Messages', app: 'messages', color: '#28CD41' },
        { name: 'Mail', app: 'mail', color: '#007AFF' },
        { name: 'Maps', app: 'maps', color: '#3DDC84' },
        { name: 'Photos', app: 'photos', color: '#FF3B30' },
        { name: 'Notes', app: 'notes', color: '#FFD60A' },
        { name: 'Calculator', app: 'calculator', color: '#333' },
        { name: 'Terminal', app: 'terminal', color: '#1C1C1E' },
        { name: 'Settings', app: 'settings', color: '#8E8E93' },
        { name: 'TextEdit', app: 'textedit', color: '#007AFF' },
        { name: 'Calendar', app: 'calendar', color: '#FF3B30' },
        { name: 'App Store', app: '', color: '#007AFF' },
        { name: 'Music', app: '', color: '#FF2D55' },
    ];

    const appsHTML = apps.map(a => `
        <div class="launchpad-item" onclick="document.querySelector('.launchpad-overlay').remove(); ${a.app ? `openApp('${a.app}')` : ''}">
            <svg viewBox="0 0 120 120" width="72" height="72"><rect x="5" y="5" width="110" height="110" rx="24" fill="${a.color}"/>
            <text x="60" y="70" text-anchor="middle" fill="white" font-size="36" font-weight="600" font-family="Inter,sans-serif">${a.name[0]}</text></svg>
            <div class="launchpad-item-name">${a.name}</div>
        </div>
    `).join('');

    const overlay = document.createElement('div');
    overlay.className = 'launchpad-overlay';
    overlay.innerHTML = `
        <input type="text" class="launchpad-search" placeholder="Search">
        <div class="launchpad-grid">${appsHTML}</div>
    `;

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    document.getElementById('desktop').appendChild(overlay);
}

function openTextEdit() {
    const content = `
        <div class="textedit-app">
            <div class="textedit-toolbar">
                <button class="textedit-toolbar-btn" onclick="document.execCommand('bold')"><strong>B</strong></button>
                <button class="textedit-toolbar-btn" onclick="document.execCommand('italic')"><em>I</em></button>
                <button class="textedit-toolbar-btn" onclick="document.execCommand('underline')"><u>U</u></button>
                <span style="width:1px;height:20px;background:rgba(0,0,0,0.1);margin:0 4px"></span>
                <button class="textedit-toolbar-btn" onclick="document.execCommand('justifyLeft')">⬅</button>
                <button class="textedit-toolbar-btn" onclick="document.execCommand('justifyCenter')">⬛</button>
                <button class="textedit-toolbar-btn" onclick="document.execCommand('justifyRight')">➡</button>
            </div>
            <div class="textedit-body" contenteditable="true" spellcheck="true">
                <p>Welcome to TextEdit. Start typing to create a new document.</p>
            </div>
        </div>
    `;

    WindowManager.createWindow({
        title: 'Untitled',
        appName: 'TextEdit',
        appType: 'textedit',
        width: 650,
        height: 500,
        content
    });
}

function openCalendar() {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const content = `
        <div style="display:flex;height:100%;">
            <div style="width:200px;background:rgba(246,246,246,0.95);border-right:0.5px solid rgba(0,0,0,0.1);padding:12px;">
                <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Calendars</div>
                <div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;">
                    <div style="width:12px;height:12px;border-radius:3px;background:#007AFF;"></div> Home
                </div>
                <div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;">
                    <div style="width:12px;height:12px;border-radius:3px;background:#34C759;"></div> Work
                </div>
                <div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;">
                    <div style="width:12px;height:12px;border-radius:3px;background:#FF9500;"></div> Family
                </div>
            </div>
            <div style="flex:1;padding:20px;background:white;">
                <div style="text-align:center;margin-bottom:20px;">
                    <h2 style="font-size:22px;font-weight:700;">${month}</h2>
                </div>
                <div id="calendar-main-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;"></div>
            </div>
        </div>
    `;

    const winId = WindowManager.createWindow({
        title: 'Calendar',
        appName: 'Calendar',
        appType: 'calendar',
        width: 800,
        height: 600,
        content
    });

    // Populate calendar
    setTimeout(() => {
        const grid = document.getElementById('calendar-main-grid');
        if (!grid) return;
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(d => {
            const el = document.createElement('div');
            el.style.cssText = 'padding:8px;font-size:11px;font-weight:600;color:#86868b;';
            el.textContent = d;
            grid.appendChild(el);
        });

        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();

        // Previous month filler
        for (let i = firstDay - 1; i >= 0; i--) {
            const el = document.createElement('div');
            el.style.cssText = 'padding:12px 8px;font-size:14px;color:#c7c7cc;';
            el.textContent = prevMonthDays - i;
            grid.appendChild(el);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const el = document.createElement('div');
            const isToday = d === now.getDate();
            el.style.cssText = `padding:12px 8px;font-size:14px;cursor:default;border-radius:50%;margin:2px auto;width:36px;height:36px;display:flex;align-items:center;justify-content:center;${isToday ? 'background:#007AFF;color:white;font-weight:600;' : ''}`;
            el.textContent = d;
            grid.appendChild(el);
        }
    }, 100);
}
