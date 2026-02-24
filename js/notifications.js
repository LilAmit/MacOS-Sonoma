// macOS Notification Center & Widgets
document.addEventListener('DOMContentLoaded', () => {
    const ncBtn = document.getElementById('notification-btn');
    const nc = document.getElementById('notification-center');

    ncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cc = document.getElementById('control-center');
        cc.style.display = 'none';

        if (nc.style.display === 'none') {
            nc.style.display = '';
            buildCalendarWidget();
            updateNCDate();
        } else {
            nc.style.display = 'none';
        }
    });

    // Close NC on outside click
    document.addEventListener('click', (e) => {
        if (!nc.contains(e.target) && !ncBtn.contains(e.target)) {
            nc.style.display = 'none';
        }
    });

    // Reminder checkboxes
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('nc-reminder-checkbox')) {
            e.target.classList.toggle('checked');
            const text = e.target.nextElementSibling;
            if (text) {
                text.style.textDecoration = e.target.classList.contains('checked') ? 'line-through' : 'none';
                text.style.color = e.target.classList.contains('checked') ? '#c7c7cc' : '';
            }
        }
    });

    function updateNCDate() {
        const dateEl = document.getElementById('nc-date');
        if (dateEl) {
            const now = new Date();
            dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        }
    }

    function buildCalendarWidget() {
        const grid = document.getElementById('nc-calendar-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const today = now.getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Day headers
        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
            const el = document.createElement('div');
            el.className = 'nc-calendar-day-header';
            el.textContent = d;
            grid.appendChild(el);
        });

        // Previous month filler
        for (let i = firstDay - 1; i >= 0; i--) {
            const el = document.createElement('div');
            el.className = 'nc-calendar-day other-month';
            el.textContent = prevMonthDays - i;
            grid.appendChild(el);
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const el = document.createElement('div');
            el.className = 'nc-calendar-day' + (d === today ? ' today' : '');
            el.textContent = d;
            grid.appendChild(el);
        }

        // Next month filler
        const totalCells = firstDay + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let d = 1; d <= remaining; d++) {
            const el = document.createElement('div');
            el.className = 'nc-calendar-day other-month';
            el.textContent = d;
            grid.appendChild(el);
        }
    }

    // Send a welcome notification after a delay
    setTimeout(() => {
        if (!MacOS.isLocked) {
            MacOS.showNotification('Calendar', 'Upcoming Event', 'Team meeting in 30 minutes', '#FF3B30');
        }
    }, 10000);
});
