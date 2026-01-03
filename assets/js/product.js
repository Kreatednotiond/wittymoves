// assets/js/product.js
(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const wrap = document.getElementById("productWrap");
  const notFound = document.getElementById("notFound");

  const nameEl = document.getElementById("pName");
  const priceEl = document.getElementById("pPrice");
  const descEl = document.getElementById("pDesc");

  const mainImage = document.getElementById("mainImage");
  const thumbs = document.getElementById("thumbs");

  const sizeChips = document.getElementById("sizeChips");
  const colorSwatches = document.getElementById("colorSwatches");

  const addBtn = document.getElementById("addBtn");

  const items = window.WITTY_PRODUCTS || [];
  const product = items.find((p) => p.id === id);

  if (!id || !product) {
    if (wrap) wrap.style.display = "none";
    if (notFound) notFound.style.display = "block";
    return;
  }

  const money = (n) => {
    const num = Number(n);
    return Number.isFinite(num) ? num.toFixed(2) : "0.00";
  };

  // --------- Basic info ----------
  document.title = `${product.name} | Witty Moves`;
  if (nameEl) nameEl.textContent = product.name;
  if (priceEl) priceEl.textContent = `$${money(product.price)}`;
  if (descEl) descEl.textContent = product.description || "";

  // --------- Images (FIXED: build from ALL colors + gallery) ----------
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

  const colorImgs = (product.colors || []).map((c) => c.img);
  const galleryImgs = product.gallery || [];
  const images = uniq([...colorImgs, ...galleryImgs]);

  const setMain = (src) => {
    if (!mainImage) return;
    mainImage.src = src || "";
    mainImage.alt = product.name;
  };

  // default main image
  setMain(images[0] || "");

  // --------- Thumbnails ----------
  if (thumbs) {
    thumbs.innerHTML = "";
    if (images.length > 1) {
      images.forEach((src, idx) => {
        const btn = document.createElement("button");
        btn.className = "thumb" + (idx === 0 ? " active" : "");
        btn.type = "button";
        btn.innerHTML = `<img src="${src}" alt="${product.name} thumbnail ${idx + 1}" loading="lazy">`;
        btn.addEventListener("click", () => {
          setMain(src);
          [...thumbs.querySelectorAll(".thumb")].forEach((t) => t.classList.remove("active"));
          btn.classList.add("active");
        });
        thumbs.appendChild(btn);
      });
    }
  }

  // --------- Size chips (bubble buttons) ----------
  let selectedSize = (product.sizes && product.sizes[0]) ? product.sizes[0] : "";

  const renderSizes = () => {
    if (!sizeChips) return;
    sizeChips.innerHTML = "";

    (product.sizes || []).forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (s === selectedSize ? " active" : "");
      b.textContent = s;
      b.addEventListener("click", () => {
        selectedSize = s;
        renderSizes();
        syncSnipcart();
      });
      sizeChips.appendChild(b);
    });
  };
  renderSizes();

  // --------- Color swatches ----------
  let selectedColor = (product.colors && product.colors[0]) ? product.colors[0] : null;

  // ✅ FIX: use ONLY garment color (before "(") so tees don't pick wording color
  const getBaseColorName = (labelOrValue) => {
    const raw = String(labelOrValue || "");
    return raw.split("(")[0].trim().toLowerCase(); // "Red (White wording)" -> "red"
  };

  // color map
  const map = [
    ["cloudy blue", "#7aa6c2"],
    ["military olive", "#4b5d3b"],
    ["ocean navy", "#0b2742"],
    ["seafoam", "#7fc7b9"],
    ["salmon", "#e38d86"],
    ["parchment", "#e7dfcf"],
    ["mineral", "#8a8f98"],
    ["forest", "#0f3b2e"],
    ["navy", "#0f1f3a"],
    ["slate", "#5b6770"],
    ["grey", "#8a8f98"],
    ["gray", "#8a8f98"],
    ["black", "#111"],
    ["white", "#fff"],
    ["red", "#b3122d"],
    ["pine", "#123b2b"],
  ];

  const pickSwatch = (labelOrValue) => {
    const base = getBaseColorName(labelOrValue);
    let hex = "#eaeaea";
    for (const [k, c] of map) {
      if (base.includes(k)) {
        hex = c;
        break;
      }
    }
    return { hex, isWhite: base.includes("white") };
  };

  const renderColors = () => {
    if (!colorSwatches) return;
    colorSwatches.innerHTML = "";

    (product.colors || []).forEach((c) => {
      const sw = document.createElement("button");
      sw.type = "button";
      sw.className =
        "swatch" + (selectedColor && c.value === selectedColor.value ? " active" : "");

      // set label for accessibility + optional CSS selectors
      sw.setAttribute("aria-label", c.label || c.value || "");
      sw.title = c.label || c.value || "";

      // ✅ set swatch color using base garment color only
      const { hex, isWhite } = pickSwatch(c.value || c.label);
      sw.style.background = hex;
      if (isWhite) sw.style.borderColor = "#bbb";

      sw.addEventListener("click", () => {
        selectedColor = c;

        // switch main image to selected color image
        if (c.img) setMain(c.img);

        // highlight matching thumbnail if present
        if (thumbs && c.img) {
          const tButtons = [...thumbs.querySelectorAll(".thumb")];
          tButtons.forEach((t) => t.classList.remove("active"));
          const match = tButtons.find((t) => {
            const img = t.querySelector("img");
            return img && img.getAttribute("src") === c.img;
          });
          if (match) match.classList.add("active");
        }

        renderColors();
        syncSnipcart();
      });

      colorSwatches.appendChild(sw);
    });
  };
  renderColors();

  // --------- Snipcart config ----------
  function syncSnipcart() {
    if (!addBtn) return;

    const imgForCart =
      (selectedColor && selectedColor.img) ||
      (product.colors && product.colors[0] && product.colors[0].img) ||
      (product.gallery && product.gallery[0]) ||
      images[0] ||
      "";

    addBtn.setAttribute("data-item-id", product.id);
    addBtn.setAttribute("data-item-name", product.name);
    addBtn.setAttribute("data-item-price", String(product.price));
    addBtn.setAttribute("data-item-url", "product.html?id=" + encodeURIComponent(product.id));
    addBtn.setAttribute("data-item-image", imgForCart);
    addBtn.setAttribute("data-item-description", product.description || "");

    addBtn.setAttribute("data-item-custom1-name", "Size");
    addBtn.setAttribute("data-item-custom1-options", (product.sizes || []).join("|"));
    addBtn.setAttribute("data-item-custom1-value", selectedSize || "");

    addBtn.setAttribute("data-item-custom2-name", "Color");
    addBtn.setAttribute(
      "data-item-custom2-options",
      (product.colors || []).map((c) => c.value).join("|")
    );
    addBtn.setAttribute(
      "data-item-custom2-value",
      selectedColor && selectedColor.value ? selectedColor.value : ""
    );
  }

  syncSnipcart();
})();
