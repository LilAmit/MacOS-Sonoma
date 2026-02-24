// macOS Context Menu
const ContextMenu = {
    hide() {
        const menu = document.getElementById('context-menu');
        if (menu) menu.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const contextMenu = document.getElementById('context-menu');

    // Right click on desktop
    document.addEventListener('contextmenu', (e) => {
        // Only show on desktop/wallpaper
        if (e.target.classList.contains('wallpaper') ||
            e.target.id === 'desktop' ||
            e.target.classList.contains('desktop-icons')) {
            e.preventDefault();
            contextMenu.style.left = e.clientX + 'px';
            contextMenu.style.top = e.clientY + 'px';
            contextMenu.style.display = '';

            // Make sure it's within viewport
            const rect = contextMenu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                contextMenu.style.left = (e.clientX - rect.width) + 'px';
            }
            if (rect.bottom > window.innerHeight) {
                contextMenu.style.top = (e.clientY - rect.height) + 'px';
            }
        } else {
            // Prevent right-click everywhere else to feel more mac-like
            e.preventDefault();
        }
    });

    // Hide on click
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });

    // Change wallpaper option
    const changeWallpaperItem = [...contextMenu.querySelectorAll('.context-item')].find(i => i.textContent.includes('Change Wallpaper'));
    if (changeWallpaperItem) {
        changeWallpaperItem.addEventListener('click', () => {
            const wallpapers = [
                'linear-gradient(135deg, #1a1a2e 0%, #16213e 15%, #0f3460 30%, #533483 45%, #e94560 60%, #f38181 70%, #fce38a 80%, #eaffd0 90%, #95e1d3 100%)',
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                'linear-gradient(180deg, #0c0c1d 0%, #111132 20%, #1a1a4e 40%, #2d2d7f 60%, #4a4ab0 80%, #6b6bcc 100%)',
            ];
            const current = document.querySelector('.wallpaper').style.background;
            let idx = Math.floor(Math.random() * wallpapers.length);
            document.querySelector('.wallpaper').style.background = wallpapers[idx];
            document.querySelector('.wallpaper').style.backgroundSize = '400% 400%';
            document.querySelector('.wallpaper').style.animation = 'wallpaperShift 120s ease infinite';
        });
    }
});
