// Global state store for macOS Sonoma
const { useState: _useState, useCallback: _useCallback, useEffect: _useEffect, useRef: _useRef, createContext: _createContext, useContext: _useContext, useMemo: _useMemo } = React;

// Wallpaper definitions
const WALLPAPERS = [
    // Local wallpapers
    { name: 'Sonoma', path: 'wallpapers/wallpaper1.jpg' },
    { name: 'Sequoia', path: 'wallpapers/wallpaper2.jpg' },
    { name: 'Ventura', path: 'wallpapers/wallpaper3.jpg' },
    { name: 'Monterey', path: 'wallpapers/wallpaper4.jpg' },
    { name: 'Big Sur', path: 'wallpapers/wallpaper5.jpg' },
    // Online wallpapers (standard resolution ~5K - loads much faster than 6K)
    { name: 'Sequoia', path: 'https://512pixels.net/downloads/macos-wallpapers/15-Sequoia-Light.jpg' },
    { name: 'Catalina Day', path: 'https://512pixels.net/downloads/macos-wallpapers/10-15-Day.jpg' },
    { name: 'Catalina Night', path: 'https://512pixels.net/downloads/macos-wallpapers/10-15-Night.jpg' },
    { name: 'Mojave Day', path: 'https://512pixels.net/downloads/macos-wallpapers/10-14-Day.jpg' },
    { name: 'Mojave Night', path: 'https://512pixels.net/downloads/macos-wallpapers/10-14-Night.jpg' },
    { name: 'High Sierra', path: 'https://512pixels.net/downloads/macos-wallpapers/10-13.jpg' },
    { name: 'Sierra', path: 'https://512pixels.net/downloads/macos-wallpapers/10-12.jpg' },
    { name: 'El Capitan', path: 'https://512pixels.net/downloads/macos-wallpapers/10-11.jpg' },
];

// Virtual File System
const VFS = {
    _fs: {},

    init() {
        const saved = localStorage.getItem('macos_vfs');
        if (saved) {
            try { this._fs = JSON.parse(saved); return; } catch(e) {}
        }
        // Default filesystem
        this._fs = {
            '/Users/user': { type: 'dir', children: ['Applications','Desktop','Documents','Downloads','Movies','Music','Pictures','Public'] },
            '/Users/user/Applications': { type: 'dir', children: [] },
            '/Users/user/Desktop': { type: 'dir', children: ['Projects','todo.txt'] },
            '/Users/user/Desktop/Projects': { type: 'dir', children: [] },
            '/Users/user/Documents': { type: 'dir', children: ['Work','Personal'] },
            '/Users/user/Documents/Work': { type: 'dir', children: [] },
            '/Users/user/Documents/Personal': { type: 'dir', children: [] },
            '/Users/user/Downloads': { type: 'dir', children: ['macOS-sonoma.dmg'] },
            '/Users/user/Movies': { type: 'dir', children: [] },
            '/Users/user/Music': { type: 'dir', children: [] },
            '/Users/user/Pictures': { type: 'dir', children: ['Photos Library','Screenshots'] },
            '/Users/user/Pictures/Photos Library': { type: 'dir', children: [] },
            '/Users/user/Pictures/Screenshots': { type: 'dir', children: [] },
            '/Users/user/Public': { type: 'dir', children: [] },
            // File metadata
            '/Users/user/Desktop/todo.txt': { type: 'file', icon: '📝', size: '1 KB', content: 'My todo list:\n- Review pull requests\n- Update documentation\n- Ship v2.0\n- Set up CI/CD\n- Write tests' },
            '/Users/user/Downloads/macOS-sonoma.dmg': { type: 'file', icon: '💿', size: '12.3 GB', content: '' },
        };
        this.save();
    },

    save() {
        localStorage.setItem('macos_vfs', JSON.stringify(this._fs));
    },

    ls(path) {
        const node = this._fs[path];
        if (!node || node.type !== 'dir') return [];
        return node.children.map(name => {
            const childPath = path + '/' + name;
            const child = this._fs[childPath];
            if (child && child.type === 'dir') return { name, type: 'folder', icon: '📁', color: '#42A5F5' };
            if (child && child.type === 'app') return { name, type: 'app', icon: child.icon || '📦', size: child.size, appType: child.appType };
            if (child) return { name, type: 'file', icon: child.icon || '📄', size: child.size || '0 KB' };
            // No metadata - guess type
            if (name.includes('.')) return { name, type: 'file', icon: '📄', size: '0 KB' };
            return { name, type: 'folder', icon: '📁', color: '#64B5F6' };
        });
    },

    exists(path) {
        return !!this._fs[path];
    },

    isDir(path) {
        return this._fs[path] && this._fs[path].type === 'dir';
    },

    mkdir(path, name) {
        const dirPath = path + '/' + name;
        if (this._fs[dirPath]) return false;
        this._fs[dirPath] = { type: 'dir', children: [] };
        const parent = this._fs[path];
        if (parent && parent.type === 'dir' && !parent.children.includes(name)) {
            parent.children.push(name);
        }
        this.save();
        MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
        return true;
    },

    touch(path, name, content = '', icon = '📄') {
        const filePath = path + '/' + name;
        const ext = name.split('.').pop().toLowerCase();
        const icons = { txt: '📝', md: '📝', pdf: '📄', doc: '📄', docx: '📄', xls: '📊', xlsx: '📊', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', zip: '📦', dmg: '💿', app: '📦' };
        this._fs[filePath] = { type: 'file', icon: icons[ext] || icon, size: content.length > 0 ? (content.length > 1024 ? Math.floor(content.length/1024) + ' KB' : content.length + ' B') : '0 KB', content: content };
        const parent = this._fs[path];
        if (parent && parent.type === 'dir' && !parent.children.includes(name)) {
            parent.children.push(name);
        }
        this.save();
        MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
        return true;
    },

    writeFile(path, content) {
        if (this._fs[path] && this._fs[path].type === 'file') {
            this._fs[path].content = content;
            this._fs[path].size = content.length > 1024 ? Math.floor(content.length/1024) + ' KB' : content.length + ' B';
            this.save();
            MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
            return true;
        }
        return false;
    },

    readFile(path) {
        if (this._fs[path] && this._fs[path].type === 'file') return this._fs[path].content || '';
        return null;
    },

    rm(path, name) {
        const fullPath = path + '/' + name;
        // Remove from parent
        const parent = this._fs[path];
        if (parent && parent.type === 'dir') {
            parent.children = parent.children.filter(c => c !== name);
        }
        // If directory, recursively delete children
        if (this._fs[fullPath] && this._fs[fullPath].type === 'dir') {
            const children = [...(this._fs[fullPath].children || [])];
            children.forEach(child => this.rm(fullPath, child));
        }
        delete this._fs[fullPath];
        this.save();
        MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
        return true;
    },

    rename(path, oldName, newName) {
        const oldPath = path + '/' + oldName;
        const newPath = path + '/' + newName;
        if (!this._fs[oldPath] || this._fs[newPath]) return false;
        this._fs[newPath] = this._fs[oldPath];
        delete this._fs[oldPath];
        const parent = this._fs[path];
        if (parent && parent.type === 'dir') {
            parent.children = parent.children.map(c => c === oldName ? newName : c);
        }
        // If dir, update child paths
        if (this._fs[newPath].type === 'dir') {
            const updatePaths = (oldBase, newBase) => {
                Object.keys(this._fs).forEach(key => {
                    if (key.startsWith(oldBase + '/')) {
                        const newKey = newBase + key.slice(oldBase.length);
                        this._fs[newKey] = this._fs[key];
                        delete this._fs[key];
                    }
                });
            };
            updatePaths(oldPath, newPath);
        }
        this.save();
        MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
        return true;
    },

    // Trash functionality
    getTrash() {
        const saved = localStorage.getItem('macos_trash');
        if (saved) { try { return JSON.parse(saved); } catch(e) {} }
        return [];
    },

    moveToTrash(parentPath, name) {
        const fullPath = parentPath + '/' + name;
        const item = this._fs[fullPath];
        if (!item) return false;
        const trash = this.getTrash();
        trash.push({
            name,
            originalPath: parentPath,
            type: item.type,
            icon: item.icon,
            size: item.size,
            content: item.content,
            children: item.children,
            deletedAt: Date.now(),
        });
        localStorage.setItem('macos_trash', JSON.stringify(trash));
        // Remove from filesystem
        this.rm(parentPath, name);
        return true;
    },

    restoreFromTrash(trashItem) {
        const trash = this.getTrash();
        const idx = trash.findIndex(t => t.name === trashItem.name && t.deletedAt === trashItem.deletedAt);
        if (idx === -1) return false;
        const item = trash[idx];
        // Ensure parent exists
        if (!this._fs[item.originalPath]) return false;
        // Restore to VFS
        const fullPath = item.originalPath + '/' + item.name;
        if (item.type === 'dir') {
            this._fs[fullPath] = { type: 'dir', children: item.children || [] };
        } else {
            this._fs[fullPath] = { type: item.type || 'file', icon: item.icon, size: item.size, content: item.content || '' };
        }
        const parent = this._fs[item.originalPath];
        if (parent && parent.type === 'dir' && !parent.children.includes(item.name)) {
            parent.children.push(item.name);
        }
        // Remove from trash
        trash.splice(idx, 1);
        localStorage.setItem('macos_trash', JSON.stringify(trash));
        this.save();
        MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
        return true;
    },

    deleteFromTrash(trashItem) {
        const trash = this.getTrash();
        const filtered = trash.filter(t => !(t.name === trashItem.name && t.deletedAt === trashItem.deletedAt));
        localStorage.setItem('macos_trash', JSON.stringify(filtered));
        MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
    },

    emptyTrash() {
        localStorage.setItem('macos_trash', JSON.stringify([]));
        MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
    },

    // Move file/folder from one directory to another
    move(srcParent, name, destParent) {
        const srcPath = srcParent + '/' + name;
        const destPath = destParent + '/' + name;
        if (!this._fs[srcPath]) return false;
        if (destPath === srcPath) return false;
        // Don't move a folder into itself
        if (destPath.startsWith(srcPath + '/')) return false;
        // Check dest is a directory
        if (!this._fs[destParent] || this._fs[destParent].type !== 'dir') return false;
        // Handle name collision - append number
        let finalName = name;
        let finalDest = destPath;
        let counter = 1;
        while (this._fs[finalDest]) {
            const dot = name.lastIndexOf('.');
            if (dot > 0) {
                finalName = name.slice(0, dot) + ' ' + counter + name.slice(dot);
            } else {
                finalName = name + ' ' + counter;
            }
            finalDest = destParent + '/' + finalName;
            counter++;
        }
        // Move the entry
        this._fs[finalDest] = this._fs[srcPath];
        delete this._fs[srcPath];
        // Update source parent children
        const srcDir = this._fs[srcParent];
        if (srcDir && srcDir.type === 'dir') {
            srcDir.children = srcDir.children.filter(c => c !== name);
        }
        // Update dest parent children
        const destDir = this._fs[destParent];
        if (destDir && destDir.type === 'dir' && !destDir.children.includes(finalName)) {
            destDir.children.push(finalName);
        }
        // If directory, recursively update child paths
        if (this._fs[finalDest].type === 'dir') {
            const updatePaths = (oldBase, newBase) => {
                Object.keys(this._fs).forEach(key => {
                    if (key.startsWith(oldBase + '/')) {
                        const newKey = newBase + key.slice(oldBase.length);
                        this._fs[newKey] = this._fs[key];
                        delete this._fs[key];
                    }
                });
            };
            updatePaths(srcPath, finalDest);
        }
        this.save();
        MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
        return true;
    },

    // Desktop shortcuts (app aliases on desktop)
    getDesktopApps() {
        const saved = localStorage.getItem('macos_desktop_apps');
        if (saved) { try { return JSON.parse(saved); } catch(e) {} }
        return [];
    },

    addDesktopApp(appType, appName) {
        const apps = this.getDesktopApps();
        if (!apps.find(a => a.type === appType)) {
            apps.push({ type: appType, name: appName });
            localStorage.setItem('macos_desktop_apps', JSON.stringify(apps));
            MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
        }
    },

    removeDesktopApp(appType) {
        let apps = this.getDesktopApps();
        apps = apps.filter(a => a.type !== appType);
        localStorage.setItem('macos_desktop_apps', JSON.stringify(apps));
        MacStore.setState(s => ({ vfsVersion: (s.vfsVersion || 0) + 1 }));
    },
};

// Init VFS
VFS.init();

// Simple global state manager
const MacStore = {
    _listeners: new Set(),
    _state: {
        locked: true,
        windows: [],
        zIndexCounter: 100,
        activeWindowId: null,
        openApps: new Set(['finder']),
        spotlightOpen: false,
        controlCenterOpen: false,
        notificationCenterOpen: false,
        contextMenu: null,
        darkMode: false,
        wallpaperIndex: 0,
        launchpadOpen: false,
        aboutMacOpen: false,
        activeDropdown: null,
        notifications: [],
        volume: 60,
        brightness: 80,
        wifiOn: true,
        bluetoothOn: true,
        focusOn: false,
        vfsVersion: 0,
        // Dock settings
        dockSize: 48,
        dockMagnification: true,
        dockAutoHide: false,
        dockPosition: 'bottom',
        showRecents: true,
        // Appearance
        accentColor: '#007AFF',
        // Display
        nightShift: false,
        // Accessibility
        reduceMotion: false,
        increaseContrast: false,
        reduceTransparency: false,
        largerText: false,
        // Battery
        showBatteryPercentage: true,
        // Notifications
        notifSounds: true,
        notifLockScreen: true,
        // Global drag state for cross-component file drag-and-drop
        fileDrag: null, // { name, sourcePath, type, sourceComponent }
    },

    getState() {
        return this._state;
    },

    setState(updater) {
        if (typeof updater === 'function') {
            this._state = { ...this._state, ...updater(this._state) };
        } else {
            this._state = { ...this._state, ...updater };
        }
        this._listeners.forEach(l => l(this._state));
        // Auto-save relevant state to localStorage
        this._saveState();
    },

    _saveState() {
        const s = this._state;
        localStorage.setItem('macos_settings', JSON.stringify({
            wallpaperIndex: s.wallpaperIndex,
            darkMode: s.darkMode,
            volume: s.volume,
            brightness: s.brightness,
            wifiOn: s.wifiOn,
            bluetoothOn: s.bluetoothOn,
            focusOn: s.focusOn,
            dockSize: s.dockSize,
            dockMagnification: s.dockMagnification,
            dockAutoHide: s.dockAutoHide,
            dockPosition: s.dockPosition,
            showRecents: s.showRecents,
            accentColor: s.accentColor,
            nightShift: s.nightShift,
            reduceMotion: s.reduceMotion,
            increaseContrast: s.increaseContrast,
            reduceTransparency: s.reduceTransparency,
            largerText: s.largerText,
            showBatteryPercentage: s.showBatteryPercentage,
            notifSounds: s.notifSounds,
            notifLockScreen: s.notifLockScreen,
        }));
    },

    loadState() {
        const saved = localStorage.getItem('macos_settings');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this._state = { ...this._state, ...data };
            } catch(e) {}
        }
    },

    subscribe(listener) {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    },

    setWallpaper(index) {
        this.setState({ wallpaperIndex: index });
    },

    nextWallpaper() {
        this.setState(s => ({ wallpaperIndex: (s.wallpaperIndex + 1) % WALLPAPERS.length }));
    },

    // Window management
    openWindow(appType, title, width = 800, height = 500) {
        const state = this.getState();
        const existing = state.windows.find(w => w.appType === appType);
        if (existing) {
            if (existing.minimized) {
                this.restoreWindow(existing.id);
            } else {
                this.focusWindow(existing.id);
            }
            return existing.id;
        }

        const id = 'win-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        const newZ = state.zIndexCounter + 1;
        const x = Math.max(50, (window.innerWidth - width) / 2 + Math.random() * 40 - 20);
        const y = Math.max(30, (window.innerHeight - height) / 3 + Math.random() * 30 - 15);

        const win = {
            id, title, appType,
            appName: title,
            x, y, width, height,
            minimized: false,
            maximized: false,
            focused: true,
            zIndex: newZ,
            opening: true,
        };

        const newWindows = state.windows.map(w => ({...w, focused: false}));
        newWindows.push(win);

        const openApps = new Set(state.openApps);
        openApps.add(appType);

        this.setState({
            windows: newWindows,
            zIndexCounter: newZ,
            activeWindowId: id,
            openApps,
            launchpadOpen: false,
        });

        setTimeout(() => {
            this.setState(s => ({
                windows: s.windows.map(w => w.id === id ? {...w, opening: false} : w)
            }));
        }, 300);

        return id;
    },

    closeWindow(windowId) {
        const state = this.getState();
        this.setState(s => ({
            windows: s.windows.map(w => w.id === windowId ? {...w, closing: true} : w)
        }));

        setTimeout(() => {
            this.setState(s => {
                const windows = s.windows.filter(w => w.id !== windowId);
                const remaining = windows.filter(w => !w.minimized);
                const newActive = remaining.length > 0 ? remaining[remaining.length - 1].id : null;

                const openApps = new Set(['finder']);
                windows.forEach(w => openApps.add(w.appType));

                return {
                    windows: windows.map(w => w.id === newActive ? {...w, focused: true} : {...w, focused: false}),
                    activeWindowId: newActive,
                    openApps,
                };
            });
        }, 200);
    },

    focusWindow(windowId) {
        this.setState(s => {
            const newZ = s.zIndexCounter + 1;
            return {
                windows: s.windows.map(w => ({
                    ...w,
                    focused: w.id === windowId,
                    zIndex: w.id === windowId ? newZ : w.zIndex,
                })),
                zIndexCounter: newZ,
                activeWindowId: windowId,
            };
        });
    },

    minimizeWindow(windowId) {
        // Start minimize animation
        this.setState(s => ({
            windows: s.windows.map(w =>
                w.id === windowId ? {...w, minimizing: true, focused: false} : w
            )
        }));
        // After animation, actually minimize
        setTimeout(() => {
            this.setState(s => {
                const windows = s.windows.map(w =>
                    w.id === windowId ? {...w, minimized: true, minimizing: false} : w
                );
                const remaining = windows.filter(w => !w.minimized);
                const newActive = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
                return {
                    windows: windows.map(w => w.id === newActive ? {...w, focused: true} : w),
                    activeWindowId: newActive,
                };
            });
        }, 400);
    },

    restoreWindow(windowId) {
        this.setState(s => {
            const newZ = s.zIndexCounter + 1;
            return {
                windows: s.windows.map(w => ({
                    ...w,
                    minimized: w.id === windowId ? false : w.minimized,
                    restoring: w.id === windowId ? true : false,
                    focused: w.id === windowId,
                    zIndex: w.id === windowId ? newZ : w.zIndex,
                })),
                zIndexCounter: newZ,
                activeWindowId: windowId,
            };
        });
        setTimeout(() => {
            this.setState(s => ({
                windows: s.windows.map(w => w.id === windowId ? {...w, restoring: false} : w)
            }));
        }, 300);
    },

    toggleMaximize(windowId) {
        this.setState(s => ({
            windows: s.windows.map(w =>
                w.id === windowId ? {...w, maximized: !w.maximized} : w
            )
        }));
    },

    updateWindow(windowId, updates) {
        this.setState(s => ({
            windows: s.windows.map(w =>
                w.id === windowId ? {...w, ...updates} : w
            )
        }));
    },

    unfocusAll() {
        this.setState(s => ({
            windows: s.windows.map(w => ({...w, focused: false})),
            activeWindowId: null,
        }));
    },

    addNotification(app, title, body) {
        const notif = { id: Date.now().toString(), app, title, body, time: new Date() };
        this.setState(s => ({
            notifications: [...s.notifications, notif]
        }));
        setTimeout(() => {
            this.setState(s => ({
                notifications: s.notifications.filter(n => n.id !== notif.id)
            }));
        }, 5000);
    },
};

// Load saved settings
MacStore.loadState();

// Hook to use store in components
function useStore(selector) {
    const [state, setState] = _useState(selector ? selector(MacStore.getState()) : MacStore.getState());
    _useEffect(() => {
        return MacStore.subscribe(s => {
            const next = selector ? selector(s) : s;
            setState(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(next)) return next;
                return prev;
            });
        });
    }, []);
    return state;
}

// Hook for animated mount/unmount of overlays
function useAnimatedVisibility(isOpen, duration = 200) {
    const [visible, setVisible] = _useState(isOpen);
    const [closing, setClosing] = _useState(false);

    _useEffect(() => {
        if (isOpen) {
            setVisible(true);
            setClosing(false);
        } else if (visible) {
            setClosing(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setClosing(false);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return { shouldRender: visible, isClosing: closing };
}

window.MacStore = MacStore;
window.useStore = useStore;
window.useAnimatedVisibility = useAnimatedVisibility;
window.WALLPAPERS = WALLPAPERS;
window.VFS = VFS;
