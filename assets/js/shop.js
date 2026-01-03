// assets/js/shop.js
(function () {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  const items =
    window.WITTY_PRODUCTS ||
    (window.WITTY && window.WITTY.products) ||
    window.products ||
    [];

  if (!items.length) {
    grid.innerHTML = `<p class="muted">No products loaded. Check assets/js/products.js is linked correctly.</p>`;
    return;
  }

  const money = (n) => {
    const num = Number(n);
    return Number.isFinite(num) ? num.toFixed(2) : "0.00";
  };

  grid.innerHTML = items
    .map((p) => {
      const pid = p.id;

      const img =
        (p.colors && p.colors[0] && p.colors[0].img) ||
        p.image ||
        "";

      const href = `product.html?id=${encodeURIComponent(pid)}`;

      return `
        <a class="product-card" id="${pid}" href="${href}">
          <img src="${img}" alt="${p.name}" loading="lazy" />
          <div class="pc-body">
            <div class="pc-top">
              <div>
                <div><strong>${p.name}</strong></div>
                <div class="muted">$${money(p.price)}</div>
              </div>
              ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
            </div>
          </div>
        </a>
      `;
    })
    .join("");

  // Scroll + highlight when coming from homepage hash links
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
