const carousel = document.getElementById('shop-carousel');
if (carousel) {
    let rafId = 0;
    const speed = 0.9; // px per frame
    let isHovering = false;
    let isPointerDown = false;
    let startX = 0;
    let startScroll = 0;
    let loopPoint = 0;
    let normalizeScheduled = false;
    const debugEnabled = new URLSearchParams(window.location.search).has('debug');
    let debugPanel = null;

    const ensureDebugPanel = () => {
        if (!debugEnabled || debugPanel) return;
        const panel = document.createElement('div');
        panel.id = 'shop-carousel-debug';
        panel.setAttribute('aria-live', 'polite');
        panel.textContent = 'shop carousel debug';
        document.body.appendChild(panel);
        debugPanel = panel;
    };

    const updateDebug = () => {
        if (!debugPanel) return;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const running = Boolean(rafId) && !isHovering && !isPointerDown;
        debugPanel.textContent =
            `shop-carousel\n` +
            `running: ${running}\n` +
            `scrollLeft: ${carousel.scrollLeft.toFixed(1)}\n` +
            `loopPoint: ${loopPoint.toFixed(1)}\n` +
            `items: ${items.length}\n` +
            `client: ${carousel.clientWidth} x ${carousel.clientHeight}\n` +
            `dpr: ${window.devicePixelRatio || 1}\n` +
            `reduced: ${prefersReduced}`;
    };

    const items = Array.from(carousel.children);
    const cloneCount = items.length;
    for (let i = 0; i < cloneCount; i += 1) {
        const clone = items[i].cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        carousel.appendChild(clone);
    }

    const getGap = () => {
        const style = getComputedStyle(carousel);
        const gap = parseFloat(style.columnGap || style.gap || '0');
        return Number.isFinite(gap) ? gap : 0;
    };

    const measureLoopPoint = () => {
        const originalItems = Array.from(carousel.children).filter((el) => !el.hasAttribute('aria-hidden'));
        if (originalItems.length === 0) return 0;
        const gap = getGap();
        let total = 0;
        originalItems.forEach((item, index) => {
            total += item.getBoundingClientRect().width;
            if (index < originalItems.length - 1) total += gap;
        });
        return total;
    };

    const updateLoopPoint = () => {
        loopPoint = measureLoopPoint();
    };

    const disableSnap = () => {
        carousel.style.scrollSnapType = 'none';
    };

    const enableSnap = () => {
        carousel.style.scrollSnapType = 'x mandatory';
    };

    const wrapScroll = (value) => {
        if (!loopPoint) return value;
        const mod = value % loopPoint;
        return mod < 0 ? mod + loopPoint : mod;
    };

    const normalizeScroll = () => {
        if (!loopPoint) return;
        carousel.scrollLeft = wrapScroll(carousel.scrollLeft);
    };

    const scheduleNormalize = () => {
        if (normalizeScheduled) return;
        normalizeScheduled = true;
        requestAnimationFrame(() => {
            normalizeScheduled = false;
            normalizeScroll();
        });
    };

    const tick = () => {
        if (!isHovering && !isPointerDown) {
            disableSnap();
            if (loopPoint) {
                carousel.scrollLeft = wrapScroll(carousel.scrollLeft + speed);
            }
        }
        updateDebug();
        rafId = requestAnimationFrame(tick);
    };

    const startAuto = () => {
        if (!rafId) rafId = requestAnimationFrame(tick);
    };

    carousel.addEventListener('mouseenter', () => {
        isHovering = true;
        disableSnap();
        updateDebug();
    });
    carousel.addEventListener('mouseleave', () => {
        isHovering = false;
        updateDebug();
    });

    carousel.addEventListener('pointerdown', (event) => {
        isPointerDown = true;
        disableSnap();
        startX = event.clientX;
        startScroll = wrapScroll(carousel.scrollLeft);
        carousel.setPointerCapture(event.pointerId);
        updateDebug();
    });

    carousel.addEventListener('pointermove', (event) => {
        if (!isPointerDown) return;
        const walk = event.clientX - startX;
        carousel.scrollLeft = wrapScroll(startScroll - walk);
    });

    const stopPointer = () => {
        if (!isPointerDown) return;
        isPointerDown = false;
        normalizeScroll();
        enableSnap();
        updateDebug();
    };

    carousel.addEventListener('pointerup', stopPointer);
    carousel.addEventListener('pointerleave', stopPointer);
    carousel.addEventListener('pointercancel', stopPointer);

    carousel.addEventListener('scroll', () => {
        if (isHovering || isPointerDown) {
            scheduleNormalize();
        }
    });

    const refreshLoop = () => {
        updateLoopPoint();
        normalizeScroll();
        updateDebug();
    };

    window.addEventListener('resize', refreshLoop);
    window.addEventListener('orientationchange', refreshLoop);

    window.addEventListener('load', () => {
        refreshLoop();
        startAuto();
    }, { once: true });

    ensureDebugPanel();
    updateLoopPoint();
    startAuto();
    requestAnimationFrame(refreshLoop);
    setTimeout(refreshLoop, 400);

    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(() => refreshLoop());
        ro.observe(carousel);
        items.forEach((item) => ro.observe(item));
    }
}
