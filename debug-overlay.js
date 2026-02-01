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
        lastScroll: 0
    };

    const update = () => {
        const lines = [
            `ua: ${navigator.userAgent}`,
            `hash: ${format(window.location.hash)}`,
            `scrollY: ${Math.round(window.scrollY)}`,
            `scrollX: ${Math.round(window.scrollX)}`,
            `active: ${document.querySelector('.page-content.active')?.id || '-'}`,
            `last click: ${state.lastClick}`,
            `last pointer: ${state.lastPointer}`,
            `last hashchange: ${state.lastHash || '-'}`,
            `last scroll: ${Math.round(state.lastScroll || 0)}`
        ];
        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay) overlay.textContent = lines.join('\n');
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(createOverlay());
        update();

        window.addEventListener('hashchange', () => {
            state.lastHash = window.location.hash;
            update();
        });

        window.addEventListener('scroll', () => {
            state.lastScroll = window.scrollY;
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
