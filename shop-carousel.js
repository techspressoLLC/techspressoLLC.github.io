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
    let autoScrollPos = 0;
    const isIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
    const debugEnabled = false;
    let debugPanel = null;

    const ensureDebugPanel = () => {
        if (!debugEnabled) {
            const existing = document.getElementById('shop-carousel-debug');
            if (existing) existing.remove();
            return;
        }
        if (debugPanel) return;
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
        const scrollWidth = carousel.scrollWidth;
        const clientWidth = carousel.clientWidth;
        const maxScroll = Math.max(0, scrollWidth - clientWidth);
        const applied = carousel.scrollLeft;
        const delta = applied - lastTarget;
        debugPanel.textContent =
            `shop-carousel\n` +
            `running: ${running}\n` +
            `scrollLeft: ${carousel.scrollLeft.toFixed(1)}\n` +
            `target: ${lastTarget.toFixed(1)}\n` +
            `delta: ${delta.toFixed(1)}\n` +
            `scrollWidth: ${scrollWidth.toFixed(1)}\n` +
            `maxScroll: ${maxScroll.toFixed(1)}\n` +
            `loopPoint: ${loopPoint.toFixed(1)}\n` +
            `items: ${items.length}\n` +
            `client: ${clientWidth} x ${carousel.clientHeight}\n` +
            `dpr: ${window.devicePixelRatio || 1}\n` +
            `reduced: ${prefersReduced}\n` +
            `hover: ${isHovering} down: ${isPointerDown} auto: ${carousel.classList.contains('auto-scrolling')}`;
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
        autoScrollPos = wrapScroll(carousel.scrollLeft);
        carousel.scrollLeft = autoScrollPos;
    };

    const scheduleNormalize = () => {
        if (normalizeScheduled) return;
        normalizeScheduled = true;
        requestAnimationFrame(() => {
            normalizeScheduled = false;
            normalizeScroll();
        });
    };

    let lastTarget = 0;

    const tick = () => {
        if (!isHovering && !isPointerDown) {
            carousel.classList.add('auto-scrolling');
            disableSnap();
            if (loopPoint) {
                autoScrollPos = wrapScroll(autoScrollPos + speed);
                lastTarget = autoScrollPos;
                carousel.scrollLeft = lastTarget;
            }
        }
        updateDebug();
        rafId = requestAnimationFrame(tick);
    };

    const startAuto = () => {
        carousel.classList.add('auto-scrolling');
        autoScrollPos = wrapScroll(carousel.scrollLeft);
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

    const startDrag = (clientX) => {
        isPointerDown = true;
        carousel.classList.remove('auto-scrolling');
        disableSnap();
        startX = clientX;
        startScroll = wrapScroll(carousel.scrollLeft);
        autoScrollPos = startScroll;
        updateDebug();
    };

    const moveDrag = (clientX) => {
        if (!isPointerDown) return;
        const walk = clientX - startX;
        autoScrollPos = wrapScroll(startScroll - walk);
        carousel.scrollLeft = autoScrollPos;
    };

    const stopPointer = () => {
        if (!isPointerDown) return;
        isPointerDown = false;
        normalizeScroll();
        enableSnap();
        carousel.classList.add('auto-scrolling');
        updateDebug();
    };

    carousel.addEventListener('pointerdown', (event) => {
        startDrag(event.clientX);
        if (!isIOS) {
            carousel.setPointerCapture(event.pointerId);
        }
    });

    carousel.addEventListener('pointermove', (event) => {
        moveDrag(event.clientX);
    });

    carousel.addEventListener('pointerup', stopPointer);
    carousel.addEventListener('pointerleave', stopPointer);
    carousel.addEventListener('pointercancel', stopPointer);

    carousel.addEventListener('touchstart', (event) => {
        if (!event.touches || event.touches.length === 0) return;
        startDrag(event.touches[0].clientX);
    }, { passive: true });

    carousel.addEventListener('touchmove', (event) => {
        if (!event.touches || event.touches.length === 0) return;
        moveDrag(event.touches[0].clientX);
        event.preventDefault();
    }, { passive: false });

    carousel.addEventListener('touchend', stopPointer);
    carousel.addEventListener('touchcancel', stopPointer);

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
