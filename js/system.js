// macOS Sonoma System JS - Core System
const MacOS = {
    version: '14.3.1',
    build: '23D60',
    windows: [],
    activeWindow: null,
    zIndex: 100,
    isLocked: true,
    isDarkMode: false,
    openApps: new Set(['finder']),
    minimizedWindows: [],

    init() {
        this.setupLockScreen();
        this.setupClock();
        this.setupDesktopClick();
        this.setupKeyboardShortcuts();
    },

    setupLockScreen() {
        const lockScreen = document.getElementById('lock-screen');
        const passwordInput = document.getElementById('lock-password');
        const desktop = document.getElementById('desktop');

        const updateLockTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            document.getElementById('lock-time').textContent = timeStr;
            document.getElementById('lock-date').textContent = dateStr;
        };
        updateLockTime();
        setInterval(updateLockTime, 1000);

        const unlock = () => {
            lockScreen.classList.add('unlocking');
            setTimeout(() => {
                lockScreen.style.display = 'none';
                desktop.style.display = '';
                desktop.classList.add('showing');
                this.isLocked = false;
                setTimeout(() => desktop.classList.remove('showing'), 500);
            }, 500);
        };

        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') unlock();
        });

        lockScreen.addEventListener('click', (e) => {
            if (e.target === lockScreen || e.target.classList.contains('lock-screen-bg') || e.target.classList.contains('lock-hint')) {
                passwordInput.focus();
            }
        });

        // Also unlock on Enter when lock screen is focused
        lockScreen.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') unlock();
        });
    },

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = days[now.getDay()];
            const month = months[now.getMonth()];
            const date = now.getDate();
            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            if (hours === 0) hours = 12;
            const minutes = now.getMinutes().toString().padStart(2, '0');
            document.getElementById('menu-bar-clock').textContent = `${day} ${month} ${date} ${hours}:${minutes} ${ampm}`;
        };
        updateClock();
        setInterval(updateClock, 1000);
    },

    setupDesktopClick() {
        const desktop = document.getElementById('desktop');
        desktop.addEventListener('mousedown', (e) => {
            if (e.target === desktop || e.target.classList.contains('wallpaper') ||
                e.target.id === 'desktop-icons' || e.target.classList.contains('desktop-icons')) {
                this.unfocusAllWindows();
                document.getElementById('active-app-name').innerHTML = '<strong>Finder</strong>';
            }
        });
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd+Space - Spotlight
            if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
                e.preventDefault();
                Spotlight.toggle();
            }
            // Cmd+Q - Close active window
            if ((e.metaKey || e.ctrlKey) && e.code === 'KeyQ') {
                e.preventDefault();
                if (this.activeWindow) {
                    this.closeWindow(this.activeWindow.id);
                }
            }
            // Cmd+W - Close active window
            if ((e.metaKey || e.ctrlKey) && e.code === 'KeyW') {
                e.preventDefault();
                if (this.activeWindow) {
                    this.closeWindow(this.activeWindow.id);
                }
            }
            // Cmd+M - Minimize
            if ((e.metaKey || e.ctrlKey) && e.code === 'KeyM') {
                e.preventDefault();
                if (this.activeWindow) {
                    this.minimizeWindow(this.activeWindow.id);
                }
            }
            // Escape - Close spotlight, control center, etc.
            if (e.key === 'Escape') {
                Spotlight.hide();
                document.getElementById('control-center').style.display = 'none';
                document.getElementById('notification-center').style.display = 'none';
                ContextMenu.hide();
                // Close launchpad
                const lp = document.querySelector('.launchpad-overlay');
                if (lp) lp.remove();
            }
        });
    },

    getNextZIndex() {
        return ++this.zIndex;
    },

    focusWindow(windowId) {
        this.windows.forEach(w => {
            const el = document.getElementById(w.id);
            if (el) {
                el.classList.remove('focused');
                el.classList.add('unfocused');
            }
        });

        const win = this.windows.find(w => w.id === windowId);
        if (win) {
            const el = document.getElementById(windowId);
            if (el) {
                el.style.zIndex = this.getNextZIndex();
                el.classList.add('focused');
                el.classList.remove('unfocused');
                this.activeWindow = win;
                document.getElementById('active-app-name').innerHTML = `<strong>${win.appName || 'Finder'}</strong>`;
            }
        }
    },

    unfocusAllWindows() {
        this.windows.forEach(w => {
            const el = document.getElementById(w.id);
            if (el) {
                el.classList.remove('focused');
                el.classList.add('unfocused');
            }
        });
        this.activeWindow = null;
    },

    closeWindow(windowId) {
        const el = document.getElementById(windowId);
        if (el) {
            el.classList.add('closing');
            setTimeout(() => {
                el.remove();
                this.windows = this.windows.filter(w => w.id !== windowId);
                if (this.activeWindow && this.activeWindow.id === windowId) {
                    this.activeWindow = null;
                    // Focus the next window if available
                    if (this.windows.length > 0) {
                        this.focusWindow(this.windows[this.windows.length - 1].id);
                    } else {
                        document.getElementById('active-app-name').innerHTML = '<strong>Finder</strong>';
                    }
                }
                // Remove app from openApps if no more windows
                const win = this.windows.find(w => w.id === windowId);
                // Update dock indicators
                this.updateDockIndicators();
            }, 200);
        }
    },

    minimizeWindow(windowId) {
        const el = document.getElementById(windowId);
        if (el) {
            el.classList.add('minimizing');
            setTimeout(() => {
                el.style.display = 'none';
                el.classList.remove('minimizing');
                const win = this.windows.find(w => w.id === windowId);
                if (win) win.minimized = true;
                if (this.activeWindow && this.activeWindow.id === windowId) {
                    this.activeWindow = null;
                    const visibleWindows = this.windows.filter(w => !w.minimized);
                    if (visibleWindows.length > 0) {
                        this.focusWindow(visibleWindows[visibleWindows.length - 1].id);
                    }
                }
            }, 350);
        }
    },

    restoreWindow(windowId) {
        const el = document.getElementById(windowId);
        if (el) {
            el.style.display = '';
            el.classList.add('opening');
            const win = this.windows.find(w => w.id === windowId);
            if (win) win.minimized = false;
            this.focusWindow(windowId);
            setTimeout(() => el.classList.remove('opening'), 250);
        }
    },

    toggleFullscreen(windowId) {
        const el = document.getElementById(windowId);
        if (el) {
            el.classList.toggle('fullscreen');
        }
    },

    updateDockIndicators() {
        const appNames = new Set(this.windows.map(w => w.appType));
        appNames.add('finder'); // Finder is always running
        document.querySelectorAll('.dock-item').forEach(item => {
            const app = item.dataset.app;
            const indicator = item.querySelector('.dock-indicator');
            if (indicator) {
                if (appNames.has(app)) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            }
        });
    },

    lockScreen() {
        const lockScreen = document.getElementById('lock-screen');
        lockScreen.style.display = '';
        lockScreen.classList.remove('unlocking');
        this.isLocked = true;
        document.getElementById('lock-password').value = '';
        document.getElementById('lock-password').focus();
    },

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        const wallpaper = document.getElementById('wallpaper');
        if (this.isDarkMode) {
            wallpaper.classList.add('dark-mode');
            document.documentElement.style.setProperty('--bg-primary', 'rgba(40, 40, 40, 0.92)');
        } else {
            wallpaper.classList.remove('dark-mode');
            document.documentElement.style.setProperty('--bg-primary', 'rgba(246, 246, 246, 0.85)');
        }
    },

    showNotification(appName, title, body, icon) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="notification-toast-icon" style="background:${icon || '#007AFF'}; border-radius:8px;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
            </div>
            <div class="notification-toast-content">
                <div class="notification-toast-app">${appName}</div>
                <div class="notification-toast-title">${title}</div>
                <div class="notification-toast-body">${body}</div>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

// Initialize system
document.addEventListener('DOMContentLoaded', () => {
    MacOS.init();
});
