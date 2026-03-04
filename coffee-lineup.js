const COFFEE_LINEUP_JSON_PATH = "./coffee-lineup.json";

let coffeeLineupEnabled = true;
let coffeeBeans = [];
let defaultCoffeeBeanId = "";
let selectedCoffeeBeanId = "";
let galleryModal = null;

const clearCoffeeLineupRender = () => {
    const listContainer = document.getElementById("coffee-lineup-list");
    if (listContainer) listContainer.textContent = "";
    const detailContainer = document.getElementById("coffee-lineup-detail");
    if (detailContainer) detailContainer.textContent = "";
};

const applyCoffeeLineupVisibility = () => {
    document.querySelectorAll("[data-coffee-lineup-ui]").forEach((element) => {
        element.classList.toggle("hidden", !coffeeLineupEnabled);
    });
};

const loadCoffeeLineup = async () => {
    const response = await fetch(COFFEE_LINEUP_JSON_PATH, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load coffee-lineup.json");

    const data = await response.json();
    coffeeLineupEnabled = data?.enabled !== false;
    defaultCoffeeBeanId = typeof data?.defaultBeanId === "string" ? data.defaultBeanId : "";

    const items = Array.isArray(data?.items) ? data.items : [];
    coffeeBeans = items.filter((item) => item && item.id && item.active !== false);
    coffeeLineupEnabled = coffeeLineupEnabled && coffeeBeans.length > 0;

    if (!coffeeLineupEnabled || !coffeeBeans.length) {
        selectedCoffeeBeanId = "";
        return;
    }

    const hasSelected = coffeeBeans.some((bean) => bean.id === selectedCoffeeBeanId);
    if (!hasSelected) {
        const hasDefault = coffeeBeans.some((bean) => bean.id === defaultCoffeeBeanId);
        selectedCoffeeBeanId = hasDefault ? defaultCoffeeBeanId : coffeeBeans[0].id;
    }
};

const ensureGalleryModal = () => {
    if (galleryModal) return galleryModal;

    const modal = document.createElement("div");
    modal.id = "bean-image-modal";
    modal.className = "fixed inset-0 z-[120] hidden items-center justify-center bg-slate-900/80 p-4";
    modal.innerHTML = `
        <button type="button"
            class="absolute top-4 right-4 rounded-full bg-white/90 text-slate-900 text-xs font-black px-4 py-2 uppercase tracking-widest hover:bg-white transition"
            data-modal-close>
            Close
        </button>
        <img data-modal-image class="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl border border-white/20" alt="">
    `;

    modal.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.matches("[data-modal-close]") || target === modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (modal.classList.contains("hidden")) return;
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    });

    document.body.appendChild(modal);
    galleryModal = modal;
    return modal;
};

const openGalleryModal = (src, alt) => {
    const modal = ensureGalleryModal();
    const image = modal.querySelector("[data-modal-image]");
    if (!(image instanceof HTMLImageElement)) return;
    image.src = src;
    image.alt = alt || "Bean image";
    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

const renderBeanGallery = (bean, detailContainer) => {
    const images = Array.isArray(bean.images) ? bean.images.filter(Boolean) : [];
    if (!images.length) return;

    const galleryWrap = document.createElement("div");
    galleryWrap.className = "space-y-3";

    const galleryLabel = document.createElement("p");
    galleryLabel.className = "text-[10px] font-black uppercase tracking-[0.3em] text-amber-700";
    
    galleryWrap.appendChild(galleryLabel);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-2 md:grid-cols-3 gap-3";

    images.forEach((src, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition";

        const img = document.createElement("img");
        img.src = src;
        img.alt = `${bean.name} image ${index + 1}`;
        img.className = "w-full h-auto max-h-52 object-contain group-hover:scale-105 transition";

        button.addEventListener("click", () => {
            openGalleryModal(src, img.alt);
        });

        button.appendChild(img);
        grid.appendChild(button);
    });

    galleryWrap.appendChild(grid);
    detailContainer.appendChild(galleryWrap);
};

const renderCoffeeLineupDetail = (beanId) => {
    const detailContainer = document.getElementById("coffee-lineup-detail");
    if (!detailContainer) return;

    const bean = coffeeBeans.find((item) => item.id === beanId) || coffeeBeans[0];
    if (!bean) {
        detailContainer.textContent = "";
        return;
    }

    detailContainer.textContent = "";

    const headerWrap = document.createElement("div");
    headerWrap.className = "space-y-3";

    const name = document.createElement("h3");
    name.className = "text-2xl md:text-4xl font-black text-slate-900 tracking-tight";
    name.textContent = bean.name;

    const subtitle = document.createElement("p");
    subtitle.className = "text-slate-500 text-sm md:text-base";
    subtitle.textContent = bean.subtitle || "";

    headerWrap.appendChild(name);
    headerWrap.appendChild(subtitle);
    detailContainer.appendChild(headerWrap);

    const metaMobile = document.createElement("dl");
    metaMobile.className = "md:hidden rounded-2xl border border-slate-100 bg-white p-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm text-slate-700";

    const metaDesktop = document.createElement("div");
    metaDesktop.className = "hidden md:grid sm:grid-cols-2 gap-4 text-sm text-slate-700";

    const metaItems = [
        ["国", bean.country],
        ["農園", bean.farm],
        ["地域", bean.area],
        ["産地", bean.origin],
        ["品種", bean.variety],
        ["標高", bean.elevation],
        ["加工法", bean.process],
        ["焙煎度", bean.roastLevel],
        ["おすすめ抽出", bean.recommendedBrew]
    ];

    metaItems.forEach(([label, value]) => {
        const term = document.createElement("dt");
        term.className = "text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 self-center";
        term.textContent = label;

        const desc = document.createElement("dd");
        desc.className = "font-bold text-slate-800 break-words";
        desc.textContent = value || "-";

        metaMobile.appendChild(term);
        metaMobile.appendChild(desc);

        const item = document.createElement("div");
        item.className = "rounded-2xl border border-slate-100 bg-white p-4";
        item.innerHTML = `
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">${label}</p>
            <p class="font-bold text-slate-800">${value || "-"}</p>
        `;
        metaDesktop.appendChild(item);
    });
    detailContainer.appendChild(metaMobile);
    detailContainer.appendChild(metaDesktop);

    const notesWrap = document.createElement("div");
    notesWrap.className = "space-y-3";
    const notesLabel = document.createElement("p");
    notesLabel.className = "text-[10px] font-black uppercase tracking-[0.3em] text-amber-700";
    notesLabel.textContent = "テイスティングノート";
    notesWrap.appendChild(notesLabel);

    const notesList = document.createElement("div");
    notesList.className = "flex flex-wrap gap-2";
    (bean.tastingNotes || []).forEach((note) => {
        const chip = document.createElement("span");
        chip.className = "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-800";
        chip.textContent = note;
        notesList.appendChild(chip);
    });
    notesWrap.appendChild(notesList);
    detailContainer.appendChild(notesWrap);

    const description = document.createElement("p");
    description.className = "text-slate-600 leading-loose";
    description.textContent = bean.description || "";
    detailContainer.appendChild(description);

    if (bean.purchaseUrl) {
        const purchaseLink = document.createElement("a");
        purchaseLink.href = bean.purchaseUrl;
        purchaseLink.target = "_blank";
        purchaseLink.rel = "noopener noreferrer";
        purchaseLink.className = "inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-amber-700 transition shadow-lg";
        purchaseLink.textContent = bean.purchaseLabel || "購入はこちらから";
        detailContainer.appendChild(purchaseLink);
    }

    renderBeanGallery(bean, detailContainer);

};

const renderCoffeeLineupList = () => {
    const listContainer = document.getElementById("coffee-lineup-list");
    if (!listContainer) return;

    listContainer.textContent = "";
    coffeeBeans.forEach((bean) => {
        const button = document.createElement("button");
        const isActive = bean.id === selectedCoffeeBeanId;
        button.type = "button";
        button.className = `w-full text-left rounded-2xl border px-4 py-3 transition ${isActive ? "border-amber-300 bg-amber-50 text-slate-900 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`;
        button.innerHTML = `
            <p class="text-[10px] font-black uppercase tracking-[0.3em] ${isActive ? "text-amber-700" : "text-slate-400"}">豆</p>
            <p class="mt-1 font-bold">${bean.name}</p>
            <p class="text-xs mt-1 opacity-80">${bean.roastLevel || ""}</p>
        `;
        button.addEventListener("click", () => {
            selectedCoffeeBeanId = bean.id;
            renderCoffeeLineupList();
            renderCoffeeLineupDetail(selectedCoffeeBeanId);
        });
        listContainer.appendChild(button);
    });
};

window.selectCoffeeBeanById = (beanId) => {
    if (!coffeeLineupEnabled || !coffeeBeans.length) return;
    const found = coffeeBeans.find((bean) => bean.id === beanId);
    selectedCoffeeBeanId = found ? found.id : coffeeBeans[0].id;
    renderCoffeeLineupList();
    renderCoffeeLineupDetail(selectedCoffeeBeanId);
};

window.isCoffeeLineupEnabled = () => coffeeLineupEnabled;

window.initCoffeeLineup = async () => {
    try {
        await loadCoffeeLineup();
    } catch (error) {
        coffeeLineupEnabled = false;
        coffeeBeans = [];
        selectedCoffeeBeanId = "";
    }

    applyCoffeeLineupVisibility();
    if (!coffeeLineupEnabled || !coffeeBeans.length) {
        clearCoffeeLineupRender();
        return;
    }

    ensureGalleryModal();
    window.selectCoffeeBeanById(selectedCoffeeBeanId || defaultCoffeeBeanId);
};
