// assets/js/shop.js
(function () {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  const items = window.products || window.PRODUCTS || [];

  const slugify = (str) =>
    String(str || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const getId = (p) => p.id || p.slug || p.handle || slugify(p.name);

  grid.innerHTML = items
    .map((p) => {
      const pid = getId(p);

      // If your product detail page is different, replace this href
      const href = p.href || `product.html?id=${encodeURIComponent(pid)}`;

      return `
        <a class="product-card" id="${pid}" href="${href}">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          <div class="pc-body">
            <div class="pc-top">
              <div>
                <div><strong>${p.name}</strong></div>
                <div class="muted">$${Number(p.price).toFixed(2)}</div>
              </div>
              ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
            </div>
          </div>
        </a>
      `;
    })
    .join("");

  // Scroll to #hash item (from homepage)
  const hash = (location.hash || "").replace("#", "");
  if (hash) {
    const el = document.getElementById(hash);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.style.outline = "2px solid rgba(0,0,0,.25)";
        el.style.outlineOffset = "6px";
        setTimeout(() => {
          el.style.outline = "";
          el.style.outlineOffset = "";
        }, 1600);
      }, 80);
    }
  }
})();
