// assets/js/product.js
(function () {
  // If a shop grid ever exists on this page, kill it (prevents “all products” view)
  const accidentalGrid = document.getElementById("shopGrid");
  if (accidentalGrid) {
    accidentalGrid.innerHTML = "";
    accidentalGrid.style.display = "none";
  }

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

  // --------- Main image ----------
  const setMain = (src) => {
    if (!mainImage) return;
    mainImage.src = src || "";
    mainImage.alt = product.name;
  };

  let selectedSize = (product.sizes && product.sizes[0]) ? product.sizes[0] : "";
  let selectedColor = (product.colors && product.colors[0]) ? product.colors[0] : null;

  // Default image = selected color image (or gallery[0] for jacket/hat)
  const defaultImg =
    (selectedColor && selectedColor.img) ||
    (product.gallery && product.gallery[0]) ||
    (product.colors && product.colors[0] && product.colors[0].img) ||
    "";

  setMain(defaultImg);

  // --------- THUMBS ----------
  // Show ONLY if gallery exists (hat/jackets). Do NOT show all colors as thumbs.
  if (thumbs) {
    thumbs.innerHTML = "";
    const gallery = (product.gallery && product.gallery.length) ? product.gallery : [];

    if (gallery.length > 1) {
      thumbs.style.display = ""; // show

      const activeSrc = defaultImg && gallery.includes(defaultImg) ? defaultImg : gallery[0];

      gallery.forEach((src, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "thumb" + (src === activeSrc ? " active" : "");
        btn.innerHTML = `<img src="${src}" alt="${product.name} thumbnail ${idx + 1}" loading="lazy">`;

        btn.addEventListener("click", () => {
          setMain(src);
          [...thumbs.querySelectorAll(".thumb")].forEach((t) => t.classList.remove("active"));
          btn.classList.add("active");
        });

        thumbs.appendChild(btn);
      });

      // If defaultImg was not in gallery, force main image to gallery[0] so it matches thumbs
      if (!gallery.includes(defaultImg)) {
        setMain(gallery[0]);
      }
    } else {
      thumbs.style.display = "none"; // hide completely for tees/hoodies/etc
    }
  }

  // --------- SIZE CHIPS ----------
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

  // --------- COLOR SWATCH COLOR PICKER ----------
  const baseColor = (txt) => String(txt || "").split("(")[0].trim().toLowerCase();

  const pickColor = (txt) => {
    const v = baseColor(txt);
    const list = [
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
    for (const [k, c] of list) if (v.includes(k)) return { hex: c, white: v.includes("white") };
    return { hex: "#eaeaea", white: false };
  };

  // --------- COLOR SWATCHES ----------
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

      const { hex, white } = pickColor(c.value || c.label);
      sw.style.background = hex;
      if (white) sw.style.borderColor = "#bbb";

      sw.addEventListener("click", () => {
        selectedColor = c;
        if (c.img) setMain(c.img);
        renderColors();
        syncSnipcart();
      });

      colorSwatches.appendChild(sw);
    });
  };
  renderColors();

  // --------- SNIPCART ----------
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

    // ✅ RELATIVE URL (no products.html)
    addBtn.setAttribute("data-item-url", "https://www.wittymoves.com/validation.html");

    addBtn.setAttribute("data-item-image", imgForCart);
    addBtn.setAttribute("data-item-description", product.description || "");

    // ✅ grams
    addBtn.setAttribute("data-item-weight", String(product.weight || 0));

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
