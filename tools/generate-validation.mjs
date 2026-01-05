import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, "..");
const PRODUCTS_PATH = path.join(ROOT, "assets", "js", "products.js");
const OUT_PATH = path.join(ROOT, "validation.html");

// Change this if needed:
const VALIDATION_URL = "https://www.wittymoves.com/validation.html";

function loadProducts(productsJsPath) {
  const code = fs.readFileSync(productsJsPath, "utf8");

  const sandbox = { window: {} };
  vm.createContext(sandbox);

  // Run products.js in a fake browser environment
  vm.runInContext(code, sandbox);

  const products = sandbox.window.WITTY_PRODUCTS;
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error(
      "Could not load window.WITTY_PRODUCTS from assets/js/products.js. Make sure it defines window.WITTY_PRODUCTS = [...]"
    );
  }
  return products;
}

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildButton(p) {
  const id = p.id;
  const name = esc(p.name || "");
  const price = Number(p.price);
  const weight = Number(p.weight || 0);

  const img =
    (p.colors && p.colors[0] && p.colors[0].img) ||
    (p.gallery && p.gallery[0]) ||
    p.image ||
    "";

  const desc = esc(p.description || "");

  const sizes = Array.isArray(p.sizes) ? p.sizes.join("|") : "";
  const colors = Array.isArray(p.colors)
    ? p.colors.map((c) => c.value || c.label || "").filter(Boolean).join("|")
    : "";

  // Only include custom fields if you actually have options
  const sizeAttrs = sizes
    ? `
      data-item-custom1-name="Size"
      data-item-custom1-options="${esc(sizes)}"`
    : "";

  const colorAttrs = colors
    ? `
      data-item-custom2-name="Color"
      data-item-custom2-options="${esc(colors)}"`
    : "";

  return `
    <button
      class="snipcart-add-item"
      id="${esc(id)}"
      data-item-id="${esc(id)}"
      data-item-name="${name}"
      data-item-price="${Number.isFinite(price) ? price : 0}"
      data-item-url="${VALIDATION_URL}"
      ${img ? `data-item-image="${esc(img)}"` : ""}
      ${desc ? `data-item-description="${desc}"` : ""}
      data-item-weight="${Number.isFinite(weight) ? weight : 0}"${sizeAttrs}${colorAttrs}
    ></button>`;
}

function buildHtml(products) {
  const buttons = products.map(buildButton).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Snipcart Validation | Witty Moves</title>
</head>
<body>
  <!--
    Snipcart server crawls this page for order validation.
    IMPORTANT: Snipcart does NOT execute JS here.
    Every product must exist as an element on this page with the correct:
    data-item-id, data-item-price, data-item-url
  -->

  <div style="display:none">
${buttons}
  </div>
</body>
</html>`;
}

const products = loadProducts(PRODUCTS_PATH);
const html = buildHtml(products);

fs.writeFileSync(OUT_PATH, html, "utf8");
console.log(`✅ Wrote ${products.length} products to ${OUT_PATH}`);
