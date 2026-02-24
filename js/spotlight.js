// macOS Spotlight Search
const Spotlight = {
    apps: [
        { name: 'Finder', type: 'finder', category: 'Applications' },
        { name: 'Safari', type: 'safari', category: 'Applications' },
        { name: 'Messages', type: 'messages', category: 'Applications' },
        { name: 'Mail', type: 'mail', category: 'Applications' },
        { name: 'Maps', type: 'maps', category: 'Applications' },
        { name: 'Photos', type: 'photos', category: 'Applications' },
        { name: 'Notes', type: 'notes', category: 'Applications' },
        { name: 'Calculator', type: 'calculator', category: 'Applications' },
        { name: 'Terminal', type: 'terminal', category: 'Applications' },
        { name: 'System Settings', type: 'settings', category: 'Applications' },
        { name: 'TextEdit', type: 'textedit', category: 'Applications' },
        { name: 'Calendar', type: 'calendar', category: 'Applications' },
        { name: 'Launchpad', type: 'launchpad', category: 'Applications' },
    ],

    toggle() {
        const overlay = document.getElementById('spotlight-overlay');
        if (overlay.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    },

    show() {
        const overlay = document.getElementById('spotlight-overlay');
        overlay.style.display = '';
        const input = document.getElementById('spotlight-input');
        input.value = '';
        input.focus();
        document.getElementById('spotlight-results').innerHTML = '';
        this.setupInput();
    },

    hide() {
        document.getElementById('spotlight-overlay').style.display = 'none';
    },

    setupInput() {
        const input = document.getElementById('spotlight-input');

        // Remove existing listeners by cloning
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        newInput.addEventListener('input', (e) => this.search(e.target.value));
        newInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hide();
            if (e.key === 'Enter') {
                const selected = document.querySelector('.spotlight-result-item.selected') || document.querySelector('.spotlight-result-item');
                if (selected) selected.click();
            }
        });
        newInput.focus();
    },

    search(query) {
        const results = document.getElementById('spotlight-results');
        if (!query.trim()) {
            results.innerHTML = '';
            return;
        }

        const q = query.toLowerCase();
        const matched = this.apps.filter(a => a.name.toLowerCase().includes(q));

        // Group by category
        const groups = {};
        matched.forEach(a => {
            if (!groups[a.category]) groups[a.category] = [];
            groups[a.category].push(a);
        });

        let html = '';

        // Applications
        if (groups['Applications']) {
            html += `<div class="spotlight-result-section">
                <div class="spotlight-result-header">Applications</div>`;
            groups['Applications'].forEach((app, i) => {
                html += `<div class="spotlight-result-item ${i === 0 ? 'selected' : ''}" onclick="openApp('${app.type}'); Spotlight.hide();">
                    <div class="spotlight-result-icon">
                        <svg viewBox="0 0 32 32" width="32" height="32"><rect x="1" y="1" width="30" height="30" rx="7" fill="#007AFF"/><text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-weight="600">${app.name[0]}</text></svg>
                    </div>
                    <div class="spotlight-result-info">
                        <div class="spotlight-result-name">${app.name}</div>
                        <div class="spotlight-result-detail">Application</div>
                    </div>
                </div>`;
            });
            html += '</div>';
        }

        // Calculator detection
        if (/^[\d\s+\-*/().]+$/.test(query) && query.length > 1) {
            try {
                const calcResult = Function('"use strict"; return (' + query.replace(/×/g, '*').replace(/÷/g, '/') + ')')();
                if (typeof calcResult === 'number' && !isNaN(calcResult)) {
                    html += `<div class="spotlight-result-section">
                        <div class="spotlight-result-header">Calculator</div>
                        <div class="spotlight-result-item">
                            <div class="spotlight-result-icon">
                                <svg viewBox="0 0 32 32" width="32" height="32"><rect x="1" y="1" width="30" height="30" rx="7" fill="#333"/><text x="16" y="22" text-anchor="middle" fill="white" font-size="14">=</text></svg>
                            </div>
                            <div class="spotlight-result-info">
                                <div class="spotlight-result-name">${calcResult}</div>
                                <div class="spotlight-result-detail">${query} =</div>
                            </div>
                        </div>
                    </div>`;
                }
            } catch (e) {}
        }

        // Suggestions
        if (q.length >= 2) {
            html += `<div class="spotlight-result-section">
                <div class="spotlight-result-header">Siri Suggestions</div>
                <div class="spotlight-result-item">
                    <div class="spotlight-result-icon">
                        <svg viewBox="0 0 32 32" width="32" height="32"><rect x="1" y="1" width="30" height="30" rx="7" fill="#007AFF"/><path d="M16 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="white"/></svg>
                    </div>
                    <div class="spotlight-result-info">
                        <div class="spotlight-result-name">Search the web for "${query}"</div>
                        <div class="spotlight-result-detail">Safari - Google Search</div>
                    </div>
                </div>
            </div>`;
        }

        results.innerHTML = html || '<div style="padding:20px;text-align:center;color:#86868b;">No results</div>';
    }
};

// Overlay click to close
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('spotlight-overlay');
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) Spotlight.hide();
    });

    // Spotlight button
    document.getElementById('spotlight-btn').addEventListener('click', () => Spotlight.toggle());
});
