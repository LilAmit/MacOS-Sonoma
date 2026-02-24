// macOS Dock interactions
document.addEventListener('DOMContentLoaded', () => {
    const dock = document.getElementById('dock');
    if (!dock) return;

    // Magnification effect
    const dockItems = dock.querySelectorAll('.dock-item');

    dock.addEventListener('mousemove', (e) => {
        dockItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const dist = Math.abs(e.clientX - itemCenter);

            if (dist < 80) {
                item.classList.add('neighbor-2');
            } else {
                item.classList.remove('neighbor-2');
            }
            if (dist < 50) {
                item.classList.add('neighbor-1');
                item.classList.remove('neighbor-2');
            } else {
                item.classList.remove('neighbor-1');
            }
        });
    });

    dock.addEventListener('mouseleave', () => {
        dockItems.forEach(item => {
            item.classList.remove('neighbor-1', 'neighbor-2');
        });
    });

    // Click on dock item to open/focus app or restore minimized
    dockItems.forEach(item => {
        item.addEventListener('click', () => {
            const appType = item.dataset.app;
            if (!appType) return;

            // Check for minimized windows of this type
            const minimizedWin = MacOS.windows.find(w => w.appType === appType && w.minimized);
            if (minimizedWin) {
                MacOS.restoreWindow(minimizedWin.id);
                return;
            }

            // Check for existing window
            const existingWin = MacOS.windows.find(w => w.appType === appType && !w.minimized);
            if (existingWin) {
                MacOS.focusWindow(existingWin.id);
                return;
            }
        });
    });
});
