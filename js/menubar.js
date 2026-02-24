// macOS Menu Bar interactions
document.addEventListener('DOMContentLoaded', () => {
    const appleMenuBtn = document.getElementById('apple-menu-btn');
    const appleMenuDropdown = document.getElementById('apple-menu-dropdown');
    const fileMenuDropdown = document.getElementById('file-menu-dropdown');
    let activeDropdown = null;

    function hideAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
        activeDropdown = null;
    }

    // Apple menu
    appleMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeDropdown === appleMenuDropdown) {
            hideAllDropdowns();
            return;
        }
        hideAllDropdowns();
        const rect = appleMenuBtn.getBoundingClientRect();
        appleMenuDropdown.style.left = rect.left + 'px';
        appleMenuDropdown.style.display = '';
        activeDropdown = appleMenuDropdown;
    });

    // File menu
    const fileMenuItem = document.querySelector('.menu-item[data-menu="file"]');
    if (fileMenuItem) {
        fileMenuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeDropdown === fileMenuDropdown) {
                hideAllDropdowns();
                return;
            }
            hideAllDropdowns();
            const rect = fileMenuItem.getBoundingClientRect();
            fileMenuDropdown.style.left = rect.left + 'px';
            fileMenuDropdown.style.display = '';
            activeDropdown = fileMenuDropdown;
        });
    }

    // Other menu items - show inline dropdown behavior
    document.querySelectorAll('.menu-item[data-menu]').forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (activeDropdown) {
                hideAllDropdowns();
                const menu = item.dataset.menu;
                if (menu === 'file') {
                    const rect = item.getBoundingClientRect();
                    fileMenuDropdown.style.left = rect.left + 'px';
                    fileMenuDropdown.style.display = '';
                    activeDropdown = fileMenuDropdown;
                }
            }
        });
    });

    // Hide dropdowns on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-menu') && !e.target.closest('.menu-item')) {
            hideAllDropdowns();
        }
    });

    // About This Mac
    const aboutItem = appleMenuDropdown.querySelector('.dropdown-item:first-child');
    if (aboutItem) {
        aboutItem.addEventListener('click', () => {
            hideAllDropdowns();
            document.getElementById('about-mac-overlay').style.display = '';
        });
    }

    // System Settings from menu
    const settingsItem = appleMenuDropdown.querySelectorAll('.dropdown-item')[1];
    if (settingsItem) {
        settingsItem.addEventListener('click', () => {
            hideAllDropdowns();
            openApp('settings');
        });
    }

    // Lock Screen
    const lockBtn = document.getElementById('lock-screen-btn');
    if (lockBtn) {
        lockBtn.addEventListener('click', () => {
            hideAllDropdowns();
            MacOS.lockScreen();
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            hideAllDropdowns();
            MacOS.lockScreen();
        });
    }
});
