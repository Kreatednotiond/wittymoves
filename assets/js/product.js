// assets/js/product.js
(function () {
  const root = document.getElementById("productRoot");
  if (!root) return;

  const products =
    window.WITTY_PRODUCTS ||
    (window.WITTY && window.WITTY.products) ||
    window.products ||
    [];

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const product = products.find((p) => p.id === id);

  if (!product) {
    root.innerHTML = `
      <div style="padding:40px 0;">
        <h1>Product not found</h1>
        <p class="muted">This product link is missing or the ID doesn’t match.</p>
        <p><a class="btn ghost" href="shop.html">Back to shop</a></p>
      </div>
    `;
    return;
  }

  // Defaults
  const defaultColor = product.colors?.[0] || null;
  const defaultImg = defaultColor?.img || product.image || "";
  const defaultSize = product.sizes?.[0] || "";

  // Build gallery: use `gallery` if present, otherwise use all color images
  const gallery =
    Array.isArray(product.gallery) && product.gallery.length
      ? product.gallery
      : (product.colors || []).map((c) => c.img);

  root.innerHTML = `
    <div class="product-page">
      <div>
        <img id="mainImage" class="main-image" src="${defaultImg}" alt="${product.name}" />
        <div class="thumbs" id="thumbs"></div>
      </div>

      <div>
        <h1 style="margin-top:0;">${product.name}</h1>
        <div class="muted" style="margin:6px 0 14px;">$${Number(product.price).toFixed(2)} • ${product.badge || ""}</div>

        <p class="muted" style="line-height:1.6;">${product.description || ""}</p>

        <div class="field">
          <label>Color</label>
          <div class="swatches" id="swatches"></div>
        </div>

        <div class="field">
          <label for="sizeSelect">Size</label>
          <select id="sizeSelect"></select>
        </div>

        <button
          id="addToCartBtn"
          class="btn snipcart-add-item"
          data-item-id="${product.id}"
          data-item-name="${product.name}"
          data-item-price="${product.price}"
          data-item-url="product.html?id=${encodeURIComponent(product.id)}"
          data-item-image="${defaultImg}"
          data-item-description="${product.description || ""}"
        >
          Add to Cart
        </button>

        <div class="muted" style="margin-top:10px; font-size:12px;">
          Secure checkout powered by Snipcart + Stripe.
        </div>

        <div style="margin-top:18px;">
          <a class="text-link" href="shop.html#${product.id}">← Back to shop</a>
        </div>
      </div>
    </div>
  `;

  // Build thumbs
  const thumbs = document.getElementById("thumbs");
  const mainImage = document.getElementById("mainImage");
  if (thumbs && gallery.length) {
    thumbs.innerHTML = gallery
      .map(
        (src, idx) => `
          <button class="thumb ${idx === 0 ? "active" : ""}" type="button" data-src="${src}">
            <img src="${src}" alt="thumb ${idx + 1}" loading="lazy" />
          </button>
        `
      )
      .join("");

    thumbs.addEventListener("click", (e) => {
      const btn = e.target.closest(".thumb");
      if (!btn) return;
      const src = btn.getAttribute("data-src");
      if (!src) return;

      mainImage.src = src;

      thumbs.querySelectorAll(".thumb").forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");

      // update snipcart image too
      const addBtn = document.getElementById("addToCartBtn");
      if (addBtn) addBtn.setAttribute("data-item-image", src);
    });
  }

  // Build swatches (bubble circles)
  const swatches = document.getElementById("swatches");
  const addBtn = document.getElementById("addToCartBtn");

  if (swatches && Array.isArray(product.colors) && product.colors.length) {
    swatches.innerHTML = product.colors
      .map((c, idx) => {
        const active = idx === 0 ? "active" : "";
        return `<button class="swatch ${active}" type="button" aria-label="${c.label}" data-img="${c.img}" data-label="${c.value}"></button>`;
      })
      .join("");

    swatches.addEventListener("click", (e) => {
      const btn = e.target.closest(".swatch");
      if (!btn) return;

      const img = btn.getAttribute("data-img");
      const label = btn.getAttribute("data-label");

      if (img) {
        mainImage.src = img;
        if (addBtn) addBtn.setAttribute("data-item-image", img);
      }

      // Store selected color as a custom option in Snipcart
      if (addBtn && label) {
        addBtn.setAttribute("data-item-custom1-name", "Color");
        addBtn.setAttribute("data-item-custom1-options", product.colors.map(c => c.value).join("|"));
        addBtn.setAttribute("data-item-custom1-value", label);
      }

      swatches.querySelectorAll(".swatch").forEach((s) => s.classList.remove("active"));
      btn.classList.add("active");
    });

    // set default color option
    if (addBtn && defaultColor?.value) {
      addBtn.setAttribute("data-item-custom1-name", "Color");
      addBtn.setAttribute("data-item-custom1-options", product.colors.map(c => c.value).join("|"));
      addBtn.setAttribute("data-item-custom1-value", defaultColor.value);
    }
  }

  // Build sizes dropdown + push into Snipcart custom option
  const sizeSelect = document.getElementById("sizeSelect");
  if (sizeSelect && Array.isArray(product.sizes) && product.sizes.length) {
    sizeSelect.innerHTML = product.sizes
      .map((s) => `<option value="${s}">${s}</option>`)
      .join("");

    // set default size in Snipcart
    if (addBtn) {
      addBtn.setAttribute("data-item-custom2-name", "Size");
      addBtn.setAttribute("data-item-custom2-options", product.sizes.join("|"));
      addBtn.setAttribute("data-item-custom2-value", defaultSize);
    }

    sizeSelect.addEventListener("change", () => {
      if (!addBtn) return;
      addBtn.setAttribute("data-item-custom2-value", sizeSelect.value);
    });
  }
})();
