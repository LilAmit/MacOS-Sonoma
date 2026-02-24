// macOS Control Center
document.addEventListener('DOMContentLoaded', () => {
    const ccBtn = document.getElementById('control-center-btn');
    const cc = document.getElementById('control-center');

    ccBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nc = document.getElementById('notification-center');
        nc.style.display = 'none';

        if (cc.style.display === 'none') {
            cc.style.display = '';
        } else {
            cc.style.display = 'none';
        }
    });

    // Toggle tiles
    document.querySelectorAll('.cc-tile, .cc-toggle-item').forEach(tile => {
        tile.addEventListener('click', () => {
            tile.classList.toggle('active');

            // Dark mode toggle
            if (tile.id === 'cc-darkmode') {
                MacOS.toggleDarkMode();
            }
        });
    });

    // Close CC on outside click
    document.addEventListener('click', (e) => {
        if (!cc.contains(e.target) && !ccBtn.contains(e.target)) {
            cc.style.display = 'none';
        }
    });

    // Brightness slider
    const brightness = document.getElementById('cc-brightness');
    if (brightness) {
        brightness.addEventListener('input', (e) => {
            const val = e.target.value / 100;
            document.querySelector('.wallpaper').style.filter = `brightness(${0.3 + val * 0.7})`;
        });
    }
});
