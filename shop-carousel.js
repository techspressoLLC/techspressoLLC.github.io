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
        rafId = requestAnimationFrame(tick);
    };

    const startAuto = () => {
        if (!rafId) rafId = requestAnimationFrame(tick);
    };

    carousel.addEventListener('mouseenter', () => {
        isHovering = true;
        disableSnap();
    });
    carousel.addEventListener('mouseleave', () => {
        isHovering = false;
    });

    carousel.addEventListener('pointerdown', (event) => {
        isPointerDown = true;
        disableSnap();
        startX = event.clientX;
        startScroll = wrapScroll(carousel.scrollLeft);
        carousel.setPointerCapture(event.pointerId);
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
    };

    carousel.addEventListener('pointerup', stopPointer);
    carousel.addEventListener('pointerleave', stopPointer);

    carousel.addEventListener('scroll', () => {
        if (isHovering || isPointerDown) {
            scheduleNormalize();
        }
    });

    window.addEventListener('resize', () => {
        updateLoopPoint();
        normalizeScroll();
    });

    window.addEventListener('load', () => {
        updateLoopPoint();
        startAuto();
    }, { once: true });

    updateLoopPoint();
    startAuto();
}
