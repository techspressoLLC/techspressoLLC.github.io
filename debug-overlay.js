(() => {
    const OVERLAY_ID = 'debug-overlay';

    const createOverlay = () => {
        const wrap = document.createElement('div');
        wrap.id = OVERLAY_ID;
        wrap.style.cssText = [
            'position:fixed',
            'left:8px',
            'top:8px',
            'z-index:99999',
            'max-width:90vw',
            'background:rgba(15,23,42,0.95)',
            'color:#e2e8f0',
            'padding:10px 12px',
            'border-radius:10px',
            'font:11px/1.4 monospace',
            'box-shadow:0 8px 20px rgba(0,0,0,0.2)'
        ].join(';');
        wrap.textContent = 'debug overlay';
        return wrap;
    };

    const format = (value) => {
        if (value === undefined || value === null) return '-';
        return String(value);
    };

    const getClickTarget = (event) => {
        const raw = event?.target;
        const el = raw instanceof Element ? raw : raw?.parentElement;
        if (!el) return '-';
        const dataType = el.closest('[data-filter-type]')?.dataset?.filterType;
        const dataValue = el.closest('[data-filter-type]')?.dataset?.filterValue;
        const tag = el.tagName ? el.tagName.toLowerCase() : '-';
        return `${tag}${dataType ? ` data=${dataType}:${dataValue}` : ''}`;
    };

    const state = {
        lastClick: '-',
        lastPointer: '-',
        lastHash: '',
        lastScroll: 0,
        hashChanges: 0,
        scrollEvents: 0,
        lastError: '-'
    };

    const update = () => {
        const activeId = document.querySelector('.page-content.active')?.id || '-';
        const lines = [
            `ua: ${navigator.userAgent}`,
            `href: ${format(window.location.href)}`,
            `hash: ${format(window.location.hash)}`,
            `scrollY: ${Math.round(window.scrollY)}`,
            `scrollX: ${Math.round(window.scrollX)}`,
            `active: ${activeId}`,
            `last click: ${state.lastClick}`,
            `last pointer: ${state.lastPointer}`,
            `hashchange: ${state.hashChanges} last=${state.lastHash || '-'}`,
            `scroll: ${state.scrollEvents} last=${Math.round(state.lastScroll || 0)}`,
            `visibility: ${document.visibilityState}`,
            `last error: ${state.lastError}`
        ];
        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay) overlay.textContent = lines.join('\n');
    };

    const logLines = [];
    const appendLog = (message) => {
        const stamp = new Date().toISOString().split('T')[1]?.replace('Z', '') || '';
        logLines.push(`${stamp} ${message}`);
        while (logLines.length > 6) logLines.shift();
        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay) overlay.textContent = `${overlay.textContent}\n${logLines.join('\n')}`;
    };

    window.__debugOverlayLog = appendLog;
    window.__debugOverlayLogQueue = window.__debugOverlayLogQueue || [];

    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(createOverlay());
        if (window.__debugOverlayLogQueue.length) {
            window.__debugOverlayLogQueue.forEach((msg) => appendLog(msg));
            window.__debugOverlayLogQueue = [];
        }
        update();

        window.addEventListener('hashchange', () => {
            state.lastHash = window.location.hash;
            state.hashChanges += 1;
            appendLog(`hashchange -> ${window.location.hash || '(empty)'}`);
            update();
        });

        window.addEventListener('scroll', () => {
            state.lastScroll = window.scrollY;
            state.scrollEvents += 1;
            if (state.scrollEvents % 20 === 0) {
                appendLog(`scrollY=${Math.round(window.scrollY)}`);
            }
            update();
        }, { passive: true });

        window.addEventListener('pageshow', (event) => {
            state.lastClick = `pageshow persisted=${event.persisted}`;
            update();
        });

        document.addEventListener('visibilitychange', () => {
            state.lastClick = `visibility ${document.visibilityState}`;
            update();
        });

        window.addEventListener('focus', () => {
            state.lastClick = 'focus';
            update();
        });

        window.addEventListener('error', (event) => {
            state.lastError = event?.message || 'error';
            update();
        });

        window.addEventListener('unhandledrejection', (event) => {
            state.lastError = event?.reason?.message || 'unhandledrejection';
            update();
        });

        document.addEventListener('pointerdown', (event) => {
            state.lastPointer = getClickTarget(event);
            update();
        }, true);

        document.addEventListener('click', (event) => {
            state.lastClick = getClickTarget(event);
            update();
        }, true);
    });
})();
