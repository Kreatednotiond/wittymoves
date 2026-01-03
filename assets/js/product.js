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

  // --------- Main image helper ----------
  const setMain = (src) => {
    if (!mainImage) return;
    mainImage.src = src || "";
    mainImage.alt = product.name;
  };

  // --------- Selected defaults ----------
  let selectedSize = (product.sizes && product.sizes[0]) ? product.sizes[0] : "";
  let selectedColor = (product.colors && product.colors[0]) ? product.colors[0] : null;

  // Default image:
  // - If color exists -> color image
  // - Else if gallery exists -> gallery[0]
  // - Else empty
  const defaultImg =
    (selectedColor && selectedColor.img) ||
    (product.gallery && product.gallery[0]) ||
    (product.colors && product.colors[0] && product.colors[0].img) ||
    "";

  setMain(defaultImg);

  // --------- Thumbnails (IMPORTANT CHANGE)
  // Show thumbs ONLY when product.gallery exists (hat/jackets)
  // Do NOT show all color images as thumbnails.
  if (thumbs) {
    thumbs.innerHTML = "";

    const gallery = (product.gallery && product.gallery.length) ? product.gallery : [];

    if (gallery.length > 1) {
      gallery.forEach((src, idx) => {
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
    } else {
      // Hide thumbs area if no gallery or only 1 image
      thumbs.style.display = "none";
    }
  }

  // --------- Size chips ----------
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

  // --------- Swatch color (FIX: tees use garment color before "(" ) ----------
  const getBaseColorName = (labelOrValue) => {
    const raw = String(labelOrValue || "");
    return raw.split("(")[0].trim().toLowerCase();
  };

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

  // --------- Color swatches ----------
  const renderColors = () => {
    if (!colorSwatches) return;
    colorSwatches.innerHTML = "";

    (product.colors || []).forEach((c) => {
      const sw = document.createElement("button");
      sw.type = "button";
      sw.className =
        "swatch" + (selectedColor && c.value === selectedColor.value ? " active" : "");

      sw.setAttribute("aria-label", c.label || c.value || "");
      sw.title = c.label || c.value || "";

      const { hex, isWhite } = pickSwatch(c.value || c.label);
      sw.style.background = hex;
      if (isWhite) sw.style.borderColor = "#bbb";

      sw.addEventListener("click", () => {
        selectedColor = c;

        // ✅ ONLY swap the main image (no showing all color images)
        if (c.img) setMain(c.img);

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
