// assets/js/shop.js

function money(n) {
  return `$${Number(n).toFixed(0)}`;
}

function productLink(id) {
  return `product.html?p=${encodeURIComponent(id)}`;
}

function firstImage(p) {
  if (p.colors && p.colors[0] && p.colors[0].img) return p.colors[0].img;
  return "assets/logos/logo.png";
}

window.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  grid.innerHTML = "";

  window.WITTY_PRODUCTS.forEach(p => {
    const a = document.createElement("a");
    a.className = "product-card";
    a.href = productLink(p.id);

    a.innerHTML = `
      <img src="${firstImage(p)}" alt="${p.name}">
      <div class="pc-body">
        <div class="pc-top">
          <h3>${p.name}</h3>
          <span class="badge">${p.badge || ""}</span>
        </div>
        <p class="muted">${money(p.price)} • ${p.gender === "men" ? "Men sizing" : "Unisex/Women"} • Sizes: ${p.sizes.join("–")}</p>
      </div>
    `;

    grid.appendChild(a);
  });
});

