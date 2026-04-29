const COFFEE_LINEUP_JSON_PATH = "./coffee-lineup.json";

let coffeeLineupEnabled = true;
let coffeeBeans = [];
let defaultCoffeeBeanId = "";
let selectedCoffeeBeanId = "";
let galleryModal = null;

const DEFAULT_BEAN_THEME = {
    accent: "#f3e8b0",
    accentStrong: "#d9b24c",
    accentSoft: "#fff8e6",
    accentText: "#8c6a12",
    accentTextStrong: "#4d3b08"
};

const BEAN_THEMES = {
    "honduras-la-cascada-catuai": {
        accent: "#b8e2f6",
        accentStrong: "#8fcceb",
        accentSoft: "#eef9ff",
        accentText: "#5c7182",
        accentTextStrong: "#435563"
    },
    "burundi-yandaro-cws-washed": {
        accent: "#f3c1d0",
        accentStrong: "#e59ab0",
        accentSoft: "#fff2f6",
        accentText: "#8b5d6a",
        accentTextStrong: "#6d4852"
    }
};

const getBeanTheme = (bean) => ({
    ...DEFAULT_BEAN_THEME,
    ...(bean?.id ? BEAN_THEMES[bean.id] : null),
    ...(bean?.theme || {})
});

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
    coffeeBeans = items.filter((item) => item && item.id);
    coffeeLineupEnabled = coffeeLineupEnabled && coffeeBeans.length > 0;

    if (!coffeeLineupEnabled || !coffeeBeans.length) {
        selectedCoffeeBeanId = "";
        return;
    }

    const hasSelected = coffeeBeans.some((bean) => bean.id === selectedCoffeeBeanId);
    if (!hasSelected) {
        const activeBeans = coffeeBeans.filter((bean) => bean.active !== false);
        const fallbackBean = activeBeans[0] || coffeeBeans[0];
        const hasDefault = coffeeBeans.some((bean) => bean.id === defaultCoffeeBeanId);
        selectedCoffeeBeanId = hasDefault ? defaultCoffeeBeanId : fallbackBean.id;
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
    const theme = getBeanTheme(bean);

    const galleryWrap = document.createElement("div");
    galleryWrap.className = "space-y-3";

    const galleryLabel = document.createElement("p");
    galleryLabel.className = "text-[10px] font-black uppercase tracking-[0.3em]";
    galleryLabel.textContent = "Gallery";
    galleryLabel.style.color = theme.accentText;

    galleryWrap.appendChild(galleryLabel);

    const grid = document.createElement("div");
    grid.className = "columns-1 sm:columns-2 lg:columns-3";
    grid.style.columnGap = "0.75rem";

    images.forEach((src, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "group mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition";
        button.style.borderColor = theme.accent;

        const img = document.createElement("img");
        img.src = src;
        img.alt = `${bean.name} image ${index + 1}`;
        img.className = "block w-full h-auto object-cover group-hover:scale-[1.02] transition";

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
    const theme = getBeanTheme(bean);
    detailContainer.style.borderColor = theme.accent;
    detailContainer.style.backgroundImage = `linear-gradient(to bottom right, #ffffff, ${theme.accentSoft})`;

    const headerWrap = document.createElement("div");
    headerWrap.className = "space-y-3";

    const statusBadge = document.createElement("span");
    statusBadge.className = "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em]";
    if (bean.active === false) {
        statusBadge.textContent = "過去の豆はこちら";
        statusBadge.style.backgroundColor = "#e2e8f0";
        statusBadge.style.color = "#475569";
    } else {
        statusBadge.textContent = "お取り扱い中";
        statusBadge.style.backgroundColor = theme.accentSoft;
        statusBadge.style.color = theme.accentTextStrong;
    }
    headerWrap.appendChild(statusBadge);

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
    metaMobile.style.borderColor = theme.accent;

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
        term.style.color = theme.accentText;
        term.textContent = label;

        const desc = document.createElement("dd");
        desc.className = "font-bold text-slate-800 break-words";
        desc.textContent = value || "-";

        metaMobile.appendChild(term);
        metaMobile.appendChild(desc);

        const item = document.createElement("div");
        item.className = "rounded-2xl border border-slate-100 bg-white p-4";
        item.style.borderColor = theme.accent;
        item.innerHTML = `
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">${label}</p>
            <p class="font-bold text-slate-800">${value || "-"}</p>
        `;
        const itemLabel = item.querySelector("p");
        if (itemLabel instanceof HTMLElement) {
            itemLabel.style.color = theme.accentText;
        }
        metaDesktop.appendChild(item);
    });
    detailContainer.appendChild(metaMobile);
    detailContainer.appendChild(metaDesktop);

    const notesWrap = document.createElement("div");
    notesWrap.className = "space-y-3";
    const notesLabel = document.createElement("p");
    notesLabel.className = "text-[10px] font-black uppercase tracking-[0.3em] text-amber-700";
    notesLabel.style.color = theme.accentText;
    notesLabel.textContent = "テイスティングノート";
    notesWrap.appendChild(notesLabel);

    const notesList = document.createElement("div");
    notesList.className = "flex flex-wrap gap-2";
    (bean.tastingNotes || []).forEach((note) => {
        const chip = document.createElement("span");
        chip.className = "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border";
        chip.style.backgroundColor = theme.accentSoft;
        chip.style.borderColor = theme.accent;
        chip.style.color = theme.accentTextStrong;
        chip.textContent = note;
        notesList.appendChild(chip);
    });
    notesWrap.appendChild(notesList);
    detailContainer.appendChild(notesWrap);

    const description = document.createElement("p");
    description.className = "text-slate-600 leading-loose";
    description.textContent = bean.description || "";
    detailContainer.appendChild(description);

    const actionWrap = document.createElement("div");
    actionWrap.className = "flex flex-wrap gap-3";

    if (bean.purchaseUrl) {
        const purchaseLink = document.createElement("a");
        purchaseLink.href = bean.purchaseUrl;
        purchaseLink.target = "_blank";
        purchaseLink.rel = "noopener noreferrer";
        purchaseLink.className = "inline-flex items-center px-6 py-3 text-white rounded-full font-bold text-[10px] uppercase tracking-widest transition shadow-lg";
        purchaseLink.style.backgroundColor = theme.accentStrong;
        purchaseLink.textContent = bean.purchaseLabel || "購入はこちらから";
        actionWrap.appendChild(purchaseLink);
    }

    if (bean.secondaryUrl) {
        const secondaryLink = document.createElement("a");
        secondaryLink.href = bean.secondaryUrl;
        secondaryLink.target = "_blank";
        secondaryLink.rel = "noopener noreferrer";
        secondaryLink.className = "inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 transition shadow-lg";
        secondaryLink.textContent = bean.secondaryLabel || "詳細はこちら";
        actionWrap.appendChild(secondaryLink);
    }

    if (actionWrap.childNodes.length) {
        detailContainer.appendChild(actionWrap);
    }

    if (bean.purchaseNote) {
        const purchaseNote = document.createElement("p");
        purchaseNote.className = "text-sm font-bold text-slate-600";
        purchaseNote.textContent = bean.purchaseNote;
        detailContainer.appendChild(purchaseNote);
    }

    renderBeanGallery(bean, detailContainer);

};

const renderCoffeeLineupList = () => {
    const listContainer = document.getElementById("coffee-lineup-list");
    if (!listContainer) return;

    listContainer.textContent = "";
    const activeBeans = coffeeBeans.filter((bean) => bean.active !== false);
    const archivedBeans = coffeeBeans.filter((bean) => bean.active === false);

    const renderSection = (label, beans, isArchive = false) => {
        if (!beans.length) return;

        const section = document.createElement("div");
        section.className = "space-y-3";
        if (listContainer.childNodes.length) {
            section.classList.add("pt-4");
        }

        const heading = document.createElement("p");
        heading.className = "text-[10px] font-black uppercase tracking-[0.3em]";
        heading.textContent = label;
        heading.style.color = isArchive ? "#94a3b8" : "#8c6a12";
        section.appendChild(heading);

        beans.forEach((bean) => {
        const button = document.createElement("button");
        const isActive = bean.id === selectedCoffeeBeanId;
        const theme = getBeanTheme(bean);
        button.type = "button";
        button.className = `w-full text-left rounded-2xl border px-4 py-3 transition ${isActive ? "border-amber-300 bg-amber-50 text-slate-900 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`;
        if (isActive) {
            button.style.borderColor = bean.active === false ? "#94a3b8" : theme.accentStrong;
            button.style.backgroundColor = bean.active === false ? "#f8fafc" : theme.accentSoft;
        } else if (bean.active === false) {
            button.style.borderColor = "#cbd5e1";
            button.style.backgroundColor = "#f8fafc";
            button.style.color = "#64748b";
            button.style.opacity = "0.9";
        }
        button.innerHTML = `
            <p class="text-[10px] font-black uppercase tracking-[0.3em] ${isActive ? "text-amber-700" : "text-slate-400"}">豆</p>
            <p class="mt-1 font-bold">${bean.name}</p>
            <div class="mt-1 flex items-center gap-2 flex-wrap">
                <p class="text-xs opacity-80">${bean.roastLevel || ""}</p>
                <span class="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] ${bean.active === false ? "bg-slate-200 text-slate-600" : ""}">${bean.active === false ? "Past" : "Now"}</span>
            </div>
        `;
        const buttonLabel = button.querySelector("p");
        if (buttonLabel instanceof HTMLElement && isActive) {
            buttonLabel.style.color = bean.active === false ? "#64748b" : theme.accentText;
        }
        const statusChip = button.querySelector("span");
        if (statusChip instanceof HTMLElement && bean.active !== false) {
            statusChip.style.backgroundColor = theme.accentSoft;
            statusChip.style.color = theme.accentTextStrong;
        }
        button.addEventListener("click", () => {
            selectedCoffeeBeanId = bean.id;
            renderCoffeeLineupList();
            renderCoffeeLineupDetail(selectedCoffeeBeanId);
        });
        section.appendChild(button);
        });

        listContainer.appendChild(section);
    };

    renderSection("お取り扱い中", activeBeans);
    renderSection("過去の豆はこちら", archivedBeans, true);
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
