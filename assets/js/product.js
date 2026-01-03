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
  const product = items.find(p => p.id === id);

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
  nameEl.textContent = product.name;
  priceEl.textContent = `$${money(product.price)}`;
  descEl.textContent = product.description || "";

  // --------- Images ----------
  const images = [];
  if (product.gallery && product.gallery.length) images.push(...product.gallery);
  else if (product.colors && product.colors.length) images.push(product.colors[0].img);

  const setMain = (src) => {
    mainImage.src = src;
    mainImage.alt = product.name;
  };

  setMain(images[0] || "");

  thumbs.innerHTML = "";
  if (images.length > 1) {
    images.forEach((src, idx) => {
      const btn = document.createElement("button");
      btn.className = "thumb" + (idx === 0 ? " active" : "");
      btn.type = "button";
      btn.innerHTML = `<img src="${src}" alt="${product.name} thumbnail ${idx + 1}">`;
      btn.addEventListener("click", () => {
        setMain(src);
        [...thumbs.querySelectorAll(".thumb")].forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
      });
      thumbs.appendChild(btn);
    });
  }

  // --------- Size chips (bubble buttons) ----------
  let selectedSize = (product.sizes && product.sizes[0]) ? product.sizes[0] : "";

  const renderSizes = () => {
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

  const renderColors = () => {
    colorSwatches.innerHTML = "";
    (product.colors || []).forEach((c) => {
      const sw = document.createElement("button");
      sw.type = "button";
      sw.className = "swatch" + (selectedColor && c.value === selectedColor.value ? " active" : "");
      // auto-color swatch based on the color name
      const v = (c.value || c.label || "").toLowerCase();
      const map = {
        "black": "#111",
        "red": "#b3122d",
        "white": "#fff",
        "navy": "#0f1f3a",
        "forest": "#0f3b2e",
        "grey": "#8a8f98",
        "gray": "#8a8f98",
        "slate": "#5b6770",
        "cloudy blue": "#7aa6c2",
        "military olive": "#4b5d3b",
        "ocean navy": "#0b2742",
        "salmon": "#e38d86",
        "seafoam": "#7fc7b9",
        "mineral": "#8a8f98",
        "parchment": "#e7dfcf",
        "pine": "#123b2b",
      };
      
      let swatchColor = "#eaeaea";
      Object.keys(map).forEach((k) => {
        if (v.includes(k)) swatchColor = map[k];
      });
      
      sw.style.background = swatchColor;
      if (v.includes("white")) sw.style.borderColor = "#bbb";

      sw.setAttribute("aria-label", c.label || c.value);
      sw.title = c.label || c.value;

      sw.addEventListener("click", () => {
        selectedColor = c;
        // switch main image to selected color image
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
    const imgForCart =
      (selectedColor && selectedColor.img) ||
      (product.colors && product.colors[0] && product.colors[0].img) ||
      (product.gallery && product.gallery[0]) ||
      "";

    // Configure Snipcart button attributes
    addBtn.setAttribute("data-item-id", product.id);
    addBtn.setAttribute("data-item-name", product.name);
    addBtn.setAttribute("data-item-price", String(product.price));
    addBtn.setAttribute("data-item-url", "product.html?id=" + encodeURIComponent(product.id));
    addBtn.setAttribute("data-item-image", imgForCart);
    addBtn.setAttribute("data-item-description", product.description || "");

    // Add custom fields for size + color
    addBtn.setAttribute("data-item-custom1-name", "Size");
    addBtn.setAttribute("data-item-custom1-options", (product.sizes || []).join("|"));
    addBtn.setAttribute("data-item-custom1-value", selectedSize || "");

    addBtn.setAttribute("data-item-custom2-name", "Color");
    addBtn.setAttribute("data-item-custom2-options", (product.colors || []).map(c => c.value).join("|"));
    addBtn.setAttribute("data-item-custom2-value", (selectedColor && selectedColor.value) ? selectedColor.value : "");
  }

  syncSnipcart();
})();
