/* =========================================================
   SIDEBAR & HAMBURGER MENU HANDLER
   ========================================================= */

let sidebarCloseTimer = null;
let sidebarPreviousFocus = null;

function openSidebar(event) {
    if (event) event.preventDefault();

    const overlay = document.getElementById('sidebarOverlay');
    const menu = document.getElementById('sidebarMenu');
    const toggle = document.getElementById('sidebarToggleButton');

    if (!overlay || !menu) {
        window.sidebarOpenPending = true;
        return;
    }

    if (!overlay.classList.contains('hidden') && !menu.classList.contains('translate-x-full')) {
        closeSidebar();
        return;
    }

    clearTimeout(sidebarCloseTimer);
    sidebarPreviousFocus = document.activeElement;

    overlay.hidden = false;
    menu.inert = false;
    window.sidebarOpenPending = false;
    document.body.style.overflowY = 'hidden';

    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    toggle?.setAttribute('aria-expanded', 'true');

    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        menu.classList.remove('translate-x-full');
        if (overlay.getAttribute('aria-hidden') === 'false') {
            menu.querySelector('button, a')?.focus();
        }
    });
}

function closeSidebar() {
    const overlay = document.getElementById('sidebarOverlay');
    const menu = document.getElementById('sidebarMenu');
    const toggle = document.getElementById('sidebarToggleButton');

    if (!overlay || !menu) return;

    window.sidebarOpenPending = false;
    document.body.style.overflowY = '';
    menu.inert = true;
    overlay.classList.add('opacity-0');
    overlay.setAttribute('aria-hidden', 'true');
    toggle?.setAttribute('aria-expanded', 'false');
    menu.classList.add('translate-x-full');

    clearTimeout(sidebarCloseTimer);
    sidebarCloseTimer = setTimeout(() => {
        overlay.hidden = true;
        overlay.classList.add('hidden');
    }, 250);

    if (sidebarPreviousFocus) {
        sidebarPreviousFocus.focus();
        sidebarPreviousFocus = null;
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeSidebar();
    }
});

document.addEventListener('keydown', event => {
    const overlay = document.getElementById('sidebarOverlay');
    if (event.key !== 'Tab' || overlay?.getAttribute('aria-hidden') !== 'false') return;

    const focusable = [...overlay.querySelectorAll('button, a[href]')].filter(e => !e.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
    }
});

function loadSidebarComponent() {
    const container = document.getElementById('sidebar-container');
    if (!container || container.dataset.loaded === 'true') return Promise.resolve(false);

    return fetch('components/sidebar.html', { cache: 'no-store' })
        .then((response) => {
            if (!response.ok) throw new Error('Failed to load sidebar: ' + response.status);
            return response.text();
        })
        .then((markup) => {
            container.innerHTML = markup;
            container.dataset.loaded = 'true';
            window.DJ_I18N?.applyTranslations?.(container);
            document.dispatchEvent(new CustomEvent('duitjom:component-loaded', { detail: { containerId: 'sidebar-container' } }));
            if (window.sidebarOpenPending) openSidebar();
            return true;
        })
        .catch((error) => {
            console.error('Sidebar error:', error);
            return false;
        });
}

/* Sidebar navigation actions (called from components/sidebar.html). */
function sidebarHomeAction() {
    closeSidebar();
}

function aboutUsAction() {
    closeSidebar();
    window.location.assign('/about-us/');
}

function blogAction() {
    closeSidebar();
    window.location.assign('/blog/');
}

function applyNowAction() {
    window.open('https://www.r-cash.my/', '_blank', 'noopener,noreferrer');
}

function packageAction() {
    closeSidebar();
    window.open('https://www.r-cash.my/', '_blank', 'noopener,noreferrer');
}

document.addEventListener('DOMContentLoaded', () => {
    loadSidebarComponent();

    const toggle = document.getElementById('sidebarToggleButton');
    if (toggle) {
        toggle.addEventListener('click', openSidebar);
    }

    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeSidebar();
            }
        });
    }

    if (window.sidebarOpenPending) {
        openSidebar();
    }
});