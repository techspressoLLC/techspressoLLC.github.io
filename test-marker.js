(() => {
    const MARKER_PATH = './test-marker.txt';

    const createMarker = (text) => {
        const marker = document.createElement('div');
        marker.id = 'test-marker';
        marker.className = 'fixed right-3 top-3 z-[9999] px-4 py-2 rounded-full bg-amber-300 text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-lg border border-amber-400';
        marker.textContent = text;
        return marker;
    };

    const renderMarker = (text) => {
        const trimmed = String(text || '').trim();
        if (!trimmed) return;
        if (document.getElementById('test-marker')) return;
        document.body.appendChild(createMarker(trimmed));
    };

    document.addEventListener('DOMContentLoaded', () => {
        fetch(MARKER_PATH, { cache: 'no-store' })
            .then((response) => {
                if (!response.ok) return null;
                return response.text();
            })
            .then((text) => {
                if (text === null) return;
                renderMarker(text);
            })
            .catch(() => {});
    });
})();
