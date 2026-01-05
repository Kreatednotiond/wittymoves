// generate-validation.js
// Run: node generate-validation.js
// This reads ./assets/js/products.js and generates ./validation.html with ALL products
// so Snipcart's crawler can validate prices/URLs correctly (no JS execution needed).

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PRODUCTS_JS_PATH = path.join(__dirname, "assets", "js", "products.js");
const OUT_PATH = path.join(__dirname, "validation.html");

if (!fs.existsSync(PRODUCTS_JS_PATH)) {
  console.error("❌ Could not find:", PRODUCTS_JS_PATH);
  process.exit(1);
}

const productsJs = fs.readFileSync(PRODUCTS_JS_PATH, "utf8");

// Execute products.js in a sandbox so we can grab window.WITTY_PRODUCTS safely
const sandbox = { window: {} };
vm.createContext(sandbox);

try {
  vm.runInContext(productsJs, sandbox, { timeout: 1000 });
} catch (e) {
  console.error("❌ Failed to evaluate products.js. Error:\n", e);
  process.exit(1);
}

const products = sandbox.window.WITTY_PRODUCTS;

if (!Array.isArray(products) || products.length === 0) {
  console.error("❌ window.WITTY_PRODUCTS is empty or not an array. Check products.js exports.");
  process.exit(1);
}

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const toMoney = (n) => {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
};

const fullUrl = (maybeRelative) => {
  const v = String(maybeRelative || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  // make relative asset paths absolute so crawler can fetch images if needed
  const base = "https://www.wittymoves.com/";
  return base + v.replace(/^\//, "");
};

// Build static HTML buttons (crawler can read these)
const buttons = products
  .map((p) => {
    const id = String(p.id || "").trim();
    if (!id) return "";

    const name = escapeHtml(p.name || "Product");
    const price = toMoney(p.price);

    const img =
      (p.colors && p.colors[0] && p.colors[0].img) ||
      p.image ||
      (p.gallery && p.gallery[0]) ||
      "";

    const desc = escapeHtml(p.description || "");

    const weight = Number.isFinite(Number(p.weight)) ? String(p.weight) : "0";

    // Sizes + colors for validation consistency (not strictly required, but helps)
    const sizes = Array.isArray(p.sizes) ? p.sizes.join("|") : "";
    const colors = Array.isArray(p.colors) ? p.colors.map((c) => c.value).join("|") : "";

    return `
      <button
        id="${escapeHtml(id)}"
        class="snipcart-add-item"
        data-item-id="${escapeHtml(id)}"
        data-item-name="${name}"
        data-item-price="${price}"
        data-item-url="https://www.wittymoves.com/validation.html"
        data-item-image="${escapeHtml(fullUrl(img))}"
        data-item-description="${desc}"
        data-item-weight="${escapeHtml(weight)}"
        ${sizes ? `data-item-custom1-name="Size" data-item-custom1-options="${escapeHtml(sizes)}"` : ""}
        ${colors ? `data-item-custom2-name="Color" data-item-custom2-options="${escapeHtml(colors)}"` : ""}
        type="button"
      >
        Add
      </button>
    `;
  })
  .filter(Boolean)
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Validation | Witty Moves</title>
  <meta name="robots" content="noindex,nofollow" />
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 24px; }
    .note { max-width: 900px; }
    .wrap { display:none; }
  </style>
</head>
<body>
  <div class="note">
    <h1>Witty Moves Validation Page</h1>
    <p>
      This page exists only so Snipcart can crawl static product definitions for order validation.
      It is intentionally not linked in the UI.
    </p>
  </div>

  <!-- IMPORTANT: Snipcart crawler reads these static buttons -->
  <div class="wrap">
    ${buttons}
  </div>

  <!-- Snipcart (kept so page is valid in case you ever open it) -->
  <div hidden id="snipcart" data-api-key="MDAwM2ViMzEtOTIwYS00MWVlLTk5YjMtMmZhZDU4MDgyMzVkNjM5MDI5MDAxMzIwMTUwNzA1"></div>
  <script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>
  <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.css" />
</body>
</html>
`;

fs.writeFileSync(OUT_PATH, html, "utf8");
console.log(`✅ Generated ${OUT_PATH} with ${products.length} products.`);
