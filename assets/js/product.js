// assets/js/product.js

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function money(n) {
  return `$${Number(n).toFixed(0)}`;
}

function absoluteUrl(path) {
  // Makes Snipcart happy (it prefers absolute URLs)
  // Works on GitHub Pages + locally (when served)
  const u = new URL(path, window.location.href);
  return u.href;
}

window.addEventListener("DOMContentLoaded", () => {
  const id = getParam("p");
  const product = window.WITTY_PRODUCTS.find(p => p.id === id);

  if (!product) {
    document.getElementById("productWrap").innerHTML = `
      <h1>Product not found</h1>
      <p><a href="shop.html">Back to shop</a></p>
    `;
    return;
  }

  // Elements
  const titleEl = document.getElementById("pTitle");
  const metaEl = document.getElementById("pMeta");
  const mainImg = document.getElementById("mainImage");
  const swatchWrap = document.getElementById("swatches");
  const sizeSelect = document.getElementById("sizeSelect");
  const colorSelect = document.getElementById("colorSelect");
  const thumbs = document.getElementById("thumbs");
  const addBtn = document.getElementById("addToCartBtn");

  // Set title/meta
  titleEl.textContent = product.name;
  metaEl.textContent = `${money(product.price)} • ${product.badge || ""} • Sizes ${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}`;

  // Main image
  const defaultImg = (product.colors?.[0]?.img) || (product.gallery?.[0]) || "assets/logos/logo.png";
  mainImg.src = defaultImg;

  // Sizes dropdown
  sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">${s}</option>`).join("");

  // Colors dropdown + swatches
  colorSelect.innerHTML = product.colors.map(c => `<option value="${c.value}">${c.label}</option>`).join("");

  // Build swatches
  swatchWrap.innerHTML = "";
  product.colors.forEach((c, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `swatch ${idx === 0 ? "active" : ""}`;
    btn.setAttribute("aria-label", c.label);
    btn.dataset.color = c.value;
    btn.dataset.img = c.img;
    swatchWrap.appendChild(btn);
  });

  // Optional thumbnails gallery (varsity + hat)
  thumbs.innerHTML = "";
  const gallery = product.gallery || [];
  if (gallery.length > 1) {
    gallery.forEach((img, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `thumb ${idx === 0 ? "active" : ""}`;
      b.innerHTML = `<img src="${img}" alt="Photo ${idx + 1}">`;
      b.addEventListener("click", () => {
        thumbs.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
        b.classList.add("active");
        mainImg.src = img;
        // keep Snipcart image in sync too
        addBtn.setAttribute("data-item-image", absoluteUrl(img));
      });
      thumbs.appendChild(b);
    });
  }

  // Swatch click changes image + sync dropdown
  swatchWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".swatch");
    if (!btn) return;

    swatchWrap.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");

    const color = btn.dataset.color;
    const img = btn.dataset.img;

    colorSelect.value = color;
    mainImg.src = img;

    // Update Snipcart image
    addBtn.setAttribute("data-item-image", absoluteUrl(img));
  });

  // Dropdown color change triggers matching swatch
  colorSelect.addEventListener("change", () => {
    const color = colorSelect.value;
    const match = swatchWrap.querySelector(`.swatch[data-color="${CSS.escape(color)}"]`);
    if (match) match.click();
  });

  // Snipcart button setup (no hard-coded base URL)
  addBtn.setAttribute("data-item-id", product.id);
  addBtn.setAttribute("data-item-name", product.name);
  addBtn.setAttribute("data-item-price", product.price.toFixed(2));
  addBtn.setAttribute("data-item-description", product.description || "");
  addBtn.setAttribute("data-item-url", window.location.href);
  addBtn.setAttribute("data-item-image", absoluteUrl(defaultImg));

  // Custom fields (Size + Color)
  addBtn.setAttribute("data-item-custom1-name", "Size");
  addBtn.setAttribute("data-item-custom1-options", product.sizes.join("|"));
  addBtn.setAttribute("data-item-custom1-required", "true");

  addBtn.setAttribute("data-item-custom2-name", "Color");
  addBtn.setAttribute("data-item-custom2-options", product.colors.map(c => c.value).join("|"));
  addBtn.setAttribute("data-item-custom2-required", "true");

  // Before add to cart, force selected values
  addBtn.addEventListener("click", () => {
    addBtn.setAttribute("data-item-custom1-value", sizeSelect.value);
    addBtn.setAttribute("data-item-custom2-value", colorSelect.value);
  });
});
