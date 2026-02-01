(() => {
    const enqueue = (message) => {
        if (window.__debugOverlayLog) {
            window.__debugOverlayLog(message);
            return;
        }
        window.__debugOverlayLogQueue = window.__debugOverlayLogQueue || [];
        window.__debugOverlayLogQueue.push(message);
    };

    enqueue('debug-hooks loaded');

    const originalScrollTo = window.scrollTo.bind(window);
    window.scrollTo = (...args) => {
        enqueue(`scrollTo called: ${args.map(a => JSON.stringify(a)).join(', ')}`);
        return originalScrollTo(...args);
    };

    const originalScrollBy = window.scrollBy.bind(window);
    window.scrollBy = (...args) => {
        enqueue(`scrollBy called: ${args.map(a => JSON.stringify(a)).join(', ')}`);
        return originalScrollBy(...args);
    };

    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(...args) {
        enqueue(`scrollIntoView: ${this.tagName?.toLowerCase() || 'element'}#${this.id || ''}.${this.className || ''}`);
        return originalScrollIntoView.apply(this, args);
    };

    const originalPushState = history.pushState.bind(history);
    history.pushState = (...args) => {
        enqueue(`pushState: ${String(args[2] || '')}`);
        return originalPushState(...args);
    };

    const originalReplaceState = history.replaceState.bind(history);
    history.replaceState = (...args) => {
        enqueue(`replaceState: ${String(args[2] || '')}`);
        return originalReplaceState(...args);
    };
})();
