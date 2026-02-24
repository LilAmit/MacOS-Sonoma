const fs = require('fs');

// HTML head + CSS
const head = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>macOS Sonoma</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'sf': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'sans-serif'],
                        'mono': ['SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
                    },
                    colors: {
                        'macos': { 'bg': 'rgba(246,246,246,0.92)', 'dark': 'rgba(30,30,30,0.35)', 'accent': '#007AFF', 'red': '#FF5F57', 'yellow': '#FFBD2E', 'green': '#28C840', 'text': '#1d1d1f', 'secondary': '#86868b', 'border': 'rgba(0,0,0,0.12)', 'sidebar': 'rgba(236,236,236,0.5)' }
                    },
                    animation: {
                        'wallpaper': 'wallpaper 120s ease infinite', 'spotlight-in': 'spotlight-in 0.15s ease-out',
                        'window-open': 'window-open 0.25s cubic-bezier(0.25,0.46,0.45,0.94)', 'window-close': 'window-close 0.2s cubic-bezier(0.55,0.06,0.68,0.19)',
                        'slide-in-right': 'slide-in-right 0.2s ease-out', 'fade-in': 'fade-in 0.3s ease-out',
                        'bounce-dock': 'bounce-dock 0.8s ease-in-out', 'cursor-blink': 'blink 1s step-end infinite',
                        'toast-in': 'toast-in 0.3s ease-out', 'unlock': 'unlock 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
                    },
                    keyframes: {
                        'wallpaper': { '0%': { backgroundPosition: '0% 50%' }, '25%': { backgroundPosition: '50% 0%' }, '50%': { backgroundPosition: '100% 50%' }, '75%': { backgroundPosition: '50% 100%' }, '100%': { backgroundPosition: '0% 50%' } },
                        'spotlight-in': { '0%': { transform: 'scale(0.96)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
                        'window-open': { '0%': { transform: 'scale(0.88)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
                        'window-close': { '0%': { transform: 'scale(1)', opacity: 1 }, '100%': { transform: 'scale(0.88)', opacity: 0 } },
                        'slide-in-right': { '0%': { transform: 'translateX(20px)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
                        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
                        'bounce-dock': { '0%, 100%': { transform: 'translateY(0)' }, '25%': { transform: 'translateY(-20px)' }, '50%': { transform: 'translateY(-5px)' }, '75%': { transform: 'translateY(-12px)' } },
                        'blink': { '50%': { opacity: 0 } },
                        'toast-in': { '0%': { transform: 'translateX(100%)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
                        'unlock': { '0%': { opacity: 1, transform: 'scale(1)' }, '100%': { opacity: 0, transform: 'scale(1.1)' } },
                    }
                }
            }
        }
    <\/script>
    <style>
` + fs.readFileSync('D:/MacOS/src/styles.css', 'utf8') + `
    </style>
</head>
<body class="overflow-hidden w-screen h-screen font-sf">
    <div id="root"></div>
`;

// Files in order with their window assignments
const files = [
    { path: 'src/stores/store.ts', globals: ['MacStore', 'useStore', 'WALLPAPERS', 'VFS'] },
    { path: 'src/icons/MacIcons.tsx', globals: ['MacIcons'] },
    { path: 'src/components/TrafficLights.tsx', globals: ['TrafficLights'] },
    { path: 'src/components/Window.tsx', globals: ['Window'] },
    { path: 'src/apps/Finder.tsx', globals: ['FinderApp'] },
    { path: 'src/apps/Safari.tsx', globals: ['SafariApp'] },
    { path: 'src/apps/Calculator.tsx', globals: ['CalcButton', 'CalculatorApp'] },
    { path: 'src/apps/Notes.tsx', globals: ['NotesApp'] },
    { path: 'src/apps/Terminal.tsx', globals: ['TerminalApp'] },
    { path: 'src/apps/Settings.tsx', globals: ['SettingsApp', 'SettingsGroup', 'SettingsRow'] },
    { path: 'src/apps/Messages.tsx', globals: ['MessagesApp'] },
    { path: 'src/apps/Mail.tsx', globals: ['MailApp'] },
    { path: 'src/apps/Calendar.tsx', globals: ['CalendarApp'] },
    { path: 'src/apps/Photos.tsx', globals: ['PhotosApp'] },
    { path: 'src/apps/WordApp.tsx', globals: ['WordApp'] },
    { path: 'src/apps/TrashApp.tsx', globals: ['TrashApp'] },
    { path: 'src/apps/Maps.tsx', globals: ['MapsApp'] },
    { path: 'src/apps/Music.tsx', globals: ['MusicApp'] },
    { path: 'src/apps/SnakeGame.tsx', globals: ['SnakeGameApp'] },
    { path: 'src/apps/TetrisGame.tsx', globals: ['TetrisGameApp'] },
    { path: 'src/apps/Game2048.tsx', globals: ['Game2048App'] },
    { path: 'src/apps/VSCodeApp.tsx', globals: ['VSCodeApp'] },
    { path: 'src/apps/PaintApp.tsx', globals: ['PaintApp'] },
    { path: 'src/apps/AppStore.tsx', globals: ['AppStoreApp'] },
    { path: 'src/components/MenuBar.tsx', globals: ['MenuBar'] },
    { path: 'src/components/Dock.tsx', globals: ['Dock'] },
    { path: 'src/components/Spotlight.tsx', globals: ['SpotlightSearch'] },
    { path: 'src/components/ControlCenter.tsx', globals: ['ControlCenter'] },
    { path: 'src/components/NotificationCenter.tsx', globals: ['NotificationCenter'] },
    { path: 'src/components/ContextMenu.tsx', globals: ['ContextMenuComponent', 'CtxItem'] },
    { path: 'src/components/LockScreen.tsx', globals: ['LockScreen'] },
    { path: 'src/components/Desktop.tsx', globals: ['Desktop'] },
    { path: 'src/App.tsx', globals: [] },
];

let output = head;

for (const file of files) {
    let content = fs.readFileSync('D:/MacOS/' + file.path, 'utf8');
    // Remove existing window.X lines
    content = content.replace(/^window\.\w+\s*=\s*\w+;?\s*$/gm, '');

    output += '\n<script type="text/babel">\n';
    output += content;
    // Add global assignments
    for (const g of file.globals) {
        output += '\nwindow.' + g + ' = ' + g + ';';
    }
    output += '\n</script>\n';
}

output += '\n</body>\n</html>\n';

fs.writeFileSync('D:/MacOS/index.html', output);
console.log('Build complete!');
console.log('File size:', (fs.statSync('D:/MacOS/index.html').size / 1024).toFixed(1), 'KB');

// Verify
const html = fs.readFileSync('D:/MacOS/index.html', 'utf8');
console.log('DOCTYPE first:', html.startsWith('<!DOCTYPE'));
const openScripts = (html.match(/<script/g) || []).length;
const closeScripts = (html.match(/<\/script>/g) || []).length;
console.log('Script tags:', openScripts, 'open,', closeScripts, 'close, match:', openScripts === closeScripts);
console.log('MacIcons count:', (html.match(/const MacIcons/g) || []).length);
console.log('MacStore count:', (html.match(/const MacStore/g) || []).length);
