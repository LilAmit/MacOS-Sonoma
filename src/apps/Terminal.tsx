// Terminal App - Real shell emulation with VFS
const TerminalApp = () => {
    const [lines, setLines] = React.useState([
        { type: 'output', text: 'Last login: ' + new Date().toDateString() + ' on ttys000' }
    ]);
    const [input, setInput] = React.useState('');
    const [history, setHistory] = React.useState([]);
    const [histIdx, setHistIdx] = React.useState(-1);
    const [cwd, setCwd] = React.useState('~');
    const bodyRef = React.useRef(null);
    const inputRef = React.useRef(null);

    const hostname = 'user@MacBook-Pro';

    const resolvePath = (p) => {
        let path = p;
        if (path === '~' || path === '') return '/Users/user';
        if (path.startsWith('~/')) path = '/Users/user/' + path.slice(2);
        if (!path.startsWith('/')) {
            const base = cwd === '~' ? '/Users/user' : cwd.replace('~', '/Users/user');
            path = base + '/' + path;
        }
        // Resolve .. and .
        const parts = path.split('/').filter(Boolean);
        const resolved = [];
        for (const p of parts) {
            if (p === '..') resolved.pop();
            else if (p !== '.') resolved.push(p);
        }
        return '/' + resolved.join('/');
    };

    const displayPath = (p) => p.replace('/Users/user', '~');

    const processCommand = (cmd) => {
        const trimmed = cmd.trim();
        if (!trimmed) return null;

        // Handle pipes and redirects simply
        const parts = trimmed.split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1).join(' ');
        const argList = parts.slice(1);

        switch(command) {
            case 'ls': {
                const target = argList[0] ? resolvePath(argList[0]) : resolvePath(cwd);
                const items = VFS.ls(target);
                if (items.length === 0) return '';
                return items.map(i => i.name).join('  ');
            }
            case 'pwd':
                return resolvePath(cwd);
            case 'cd': {
                if (!argList[0] || argList[0] === '~') { setCwd('~'); return null; }
                const target = resolvePath(argList[0]);
                if (VFS.isDir(target)) {
                    setCwd(displayPath(target));
                    return null;
                }
                return `cd: no such file or directory: ${argList[0]}`;
            }
            case 'mkdir': {
                if (!argList[0]) return 'usage: mkdir directory_name';
                const base = resolvePath(cwd);
                const name = argList[0];
                if (VFS.mkdir(base, name)) return null;
                return `mkdir: ${name}: File exists`;
            }
            case 'touch': {
                if (!argList[0]) return 'usage: touch file_name';
                const base = resolvePath(cwd);
                VFS.touch(base, argList[0], '');
                return null;
            }
            case 'rm': {
                if (!argList[0]) return 'usage: rm file_name';
                const name = argList.filter(a => !a.startsWith('-')).pop();
                if (!name) return 'usage: rm file_name';
                const base = resolvePath(cwd);
                if (VFS.exists(base + '/' + name)) {
                    VFS.rm(base, name);
                    return null;
                }
                return `rm: ${name}: No such file or directory`;
            }
            case 'mv': {
                if (argList.length < 2) return 'usage: mv source dest';
                const base = resolvePath(cwd);
                VFS.rename(base, argList[0], argList[1]);
                return null;
            }
            case 'cat': {
                if (!argList[0]) return 'usage: cat file';
                const path = resolvePath(argList[0].startsWith('/') || argList[0].startsWith('~') ? argList[0] : cwd + '/' + argList[0]);
                const content = VFS.readFile(path);
                if (content !== null) return content || '(empty file)';
                return `cat: ${argList[0]}: No such file or directory`;
            }
            case 'echo': {
                // Check for redirect
                const redirIdx = argList.indexOf('>');
                const appendIdx = argList.indexOf('>>');
                if (appendIdx >= 0) {
                    const text = argList.slice(0, appendIdx).join(' ');
                    const file = argList[appendIdx + 1];
                    const path = resolvePath(cwd + '/' + file);
                    const existing = VFS.readFile(path);
                    if (existing !== null) { VFS.writeFile(path, existing + '\n' + text); }
                    else { const base = resolvePath(cwd); VFS.touch(base, file, text); }
                    return null;
                }
                if (redirIdx >= 0) {
                    const text = argList.slice(0, redirIdx).join(' ');
                    const file = argList[redirIdx + 1];
                    const path = resolvePath(cwd + '/' + file);
                    if (VFS.exists(path)) { VFS.writeFile(path, text); }
                    else { const base = resolvePath(cwd); VFS.touch(base, file, text); }
                    return null;
                }
                return args;
            }
            case 'whoami': return 'user';
            case 'hostname': return 'MacBook-Pro.local';
            case 'date': return new Date().toString();
            case 'uname':
                return args === '-a' ? 'Darwin MacBook-Pro.local 23.3.0 Darwin Kernel Version 23.3.0: Wed Dec 20 21:30:27 PST 2023; root:xnu-10002.81.5~7/RELEASE_ARM64_T6031 arm64' : 'Darwin';
            case 'sw_vers':
                return 'ProductName:\t\tmacOS\nProductVersion:\t\t14.3.1\nBuildVersion:\t\t23D60';
            case 'uptime':
                return ` ${new Date().toLocaleTimeString('en-US', {hour:'numeric',minute:'2-digit'})}  up 3 days, 14:23, 2 users, load averages: 1.82 1.65 1.71`;
            case 'clear':
                setLines([]);
                return null;
            case 'which':
                return argList[0] ? `/usr/bin/${argList[0]}` : 'usage: which command';
            case 'env':
                return `USER=user\nHOME=/Users/user\nSHELL=/bin/zsh\nPATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin\nLANG=en_US.UTF-8\nTERM=xterm-256color`;
            case 'top':
                return `Processes: 385 total, 2 running, 383 sleeping, 1842 threads\nLoad Avg: 1.82, 1.65, 1.71\nCPU usage: 8.33% user, 4.16% sys, 87.50% idle\nPhysMem: 12G used (3450M wired), 6144M unused`;
            case 'ps':
                return '  PID TTY           TIME CMD\n  391 ttys000    0:00.12 -zsh\n  412 ttys000    0:02.34 node server.js\n  567 ttys000    0:00.01 ps';
            case 'df':
                return 'Filesystem     Size   Used  Avail Capacity  Mounted on\n/dev/disk3s1  460Gi  245Gi  195Gi    56%    /\ndevfs         213Ki  213Ki    0Bi   100%    /dev';
            case 'ifconfig':
                return 'en0: flags=8863<UP,BROADCAST,SMART,RUNNING>\n\tinet 192.168.1.42 netmask 0xffffff00\n\tether a4:83:e7:12:34:56\n\tstatus: active';
            case 'ping':
                if (!argList[0]) return 'usage: ping host';
                return `PING ${argList[0]} (142.250.80.14): 56 data bytes\n64 bytes: icmp_seq=0 ttl=117 time=12.3 ms\n64 bytes: icmp_seq=1 ttl=117 time=11.8 ms\n--- ${argList[0]} ping statistics ---\n2 packets transmitted, 2 received, 0.0% loss`;
            case 'git':
                if (args === 'status') return 'On branch main\nnothing to commit, working tree clean';
                if (args === 'branch') return '* main\n  develop\n  feature/dark-mode';
                return `git: '${argList[0]}' is not a git command.`;
            case 'python3':
                if (args === '--version') return 'Python 3.12.1';
                return 'Python 3.12.1 (interactive mode not supported)';
            case 'node':
                if (args === '--version' || args === '-v') return 'v21.5.0';
                return 'Node.js v21.5.0 (interactive mode not supported)';
            case 'open': {
                const appMap = { safari: 'Safari', finder: 'Finder', calculator: 'Calculator', notes: 'Notes', terminal: 'Terminal', music: 'Music', photos: 'Photos', maps: 'Maps', mail: 'Mail', calendar: 'Calendar', messages: 'Messages' };
                const appName = argList[0] && argList[0].toLowerCase().replace('.app','');
                if (appMap[appName]) { MacStore.openWindow(appName, appMap[appName]); return `Opening ${appMap[appName]}...`; }
                return `open: ${argList[0]}: No such file or application`;
            }
            case 'neofetch':
                return `                    'c.          user@MacBook-Pro\n                 ,xNMM.          -------------------\n               .OMMMMo           OS: macOS 14.3.1 arm64\n               OMMM0,            Host: MacBook Pro (2023)\n     .;loddo:' loolloddol;.     Kernel: 23.3.0\n   cKMMMMMMMMMMNWMMMMMMMMMM0:   Shell: zsh 5.9\n .KMMMMMMMMMMMMMMMMMMMMMMMWd.   Terminal: Terminal.app\n XMMMMMMMMMMMMMMMMMMMMMMMX.     CPU: Apple M3 Pro\n;MMMMMMMMMMMMMMMMMMMMMMMM:      GPU: Apple M3 Pro\n.MMMMMMMMMMMMMMMMMMMMMMMMX.     Memory: 8192MiB / 18432MiB\n kMMMMMMMMMMMMMMMMMMMMMMMMWd.\n  .XMMMMMMMMMMMMMMMMMMMMK.\n    kMMMMMMMMMMMMMMMMMMd.\n     ;KMMMMMMMWXXWMMMMMk.\n       .cooc,.    .,coo:.`;
            case 'help':
                return 'Available commands:\n  ls, cd, pwd, cat, echo, clear, mkdir, touch, rm, mv,\n  whoami, hostname, date, uname, sw_vers, uptime, open,\n  top, ps, df, ifconfig, ping, git, python3, node,\n  neofetch, which, env, help\n\nFile commands work with the virtual filesystem.\nUse echo "text" > file.txt to write files.';
            default:
                return `zsh: command not found: ${command}`;
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter') {
            const cmd = input;
            const newLines = [...lines, { type: 'command', prompt: `${hostname} ${cwd} % `, text: cmd }];
            const output = processCommand(cmd);
            if (output !== null) newLines.push({ type: 'output', text: output });
            setLines(newLines);
            setInput('');
            if (cmd.trim()) { setHistory(prev => [...prev, cmd]); setHistIdx(-1); }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
                setHistIdx(idx); setInput(history[idx]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx >= 0) {
                const idx = histIdx + 1;
                if (idx >= history.length) { setHistIdx(-1); setInput(''); }
                else { setHistIdx(idx); setInput(history[idx]); }
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const cmds = ['ls','cd','pwd','cat','echo','clear','mkdir','touch','rm','mv','whoami','hostname','date','uname','neofetch','git','node','python3','help','open'];
            const match = cmds.find(c => c.startsWith(input));
            if (match) setInput(match);
        }
    };

    React.useEffect(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, [lines]);

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]/95" onClick={() => inputRef.current?.focus()}>
            <div ref={bodyRef} className="flex-1 px-3 py-2 overflow-y-auto font-mono text-[13px] leading-relaxed">
                {lines.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                        {line.type === 'command' ? (
                            <span><span className="text-green-400">{line.prompt}</span><span className="text-gray-100">{line.text}</span></span>
                        ) : (<span className="text-gray-300">{line.text}</span>)}
                    </div>
                ))}
                <div className="flex items-center">
                    <span className="text-green-400 whitespace-pre">{hostname} {cwd} % </span>
                    <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                        className="flex-1 bg-transparent outline-none text-gray-100 font-mono text-[13px] caret-green-400" autoFocus spellCheck={false}/>
                </div>
            </div>
        </div>
    );
};

window.TerminalApp = TerminalApp;
