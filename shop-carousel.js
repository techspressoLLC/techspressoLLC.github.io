const carousel = document.getElementById('shop-carousel');
if (carousel) {
    let rafId = 0;
    const speed = 0.9; // px per frame
    let isHovering = false;
    let isPointerDown = false;
    let startX = 0;
    let startScroll = 0;

    const items = Array.from(carousel.children);
    const cloneCount = items.length;
    for (let i = 0; i < cloneCount; i += 1) {
        const clone = items[i].cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        carousel.appendChild(clone);
    }

    const getLoopPoint = () => carousel.scrollWidth / 2;

    const enableSnap = () => {
        carousel.style.scrollSnapType = 'x mandatory';
    };

    const disableSnap = () => {
        carousel.style.scrollSnapType = 'none';
    };

    const tick = () => {
        if (!isHovering && !isPointerDown) {
            disableSnap();
            const loopPoint = getLoopPoint();
            if (loopPoint) {
                carousel.scrollLeft += speed;
                if (carousel.scrollLeft >= loopPoint) {
                    carousel.scrollLeft -= loopPoint;
                }
            }
        }
        rafId = requestAnimationFrame(tick);
    };

    const startAuto = () => {
        if (!rafId) rafId = requestAnimationFrame(tick);
    };

    carousel.addEventListener('mouseenter', () => {
        isHovering = true;
        enableSnap();
    });
    carousel.addEventListener('mouseleave', () => {
        isHovering = false;
    });

    carousel.addEventListener('pointerdown', (event) => {
        isPointerDown = true;
        enableSnap();
        startX = event.clientX;
        startScroll = carousel.scrollLeft;
        carousel.setPointerCapture(event.pointerId);
    });

    carousel.addEventListener('pointermove', (event) => {
        if (!isPointerDown) return;
        const walk = event.clientX - startX;
        carousel.scrollLeft = startScroll - walk;
        const loopPoint = getLoopPoint();
        if (loopPoint) {
            if (carousel.scrollLeft < 0) {
                carousel.scrollLeft += loopPoint;
            } else if (carousel.scrollLeft >= loopPoint) {
                carousel.scrollLeft -= loopPoint;
            }
        }
    });

    const stopPointer = () => {
        isPointerDown = false;
    };

    carousel.addEventListener('pointerup', stopPointer);
    carousel.addEventListener('pointerleave', stopPointer);

    window.addEventListener('load', startAuto, { once: true });
    startAuto();
}
