const coffeeBeans = [
    {
        id: "colombia-asmucafe-floreada-supremo",
        name: "Colombia ASMUCAFE Floreada Supremo",
        subtitle: "コクと甘みがバランス良く、ミルクチョコレートのようななめらかなコーヒー",
        country: "Colombia",
        farm: "ASMUCAFE",
        area: "Cauca, El Tambo",
        origin: "コロンビア / カウカ県 エル・タンボ",
        variety: "Castillo, Colombia",
        elevation: "1800-2000m",
        process: "Washed",
        roastLevel: "中深煎り",
        tastingNotes: ["ミルクチョコレート", "キャラメル", "なめらかな口当たり"],
        recommendedBrew: "ペーパードリップ / エスプレッソ",
        description: "ASMUCAFE（アスムカフェ）は、コロンビア・カウカ県エル・タンボ地域の女性コーヒー生産者によって2009年に設立された団体です。女性の経済的自立と社会的地位向上を目的に、環境に配慮した持続可能な栽培で高品質なコーヒーを生産しています。相互扶助の精神を大切にしながら地域社会にも貢献する姿勢が評価され、「フロリアーダ（花で彩られたようなコーヒー）」の名が付けられています。",
        roastProfile: [
            "投入温度: 200C",
            "ドライエンド: 4:30",
            "1ハゼ: 8:20",
            "煎り止め: 10:00"
        ],
        images: [
            "./pic/beans/col202602/col1.jpg",
            "./pic/beans/col202602/IMG_0944.jpg",
            "./pic/beans/col202602/IMG_0946.jpg"
        ]
    },
    {
        id: "ethiopia-gesha",
        name: "Ethiopia Gesha",
        subtitle: "華やかで紅茶のような質感のシングルオリジン",
        country: "Ethiopia",
        farm: "-",
        area: "Guji",
        origin: "Ethiopia, Guji",
        variety: "Gesha 1931",
        elevation: "1900-2200m",
        process: "Washed",
        roastLevel: "浅煎り",
        tastingNotes: ["ジャスミン", "シトラス", "ピーチティー"],
        recommendedBrew: "ペーパードリップ",
        description: "フローラルな香りと透明感のある酸を活かした、繊細で上品な味わい。余韻までクリーンな飲み口に仕上げています。",
        roastProfile: [
            "投入温度: 195C",
            "ドライエンド: 4:50",
            "1ハゼ: 8:45",
            "煎り止め: 9:40"
        ],
        images: []
    },
    {
        id: "kenya-aa",
        name: "Kenya AA",
        subtitle: "明るい果実感とジューシーな後味",
        country: "Kenya",
        farm: "-",
        area: "Nyeri",
        origin: "Kenya, Nyeri",
        variety: "SL28, SL34",
        elevation: "1700-2000m",
        process: "Washed",
        roastLevel: "中浅煎り",
        tastingNotes: ["カシス", "グレープフルーツ", "ブラウンシュガー"],
        recommendedBrew: "ペーパードリップ / AeroPress",
        description: "はっきりした果実感と立体的な酸が特徴。クリアな抽出で甘さの層を感じやすいプロファイルです。",
        roastProfile: [
            "投入温度: 198C",
            "ドライエンド: 4:40",
            "1ハゼ: 8:35",
            "煎り止め: 9:55"
        ],
        images: []
    }
];

let selectedCoffeeBeanId = coffeeBeans[0]?.id || "";
let galleryModal = null;

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
    galleryLabel.textContent = "豆の画像";
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
        img.className = "w-full h-32 md:h-36 object-cover group-hover:scale-105 transition";

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

    const metaGrid = document.createElement("div");
    metaGrid.className = "grid sm:grid-cols-2 gap-4 text-sm text-slate-700";

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
        const item = document.createElement("div");
        item.className = "rounded-2xl border border-slate-100 bg-white p-4";
        item.innerHTML = `
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">${label}</p>
            <p class="font-bold text-slate-800">${value || "-"}</p>
        `;
        metaGrid.appendChild(item);
    });
    detailContainer.appendChild(metaGrid);

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

    renderBeanGallery(bean, detailContainer);

    const roastWrap = document.createElement("div");
    roastWrap.className = "space-y-3";
    const roastLabel = document.createElement("p");
    roastLabel.className = "text-[10px] font-black uppercase tracking-[0.3em] text-amber-700";
    roastLabel.textContent = "焙煎プロファイル";
    roastWrap.appendChild(roastLabel);

    const roastList = document.createElement("ul");
    roastList.className = "rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-700 leading-loose list-disc list-inside";
    (bean.roastProfile || []).forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        roastList.appendChild(li);
    });
    roastWrap.appendChild(roastList);
    detailContainer.appendChild(roastWrap);
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

window.initCoffeeLineup = () => {
    if (!coffeeBeans.length) return;
    if (!selectedCoffeeBeanId) selectedCoffeeBeanId = coffeeBeans[0].id;
    ensureGalleryModal();
    renderCoffeeLineupList();
    renderCoffeeLineupDetail(selectedCoffeeBeanId);
};
