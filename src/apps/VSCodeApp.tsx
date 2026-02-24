// VS Code - Code editor with Python syntax highlighting, execution, and macOS VFS integration
const VSCodeApp = () => {
    const [files, setFiles] = React.useState(() => {
        try {
            const saved = localStorage.getItem('macos_vscode_files');
            if (saved) return JSON.parse(saved);
        } catch(e) {}
        return [
            { name: 'main.py', content: '# Welcome to VS Code\n# Write Python code here and click Run!\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\nprint("2 + 2 =", 2 + 2)\n\n# Try some Python:\nfor i in range(5):\n    print(f"Count: {i}")\n' },
            { name: 'utils.py', content: '# Utility functions\n\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\ndef fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint("5! =", factorial(5))\nprint("Fibonacci:", fibonacci(10))\n' },
            { name: 'game.py', content: '# Simple text game\nimport random\n\ndef guess_game():\n    number = random.randint(1, 100)\n    print("Guess a number between 1 and 100!")\n    for attempt in range(7):\n        guess = int(input(f"Attempt {attempt+1}: "))\n        if guess == number:\n            print(f"You got it in {attempt+1} tries!")\n            return\n        print("Too high!" if guess > number else "Too low!")\n    print(f"Game over! It was {number}")\n\nguess_game()\n' },
        ];
    });
    const [activeFile, setActiveFile] = React.useState(0);
    const [output, setOutput] = React.useState('');
    const [showOutput, setShowOutput] = React.useState(false);
    const [running, setRunning] = React.useState(false);
    const [showNewFile, setShowNewFile] = React.useState(false);
    const [newFileName, setNewFileName] = React.useState('');
    const [showSaveDialog, setShowSaveDialog] = React.useState(false);
    const [savePath, setSavePath] = React.useState('/Users/user/Desktop');
    const [saveFileName, setSaveFileName] = React.useState('');
    const [showOpenDialog, setShowOpenDialog] = React.useState(false);
    const [openPath, setOpenPath] = React.useState('/Users/user/Desktop');
    const textareaRef = React.useRef(null);
    const loadedPending = React.useRef(false);
    const vfsVersion = useStore(s => s.vfsVersion);

    // Load pending file from Desktop/Finder double-click
    React.useEffect(() => {
        if (loadedPending.current) return;
        loadedPending.current = true;
        const state = MacStore.getState();
        if (state.pendingOpenFile) {
            const { path, name } = state.pendingOpenFile;
            MacStore.setState({ pendingOpenFile: null });
            const fullPath = path + '/' + name;
            const content = VFS.readFile(fullPath);
            if (content !== null) {
                const existing = files.findIndex(f => f.name === name);
                if (existing >= 0) {
                    const updated = [...files];
                    updated[existing] = { ...updated[existing], content, vfsPath: path };
                    saveFiles(updated);
                    setActiveFile(existing);
                } else {
                    const updated = [...files, { name, content, vfsPath: path }];
                    saveFiles(updated);
                    setActiveFile(updated.length - 1);
                }
            }
        }
    }, []);

    const saveFiles = (f) => {
        setFiles(f);
        localStorage.setItem('macos_vscode_files', JSON.stringify(f));
    };

    const updateContent = (content) => {
        const updated = [...files];
        updated[activeFile] = { ...updated[activeFile], content };
        saveFiles(updated);
    };

    const createFile = () => {
        let name = newFileName.trim();
        if (!name) return;
        if (!name.endsWith('.py')) name += '.py';
        if (files.some(f => f.name === name)) return;
        const updated = [...files, { name, content: '# ' + name + '\n\n' }];
        saveFiles(updated);
        setActiveFile(updated.length - 1);
        setShowNewFile(false);
        setNewFileName('');
    };

    const deleteFile = (idx) => {
        if (files.length <= 1) return;
        const updated = files.filter((_, i) => i !== idx);
        saveFiles(updated);
        if (activeFile >= updated.length) setActiveFile(updated.length - 1);
        else if (activeFile === idx) setActiveFile(0);
    };

    // Save To Mac dialog
    const openSaveDialog = () => {
        const f = files[activeFile];
        setSaveFileName(f.name);
        setSavePath(f.vfsPath || '/Users/user/Desktop');
        setShowSaveDialog(true);
    };

    const saveToMac = () => {
        const content = files[activeFile].content;
        const fn = saveFileName.trim() || 'untitled.py';
        VFS.touch(savePath, fn, content, '📝');
        // Update file's vfsPath for future saves
        const updated = [...files];
        updated[activeFile] = { ...updated[activeFile], name: fn, vfsPath: savePath };
        saveFiles(updated);
        MacStore.addNotification('VS Code', 'File Saved', fn + ' saved to ' + savePath.replace('/Users/user', '~'));
        setShowSaveDialog(false);
    };

    // Open From Mac dialog
    const openFromMac = () => {
        setOpenPath('/Users/user/Desktop');
        setShowOpenDialog(true);
    };

    const loadFileFromVFS = (path, name) => {
        const fullPath = path + '/' + name;
        const content = VFS.readFile(fullPath);
        if (content === null) return;
        const existing = files.findIndex(f => f.name === name);
        if (existing >= 0) {
            const updated = [...files];
            updated[existing] = { ...updated[existing], content, vfsPath: path };
            saveFiles(updated);
            setActiveFile(existing);
        } else {
            const updated = [...files, { name, content, vfsPath: path }];
            saveFiles(updated);
            setActiveFile(updated.length - 1);
        }
        setShowOpenDialog(false);
    };

    // Quick save — if file has a vfsPath, save directly
    const quickSave = () => {
        const f = files[activeFile];
        if (f.vfsPath) {
            VFS.touch(f.vfsPath, f.name, f.content, '📝');
            MacStore.addNotification('VS Code', 'Saved', f.name + ' saved.');
        } else {
            openSaveDialog();
        }
    };

    // Simple Python interpreter (subset)
    const runPython = (code) => {
        setRunning(true);
        setShowOutput(true);
        let out = [];
        try {
            const env = {};
            const lines = code.split('\n');

            const evalExpr = (expr) => {
                expr = expr.trim();
                if (expr.startsWith('f"') || expr.startsWith("f'")) {
                    const q = expr[1];
                    const inner = expr.slice(2, expr.lastIndexOf(q));
                    return inner.replace(/\{([^}]+)\}/g, (_, e) => {
                        try { return evalExpr(e); } catch(e2) { return ''; }
                    });
                }
                if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'")))
                    return expr.slice(1, -1);
                if (expr.startsWith('[') && expr.endsWith(']')) {
                    const inner = expr.slice(1, -1).trim();
                    if (!inner) return [];
                    return inner.split(',').map(e => evalExpr(e.trim()));
                }
                if (expr === 'True') return true;
                if (expr === 'False') return false;
                if (expr === 'None') return null;
                if (!isNaN(expr) && expr !== '') return Number(expr);
                if (env[expr] !== undefined) return env[expr];
                const rangeMatch = expr.match(/^range\((.+)\)$/);
                if (rangeMatch) {
                    const args = rangeMatch[1].split(',').map(a => evalExpr(a.trim()));
                    const arr = [];
                    const start = args.length > 1 ? args[0] : 0;
                    const end = args.length > 1 ? args[1] : args[0];
                    const step = args[2] || 1;
                    for (let j = start; j < end; j += step) arr.push(j);
                    return arr;
                }
                const lenMatch = expr.match(/^len\((.+)\)$/);
                if (lenMatch) { const v = evalExpr(lenMatch[1]); return Array.isArray(v) ? v.length : String(v).length; }
                const intMatch = expr.match(/^int\((.+)\)$/);
                if (intMatch) return parseInt(evalExpr(intMatch[1]));
                const strMatch = expr.match(/^str\((.+)\)$/);
                if (strMatch) return String(evalExpr(strMatch[1]));
                const absMatch = expr.match(/^abs\((.+)\)$/);
                if (absMatch) return Math.abs(evalExpr(absMatch[1]));
                const maxMatch = expr.match(/^max\((.+)\)$/);
                if (maxMatch) { const args = maxMatch[1].split(',').map(a => evalExpr(a.trim())); return Math.max(...args); }
                const minMatch = expr.match(/^min\((.+)\)$/);
                if (minMatch) { const args = minMatch[1].split(',').map(a => evalExpr(a.trim())); return Math.min(...args); }
                const sumMatch = expr.match(/^sum\((.+)\)$/);
                if (sumMatch) { const v = evalExpr(sumMatch[1]); return Array.isArray(v) ? v.reduce((a,b)=>a+b,0) : 0; }
                const typeMatch = expr.match(/^type\((.+)\)$/);
                if (typeMatch) { const v = evalExpr(typeMatch[1]); return `<class '${typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'float') : typeof v === 'string' ? 'str' : Array.isArray(v) ? 'list' : typeof v === 'boolean' ? 'bool' : 'NoneType'}'>`; }
                const fnCallMatch = expr.match(/^(\w+)\((.*)?\)$/);
                if (fnCallMatch && env['__fn_' + fnCallMatch[1]]) {
                    const fn = env['__fn_' + fnCallMatch[1]];
                    const args = fnCallMatch[2] ? fnCallMatch[2].split(',').map(a => evalExpr(a.trim())) : [];
                    return fn(args);
                }
                const appendMatch = expr.match(/^(\w+)\.append\((.+)\)$/);
                if (appendMatch && Array.isArray(env[appendMatch[1]])) {
                    env[appendMatch[1]].push(evalExpr(appendMatch[2]));
                    return undefined;
                }
                if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/') || expr.includes('%') || expr.includes('**')) {
                    try {
                        const jsExpr = expr.replace(/\b([a-zA-Z_]\w*)\b/g, (m) => {
                            if (env[m] !== undefined) {
                                const v = env[m];
                                return typeof v === 'string' ? JSON.stringify(v) : String(v);
                            }
                            return m;
                        }).replace('**', '**').replace('//', '|0)//(');
                        const result = new Function('return ' + jsExpr.replace('**', '**'))();
                        return result;
                    } catch(e3) {}
                }
                if (expr.includes('==') || expr.includes('!=') || expr.includes('<=') || expr.includes('>=') || expr.includes('<') || expr.includes('>')) {
                    try {
                        const jsExpr = expr.replace(/\b([a-zA-Z_]\w*)\b/g, (m) => {
                            if (env[m] !== undefined) return typeof env[m] === 'string' ? JSON.stringify(env[m]) : String(env[m]);
                            return m;
                        });
                        return new Function('return ' + jsExpr)();
                    } catch(e4) {}
                }
                return expr;
            };

            const getIndent = (line) => { const m = line.match(/^(\s*)/); return m ? m[1].length : 0; };

            const execBlock = (startIdx, endIdx, baseIndent) => {
                let idx = startIdx;
                while (idx < endIdx) {
                    const line = lines[idx];
                    const trimmed = line.trim();
                    const indent = getIndent(line);

                    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('import ') || trimmed.startsWith('from ')) { idx++; continue; }
                    if (indent < baseIndent) break;

                    const printMatch = trimmed.match(/^print\((.*)?\)$/);
                    if (printMatch) {
                        const args = [];
                        if (printMatch[1]) {
                            let depth = 0, current = '', inStr = false, strChar = '';
                            for (const ch of printMatch[1]) {
                                if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strChar = ch; current += ch; }
                                else if (inStr && ch === strChar) { inStr = false; current += ch; }
                                else if (!inStr && (ch === '(' || ch === '[')) { depth++; current += ch; }
                                else if (!inStr && (ch === ')' || ch === ']')) { depth--; current += ch; }
                                else if (!inStr && ch === ',' && depth === 0) { args.push(current.trim()); current = ''; }
                                else current += ch;
                            }
                            if (current.trim()) args.push(current.trim());
                        }
                        const vals = args.map(a => evalExpr(a));
                        out.push(vals.map(v => Array.isArray(v) ? '[' + v.join(', ') + ']' : String(v)).join(' '));
                        idx++; continue;
                    }

                    const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
                    if (assignMatch && !trimmed.includes('==')) {
                        env[assignMatch[1]] = evalExpr(assignMatch[2]);
                        idx++; continue;
                    }

                    const multiAssign = trimmed.match(/^(\w+)\s*,\s*(\w+)\s*=\s*(.+)$/);
                    if (multiAssign) {
                        const vals = multiAssign[3].split(',').map(v => evalExpr(v.trim()));
                        env[multiAssign[1]] = vals[0];
                        env[multiAssign[2]] = vals[1];
                        idx++; continue;
                    }

                    const defMatch = trimmed.match(/^def\s+(\w+)\((.*?)\):$/);
                    if (defMatch) {
                        const fnName = defMatch[1];
                        const params = defMatch[2] ? defMatch[2].split(',').map(p => p.trim()) : [];
                        const bodyStart = idx + 1;
                        const fnIndent = indent + 4;
                        let bodyEnd = bodyStart;
                        while (bodyEnd < endIdx && (getIndent(lines[bodyEnd]) >= fnIndent || !lines[bodyEnd].trim())) bodyEnd++;
                        const bodyLines = lines.slice(bodyStart, bodyEnd);
                        env['__fn_' + fnName] = (args) => {
                            const savedEnv = { ...env };
                            params.forEach((p, pi) => { env[p] = args[pi]; });
                            let retVal = undefined;
                            for (let bi = 0; bi < bodyLines.length; bi++) {
                                const bl = bodyLines[bi].trim();
                                if (!bl || bl.startsWith('#')) continue;
                                const retMatch = bl.match(/^return\s+(.+)$/);
                                if (retMatch) { retVal = evalExpr(retMatch[1]); break; }
                                const bPrint = bl.match(/^print\((.*)?\)$/);
                                if (bPrint) {
                                    const pArgs = bPrint[1] ? bPrint[1].split(',').map(a => evalExpr(a.trim())) : [];
                                    out.push(pArgs.map(v => Array.isArray(v) ? '[' + v.join(', ') + ']' : String(v)).join(' '));
                                    continue;
                                }
                                const bAssign = bl.match(/^(\w+)\s*=\s*(.+)$/);
                                if (bAssign) { env[bAssign[1]] = evalExpr(bAssign[2]); continue; }
                                const bAppend = bl.match(/^(\w+)\.append\((.+)\)$/);
                                if (bAppend && Array.isArray(env[bAppend[1]])) { env[bAppend[1]].push(evalExpr(bAppend[2])); continue; }
                                const bFor = bl.match(/^for\s+(\w+)\s+in\s+(.+):$/);
                                if (bFor) {
                                    const iter = evalExpr(bFor[2]);
                                    const forBody = [];
                                    let fbi = bi + 1;
                                    const forIndent = getIndent(bodyLines[bi]) + 4;
                                    while (fbi < bodyLines.length && (getIndent(bodyLines[fbi]) >= forIndent || !bodyLines[fbi].trim())) {
                                        forBody.push(bodyLines[fbi]); fbi++;
                                    }
                                    if (Array.isArray(iter)) {
                                        for (const val of iter) {
                                            env[bFor[1]] = val;
                                            for (const fLine of forBody) {
                                                const fl = fLine.trim();
                                                if (!fl) continue;
                                                const fRet = fl.match(/^return\s+(.+)$/);
                                                if (fRet) { retVal = evalExpr(fRet[1]); break; }
                                                const fPrint = fl.match(/^print\((.*)?\)$/);
                                                if (fPrint) { out.push(evalExpr(fPrint[1] || '').toString()); }
                                                const fAssign = fl.match(/^(\w+)\s*=\s*(.+)$/);
                                                if (fAssign) env[fAssign[1]] = evalExpr(fAssign[2]);
                                                const fAppend = fl.match(/^(\w+)\.append\((.+)\)$/);
                                                if (fAppend && Array.isArray(env[fAppend[1]])) env[fAppend[1]].push(evalExpr(fAppend[2]));
                                            }
                                            if (retVal !== undefined) break;
                                        }
                                    }
                                    bi = fbi - 1; continue;
                                }
                                const bIf = bl.match(/^if\s+(.+):$/);
                                if (bIf) {
                                    const cond = evalExpr(bIf[1]);
                                    bi++;
                                    if (cond) {
                                        while (bi < bodyLines.length && getIndent(bodyLines[bi]) > getIndent(bodyLines[bi-1])) {
                                            const il = bodyLines[bi].trim();
                                            const iRet = il.match(/^return\s+(.+)$/);
                                            if (iRet) { retVal = evalExpr(iRet[1]); break; }
                                            const iPrint = il.match(/^print\((.*)?\)$/);
                                            if (iPrint) { out.push(evalExpr(iPrint[1] || '').toString()); }
                                            bi++;
                                        }
                                    }
                                    if (retVal !== undefined) break;
                                    continue;
                                }
                            }
                            Object.keys(savedEnv).forEach(k => { if (!k.startsWith('__fn_')) env[k] = savedEnv[k]; });
                            return retVal;
                        };
                        idx = bodyEnd; continue;
                    }

                    const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(.+):$/);
                    if (forMatch) {
                        const varName = forMatch[1];
                        const iterable = evalExpr(forMatch[2]);
                        const bodyStart = idx + 1;
                        const forIndent = indent + 4;
                        let bodyEnd = bodyStart;
                        while (bodyEnd < endIdx && (getIndent(lines[bodyEnd]) >= forIndent || !lines[bodyEnd].trim())) bodyEnd++;
                        if (Array.isArray(iterable)) {
                            for (const val of iterable) {
                                env[varName] = val;
                                execBlock(bodyStart, bodyEnd, forIndent);
                            }
                        }
                        idx = bodyEnd; continue;
                    }

                    const whileMatch = trimmed.match(/^while\s+(.+):$/);
                    if (whileMatch) {
                        const bodyStart = idx + 1;
                        const wIndent = indent + 4;
                        let bodyEnd = bodyStart;
                        while (bodyEnd < endIdx && (getIndent(lines[bodyEnd]) >= wIndent || !lines[bodyEnd].trim())) bodyEnd++;
                        let maxIter = 1000;
                        while (evalExpr(whileMatch[1]) && maxIter-- > 0) {
                            execBlock(bodyStart, bodyEnd, wIndent);
                        }
                        idx = bodyEnd; continue;
                    }

                    const ifMatch = trimmed.match(/^if\s+(.+):$/);
                    if (ifMatch) {
                        const cond = evalExpr(ifMatch[1]);
                        const bodyStart = idx + 1;
                        const ifIndent = indent + 4;
                        let bodyEnd = bodyStart;
                        while (bodyEnd < endIdx && (getIndent(lines[bodyEnd]) >= ifIndent || !lines[bodyEnd].trim())) bodyEnd++;
                        let elseStart = -1, elseEnd = bodyEnd;
                        if (bodyEnd < endIdx && lines[bodyEnd].trim().startsWith('else:')) {
                            elseStart = bodyEnd + 1;
                            elseEnd = elseStart;
                            while (elseEnd < endIdx && (getIndent(lines[elseEnd]) >= ifIndent || !lines[elseEnd].trim())) elseEnd++;
                        }
                        if (cond) {
                            execBlock(bodyStart, bodyEnd, ifIndent);
                        } else if (elseStart >= 0) {
                            execBlock(elseStart, elseEnd, ifIndent);
                        }
                        idx = elseEnd; continue;
                    }

                    const exprCall = trimmed.match(/^(\w+)\((.*)?\)$/);
                    if (exprCall) {
                        evalExpr(trimmed);
                        idx++; continue;
                    }

                    const methodCall = trimmed.match(/^(\w+)\.(\w+)\((.*)?\)$/);
                    if (methodCall) {
                        evalExpr(trimmed);
                        idx++; continue;
                    }

                    idx++;
                }
            };

            execBlock(0, lines.length, 0);
            setOutput(out.join('\n') || '(No output)');
        } catch(err) {
            setOutput('Error: ' + err.message);
        }
        setRunning(false);
    };

    // Syntax highlighting - tokenize first to prevent regex interference
    const highlight = (code) => {
        const keywords = new Set(['def','return','if','else','elif','for','while','in','import','from','class','try','except','finally','with','as','yield','lambda','pass','break','continue','and','or','not','is','True','False','None','print','range','len','int','str','float','list','dict','set','tuple','input','type','abs','max','min','sum','sorted','reversed','enumerate','zip','map','filter']);
        return code.split('\n').map((line) => {
            // Tokenize: split into strings, comments, and code segments
            const tokens = [];
            let i = 0;
            while (i < line.length) {
                // Comment
                if (line[i] === '#') {
                    tokens.push({ type: 'comment', text: line.slice(i) });
                    i = line.length;
                }
                // String
                else if (line[i] === '"' || line[i] === "'") {
                    const q = line[i];
                    let j = i + 1;
                    while (j < line.length && line[j] !== q) { if (line[j] === '\\') j++; j++; }
                    j = Math.min(j + 1, line.length);
                    tokens.push({ type: 'string', text: line.slice(i, j) });
                    i = j;
                }
                // f-string
                else if ((line[i] === 'f') && (line[i+1] === '"' || line[i+1] === "'")) {
                    const q = line[i+1];
                    let j = i + 2;
                    while (j < line.length && line[j] !== q) { if (line[j] === '\\') j++; j++; }
                    j = Math.min(j + 1, line.length);
                    tokens.push({ type: 'string', text: line.slice(i, j) });
                    i = j;
                }
                // Code
                else {
                    let j = i;
                    while (j < line.length && line[j] !== '#' && line[j] !== '"' && line[j] !== "'" && !(line[j] === 'f' && (line[j+1] === '"' || line[j+1] === "'"))) j++;
                    tokens.push({ type: 'code', text: line.slice(i, j) });
                    i = j;
                }
            }
            if (tokens.length === 0) return '';
            // Render each token
            return tokens.map(t => {
                const esc = t.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                if (t.type === 'comment') return '<span style="color:#6A9955">' + esc + '</span>';
                if (t.type === 'string') return '<span style="color:#CE9178">' + esc + '</span>';
                // Code: highlight keywords, numbers, function calls
                return esc
                    .replace(/\b(\w+)(?=\s*\()/g, (m, fn) => keywords.has(fn) ? '<span style="color:#C586C0">' + fn + '</span>' : '<span style="color:#DCDCAA">' + fn + '</span>')
                    .replace(/\b(def|return|if|else|elif|for|while|in|import|from|class|try|except|finally|with|as|yield|lambda|pass|break|continue|and|or|not|is|True|False|None)\b/g, (m) => '<span style="color:#C586C0">' + m + '</span>')
                    .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#B5CEA8">$1</span>');
            }).join('');
        }).join('\n');
    };

    const currentFile = files[activeFile];
    const saveFolders = VFS.ls(savePath).filter(f => f.type === 'folder');
    const openItems = VFS.ls(openPath);
    const openFolders = openItems.filter(f => f.type === 'folder');
    const openPyFiles = openItems.filter(f => f.type === 'file' && f.name.endsWith('.py'));

    return (
        <div className="flex flex-col h-full" style={{ background: '#1e1e1e' }}>
            {/* Top bar */}
            <div className="flex items-center h-[35px] bg-[#323233] border-b border-[#252526] px-2 gap-1">
                <button onClick={() => runPython(currentFile.content)} disabled={running}
                    className="flex items-center gap-1 px-3 py-1 rounded text-[11px] font-medium bg-[#0e639c] text-white hover:bg-[#1177bb]">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="white"><path d="M5 3l8 5-8 5V3z"/></svg>
                    {running ? 'Running...' : 'Run'}
                </button>
                <div className="w-px h-4 bg-[#555] mx-1"/>
                <button onClick={quickSave}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-[#ccc] hover:bg-[#3c3c3c]" title="Save (Ctrl+S)">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="#ccc"><path d="M13.71 4.29l-3-3L10 1H3L2 2v12l1 1h10l1-1V5l-.29-.71zM8 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM11 6H4V3h7v3z"/></svg>
                    Save
                </button>
                <button onClick={openSaveDialog}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-white bg-[#0e639c] hover:bg-[#1177bb]">
                    Save To Mac
                </button>
                <button onClick={openFromMac}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-[#ccc] hover:bg-[#3c3c3c]">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="#ccc"><path d="M1.5 1h4l1.5 2h6.5a1 1 0 011 1v8a1 1 0 01-1 1h-12a1 1 0 01-1-1V2a1 1 0 011-1z"/></svg>
                    Open File
                </button>
                <div className="flex-1"/>
                <span className="text-[11px] text-gray-500">{currentFile.vfsPath ? currentFile.vfsPath.replace('/Users/user', '~') + '/' + currentFile.name : 'Local'}</span>
                <div className="w-px h-4 bg-[#555] mx-1"/>
                <span className="text-[11px] text-gray-500">Python</span>
            </div>
            <div className="flex flex-1 overflow-hidden">
                {/* File explorer */}
                <div className="w-[180px] bg-[#252526] border-r border-[#1e1e1e] overflow-y-auto">
                    <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Explorer</span>
                        <button onClick={() => setShowNewFile(true)} className="text-gray-400 hover:text-white text-[16px] leading-none">+</button>
                    </div>
                    {showNewFile && (
                        <div className="px-2 pb-1">
                            <input type="text" value={newFileName} onChange={e => setNewFileName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') createFile(); if (e.key === 'Escape') setShowNewFile(false); }}
                                placeholder="filename.py" className="w-full bg-[#3c3c3c] text-white text-[12px] px-2 py-1 rounded border border-[#007acc] outline-none" autoFocus/>
                        </div>
                    )}
                    {files.map((f, i) => (
                        <div key={f.name} className={`flex items-center gap-2 px-3 py-1 cursor-pointer text-[13px] group ${i === activeFile ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
                            onClick={() => setActiveFile(i)}>
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="#519aba"><path d="M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v4h4v8z"/></svg>
                            <span className="flex-1 truncate">{f.name}</span>
                            {f.vfsPath && <span className="text-[9px] text-gray-600" title={f.vfsPath}>VFS</span>}
                            {files.length > 1 && (
                                <button onClick={(e) => { e.stopPropagation(); deleteFile(i); }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-[14px]">&times;</button>
                            )}
                        </div>
                    ))}
                </div>
                {/* Editor + Output */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tab bar */}
                    <div className="flex bg-[#252526] border-b border-[#1e1e1e]">
                        {files.map((f, i) => (
                            <div key={f.name} className={`flex items-center gap-2 px-3 py-1.5 text-[12px] cursor-pointer border-r border-[#1e1e1e] ${i === activeFile ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-500 hover:text-gray-300'}`}
                                onClick={() => setActiveFile(i)}>
                                <svg viewBox="0 0 16 16" width="12" height="12" fill="#519aba"><path d="M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v4h4v8z"/></svg>
                                {f.name}
                            </div>
                        ))}
                    </div>
                    {/* Code editor */}
                    <div className="flex-1 overflow-auto relative" style={{ fontFamily: "'SF Mono', Menlo, Monaco, monospace" }}>
                        <div className="flex min-h-full">
                            <div className="py-2 pl-2 pr-3 text-right select-none bg-[#1e1e1e] sticky left-0" style={{ minWidth: '45px' }}>
                                {currentFile.content.split('\n').map((_, i) => (
                                    <div key={i} className="text-[12px] leading-[20px] text-[#858585]">{i + 1}</div>
                                ))}
                            </div>
                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    value={currentFile.content}
                                    onChange={e => updateContent(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Tab') {
                                            e.preventDefault();
                                            const ta = e.target;
                                            const start = ta.selectionStart;
                                            const end = ta.selectionEnd;
                                            const val = ta.value;
                                            updateContent(val.substring(0, start) + '    ' + val.substring(end));
                                            setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 4; }, 0);
                                        }
                                        if (e.key === 'Enter') {
                                            const ta = e.target;
                                            const val = ta.value;
                                            const pos = ta.selectionStart;
                                            // Find the current line
                                            const before = val.substring(0, pos);
                                            const lineStart = before.lastIndexOf('\n') + 1;
                                            const currentLine = before.substring(lineStart);
                                            // Get current indentation
                                            const indentMatch = currentLine.match(/^(\s*)/);
                                            let indent = indentMatch ? indentMatch[1] : '';
                                            // Add extra indent after lines ending with :
                                            const trimmed = currentLine.trim();
                                            if (trimmed.endsWith(':')) {
                                                indent += '    ';
                                            }
                                            if (indent) {
                                                e.preventDefault();
                                                const newVal = val.substring(0, pos) + '\n' + indent + val.substring(ta.selectionEnd);
                                                updateContent(newVal);
                                                const newPos = pos + 1 + indent.length;
                                                setTimeout(() => { ta.selectionStart = ta.selectionEnd = newPos; }, 0);
                                            }
                                        }
                                        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                                            e.preventDefault();
                                            quickSave();
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white outline-none resize-none py-2 px-0"
                                    style={{ fontFamily: 'inherit', fontSize: '12px', lineHeight: '20px', tabSize: 4, whiteSpace: 'pre' }}
                                    spellCheck="false"
                                />
                                <pre className="py-2 px-0 pointer-events-none text-[12px] leading-[20px] text-[#d4d4d4]"
                                    style={{ fontFamily: 'inherit', whiteSpace: 'pre' }}
                                    dangerouslySetInnerHTML={{ __html: highlight(currentFile.content) }}/>
                            </div>
                        </div>
                    </div>
                    {/* Output panel */}
                    {showOutput && (
                        <div className="border-t border-[#252526]" style={{ height: '150px' }}>
                            <div className="flex items-center justify-between bg-[#252526] px-3 py-1">
                                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Terminal</span>
                                <button onClick={() => setShowOutput(false)} className="text-gray-500 hover:text-white text-[14px]">&times;</button>
                            </div>
                            <pre className="p-3 overflow-auto h-[120px] text-[12px] text-[#cccccc] bg-[#1e1e1e]" style={{ fontFamily: "'SF Mono', Menlo, monospace" }}>
                                <span className="text-green-400">$ python {currentFile.name}</span>{'\n'}{output}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
            {/* Status bar */}
            <div className="h-[22px] bg-[#007acc] flex items-center px-3 text-white text-[11px] gap-4">
                <span>Python</span>
                <span>UTF-8</span>
                <span>Spaces: 4</span>
                <span className="ml-auto">{currentFile.name}</span>
            </div>

            {/* Save To Mac Dialog */}
            {showSaveDialog && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 rounded-b-xl">
                    <div className="bg-[#252526] rounded-xl shadow-2xl w-[420px] overflow-hidden border border-[#3c3c3c]">
                        <div className="px-5 py-3 bg-[#323233] border-b border-[#3c3c3c] flex items-center justify-between">
                            <h3 className="text-[14px] font-semibold text-white">Save To Mac</h3>
                            <button onClick={() => setShowSaveDialog(false)} className="text-gray-400 hover:text-white text-[18px]">&times;</button>
                        </div>
                        <div className="p-4">
                            <div className="text-[12px] text-gray-400 mb-2">Save to: {savePath.replace('/Users/user', '~')}</div>
                            <div className="border border-[#3c3c3c] rounded-lg h-[200px] overflow-y-auto mb-3 bg-[#1e1e1e]">
                                {savePath !== '/Users/user' && (
                                    <div className="flex items-center gap-2 px-3 py-2 hover:bg-[#37373d] cursor-default border-b border-[#3c3c3c]"
                                        onClick={() => { const parts = savePath.split('/'); parts.pop(); setSavePath(parts.join('/') || '/Users/user'); }}>
                                        <span className="text-[14px]">⬆️</span>
                                        <span className="text-[12px] text-[#007acc] font-medium">Go Up</span>
                                    </div>
                                )}
                                {saveFolders.length === 0 && (
                                    <div className="text-[12px] text-gray-500 text-center py-8">No subfolders</div>
                                )}
                                {saveFolders.map(folder => (
                                    <div key={folder.name}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#37373d] cursor-default border-b border-[#3c3c3c]"
                                        onDoubleClick={() => setSavePath(savePath + '/' + folder.name)}>
                                        <svg viewBox="0 0 48 48" width="20" height="20">
                                            <path d="M6 8h14l4 4h18c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="#64B5F6"/>
                                            <rect x="4" y="14" width="40" height="24" rx="2" fill="#42A5F5" opacity="0.85"/>
                                        </svg>
                                        <span className="text-[12px] text-gray-300">{folder.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[12px] text-gray-400 whitespace-nowrap">File name:</span>
                                <input type="text" value={saveFileName} onChange={e => setSaveFileName(e.target.value)}
                                    className="flex-1 px-2 py-1.5 bg-[#3c3c3c] border border-[#555] rounded-md text-[12px] text-white outline-none focus:border-[#007acc]"/>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowSaveDialog(false)}
                                    className="px-4 py-1.5 rounded-lg bg-[#3c3c3c] text-[13px] text-gray-300 font-medium hover:bg-[#4c4c4c]">Cancel</button>
                                <button onClick={saveToMac}
                                    className="px-4 py-1.5 rounded-lg bg-[#0e639c] text-white text-[13px] font-medium hover:bg-[#1177bb]">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Open From Mac Dialog */}
            {showOpenDialog && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 rounded-b-xl">
                    <div className="bg-[#252526] rounded-xl shadow-2xl w-[420px] overflow-hidden border border-[#3c3c3c]">
                        <div className="px-5 py-3 bg-[#323233] border-b border-[#3c3c3c] flex items-center justify-between">
                            <h3 className="text-[14px] font-semibold text-white">Open File</h3>
                            <button onClick={() => setShowOpenDialog(false)} className="text-gray-400 hover:text-white text-[18px]">&times;</button>
                        </div>
                        <div className="p-4">
                            <div className="text-[12px] text-gray-400 mb-2">Browse: {openPath.replace('/Users/user', '~')}</div>
                            <div className="border border-[#3c3c3c] rounded-lg h-[250px] overflow-y-auto mb-3 bg-[#1e1e1e]">
                                {openPath !== '/Users/user' && (
                                    <div className="flex items-center gap-2 px-3 py-2 hover:bg-[#37373d] cursor-default border-b border-[#3c3c3c]"
                                        onClick={() => { const parts = openPath.split('/'); parts.pop(); setOpenPath(parts.join('/') || '/Users/user'); }}>
                                        <span className="text-[14px]">⬆️</span>
                                        <span className="text-[12px] text-[#007acc] font-medium">Go Up</span>
                                    </div>
                                )}
                                {openFolders.map(folder => (
                                    <div key={folder.name}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#37373d] cursor-default border-b border-[#3c3c3c]"
                                        onDoubleClick={() => setOpenPath(openPath + '/' + folder.name)}>
                                        <svg viewBox="0 0 48 48" width="20" height="20">
                                            <path d="M6 8h14l4 4h18c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="#64B5F6"/>
                                            <rect x="4" y="14" width="40" height="24" rx="2" fill="#42A5F5" opacity="0.85"/>
                                        </svg>
                                        <span className="text-[12px] text-gray-300">{folder.name}</span>
                                    </div>
                                ))}
                                {openPyFiles.map(file => (
                                    <div key={file.name}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#37373d] cursor-default border-b border-[#3c3c3c]"
                                        onDoubleClick={() => loadFileFromVFS(openPath, file.name)}>
                                        <svg viewBox="0 0 16 16" width="16" height="16" fill="#519aba"><path d="M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v4h4v8z"/></svg>
                                        <span className="text-[12px] text-gray-300">{file.name}</span>
                                        <span className="text-[10px] text-gray-500 ml-auto">{file.size}</span>
                                    </div>
                                ))}
                                {openFolders.length === 0 && openPyFiles.length === 0 && (
                                    <div className="text-[12px] text-gray-500 text-center py-8">No folders or .py files here</div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowOpenDialog(false)}
                                    className="px-4 py-1.5 rounded-lg bg-[#3c3c3c] text-[13px] text-gray-300 font-medium hover:bg-[#4c4c4c]">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.VSCodeApp = VSCodeApp;
