// macOS Window Management
const WindowManager = {
    createWindow(options) {
        const {
            id = 'window-' + Date.now(),
            title = 'Untitled',
            appName = 'Finder',
            appType = 'finder',
            width = 800,
            height = 500,
            x = null,
            y = null,
            content = '',
            resizable = true,
            hasToolbar = false,
            toolbarContent = '',
            hasPathBar = false,
            pathBarContent = ''
        } = options;

        const container = document.getElementById('windows-container');
        const win = document.createElement('div');
        win.id = id;
        win.className = 'macos-window opening focused';
        win.style.width = width + 'px';
        win.style.height = height + 'px';

        // Center or use provided position
        const centerX = x !== null ? x : (window.innerWidth - width) / 2;
        const centerY = y !== null ? y : (window.innerHeight - height) / 3;
        win.style.left = centerX + 'px';
        win.style.top = centerY + 'px';
        win.style.zIndex = MacOS.getNextZIndex();

        let html = `
            <div class="window-title-bar" data-window-id="${id}">
                <div class="traffic-light">
                    <div class="tl-btn tl-close" onclick="MacOS.closeWindow('${id}')" title="Close">
                        <svg viewBox="0 0 12 12"><path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="#4d0000" stroke-width="1.2" fill="none"/></svg>
                    </div>
                    <div class="tl-btn tl-minimize" onclick="MacOS.minimizeWindow('${id}')" title="Minimize">
                        <svg viewBox="0 0 12 12"><path d="M2.5 6h7" stroke="#995700" stroke-width="1.2" fill="none"/></svg>
                    </div>
                    <div class="tl-btn tl-maximize" onclick="MacOS.toggleFullscreen('${id}')" title="Full Screen">
                        <svg viewBox="0 0 12 12"><path d="M3 3l2.5 0 0-2.5M9 9l-2.5 0 0 2.5M3 9l2.5 0 0 2.5M9 3l-2.5 0 0-2.5" stroke="#006500" stroke-width="1" fill="none" transform="scale(0.8) translate(1.2,1.2)"/></svg>
                    </div>
                </div>
                <div class="window-title">${title}</div>
            </div>`;

        if (hasToolbar) {
            html += `<div class="window-toolbar">${toolbarContent}</div>`;
        }

        html += `<div class="window-body">${content}</div>`;

        if (hasPathBar) {
            html += `<div class="finder-path-bar">${pathBarContent}</div>`;
        }

        // Add resize handles
        if (resizable) {
            html += `
                <div class="resize-handle resize-n" data-dir="n"></div>
                <div class="resize-handle resize-s" data-dir="s"></div>
                <div class="resize-handle resize-e" data-dir="e"></div>
                <div class="resize-handle resize-w" data-dir="w"></div>
                <div class="resize-handle resize-ne" data-dir="ne"></div>
                <div class="resize-handle resize-nw" data-dir="nw"></div>
                <div class="resize-handle resize-se" data-dir="se"></div>
                <div class="resize-handle resize-sw" data-dir="sw"></div>
            `;
        }

        win.innerHTML = html;
        container.appendChild(win);

        // Register window
        const winData = { id, title, appName, appType, minimized: false };
        MacOS.windows.push(winData);
        MacOS.openApps.add(appType);
        MacOS.focusWindow(id);
        MacOS.updateDockIndicators();

        // Setup drag
        this.setupDrag(win);

        // Setup resize
        if (resizable) {
            this.setupResize(win);
        }

        // Setup focus on click
        win.addEventListener('mousedown', () => {
            MacOS.focusWindow(id);
        });

        // Animate bounce in dock
        const dockItem = document.querySelector(`.dock-item[data-app="${appType}"]`);
        if (dockItem) {
            dockItem.classList.add('bouncing');
            setTimeout(() => dockItem.classList.remove('bouncing'), 800);
        }

        setTimeout(() => win.classList.remove('opening'), 250);
        return id;
    },

    setupDrag(win) {
        const titleBar = win.querySelector('.window-title-bar');
        let isDragging = false;
        let startX, startY, origLeft, origTop;

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.tl-btn')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            origLeft = win.offsetLeft;
            origTop = win.offsetTop;
            win.style.transition = 'none';
            document.body.style.cursor = 'move';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            let newTop = origTop + dy;
            // Don't drag above menu bar
            if (newTop < 0) newTop = 0;
            win.style.left = (origLeft + dx) + 'px';
            win.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                win.style.transition = '';
                document.body.style.cursor = '';
            }
        });

        // Double click title bar to maximize
        titleBar.addEventListener('dblclick', (e) => {
            if (e.target.closest('.tl-btn')) return;
            MacOS.toggleFullscreen(win.id);
        });
    },

    setupResize(win) {
        const handles = win.querySelectorAll('.resize-handle');
        let isResizing = false;
        let currentDir = '';
        let startX, startY, startW, startH, startLeft, startTop;

        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                currentDir = handle.dataset.dir;
                startX = e.clientX;
                startY = e.clientY;
                startW = win.offsetWidth;
                startH = win.offsetHeight;
                startLeft = win.offsetLeft;
                startTop = win.offsetTop;
                win.style.transition = 'none';
                e.preventDefault();
                e.stopPropagation();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newW = startW;
            let newH = startH;
            let newLeft = startLeft;
            let newTop = startTop;

            if (currentDir.includes('e')) newW = Math.max(300, startW + dx);
            if (currentDir.includes('w')) {
                newW = Math.max(300, startW - dx);
                newLeft = startLeft + (startW - newW);
            }
            if (currentDir.includes('s')) newH = Math.max(200, startH + dy);
            if (currentDir.includes('n')) {
                newH = Math.max(200, startH - dy);
                newTop = startTop + (startH - newH);
            }

            win.style.width = newW + 'px';
            win.style.height = newH + 'px';
            win.style.left = newLeft + 'px';
            win.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                win.style.transition = '';
            }
        });
    }
};
