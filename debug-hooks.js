(() => {
    if (!window.__debugOverlayLog) return;

    const log = window.__debugOverlayLog;

    const originalScrollTo = window.scrollTo.bind(window);
    window.scrollTo = (...args) => {
        log(`scrollTo called: ${args.map(a => JSON.stringify(a)).join(', ')}`);
        return originalScrollTo(...args);
    };

    const originalScrollBy = window.scrollBy.bind(window);
    window.scrollBy = (...args) => {
        log(`scrollBy called: ${args.map(a => JSON.stringify(a)).join(', ')}`);
        return originalScrollBy(...args);
    };

    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(...args) {
        log(`scrollIntoView: ${this.tagName?.toLowerCase() || 'element'}#${this.id || ''}.${this.className || ''}`);
        return originalScrollIntoView.apply(this, args);
    };

    const originalPushState = history.pushState.bind(history);
    history.pushState = (...args) => {
        log(`pushState: ${String(args[2] || '')}`);
        return originalPushState(...args);
    };

    const originalReplaceState = history.replaceState.bind(history);
    history.replaceState = (...args) => {
        log(`replaceState: ${String(args[2] || '')}`);
        return originalReplaceState(...args);
    };
})();
