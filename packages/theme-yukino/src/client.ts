/** Browser module island injected into Yukino pages. */
export const yukinoClient = `
const KEY = "yukino-bag";
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function load() {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items) {
  sessionStorage.setItem(KEY, JSON.stringify(items));
}

function totalQty(items) {
  return items.reduce((n, i) => n + (i.qty || 0), 0);
}

function renderBag() {
  const items = load();
  const countEls = document.querySelectorAll("[data-yukino-bag-count]");
  countEls.forEach((el) => { el.textContent = String(totalQty(items)); });
  const lines = document.querySelector("[data-yukino-bag-lines]");
  if (!lines) return;
  if (!items.length) {
    lines.innerHTML = '<p class="yk-bag-empty">Bag is empty.</p>';
    return;
  }
  lines.innerHTML = items.map((item, idx) => \`
    <div class="yk-bag-line" data-idx="\${idx}">
      <div>
        <strong>\${item.title}</strong>
        <div>\${item.price} · Size \${item.size || "M"}</div>
      </div>
      <div class="qty">
        <button type="button" data-bag-dec aria-label="Decrease">−</button>
        <span>\${item.qty}</span>
        <button type="button" data-bag-inc aria-label="Increase">+</button>
        <button type="button" data-bag-rm aria-label="Remove">×</button>
      </div>
    </div>
  \`).join("");
}

function setDrawer(open) {
  const drawer = document.querySelector("[data-yukino-drawer]");
  const scrim = document.querySelector("[data-yukino-scrim]");
  if (!drawer || !scrim) return;
  if (open) {
    drawer.hidden = false;
    scrim.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("is-open"));
  } else {
    drawer.classList.remove("is-open");
    window.setTimeout(() => {
      drawer.hidden = true;
      scrim.hidden = true;
    }, reduce ? 0 : 280);
  }
}

function selectedSize(root) {
  const active = (root || document).querySelector("[data-size].is-active");
  return active ? active.getAttribute("data-size") || "M" : "M";
}

function addFromButton(btn) {
  const id = btn.getAttribute("data-id") || "";
  const title = btn.getAttribute("data-title") || "Item";
  const price = btn.getAttribute("data-price") || "";
  const size = selectedSize(btn.closest(".yukino-product, .yk-featured, main") || document);
  const items = load();
  const existing = items.find((i) => i.id === id && i.size === size);
  if (existing) existing.qty += 1;
  else items.push({ id, title, price, qty: 1, size });
  save(items);
  renderBag();
  setDrawer(true);
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (!(t instanceof Element)) return;
  if (t.closest("[data-yukino-bag-open]")) { setDrawer(true); return; }
  if (t.closest("[data-yukino-bag-close]") || t.closest("[data-yukino-scrim]")) { setDrawer(false); return; }
  const add = t.closest("[data-add-to-bag]");
  if (add) { addFromButton(add); return; }
  const sizeBtn = t.closest("[data-size]");
  if (sizeBtn) {
    const wrap = sizeBtn.parentElement;
    if (wrap) wrap.querySelectorAll("[data-size]").forEach((b) => b.classList.remove("is-active"));
    sizeBtn.classList.add("is-active");
    return;
  }
  const line = t.closest(".yk-bag-line");
  if (line) {
    const idx = Number(line.getAttribute("data-idx"));
    const items = load();
    if (t.closest("[data-bag-inc]") && items[idx]) items[idx].qty += 1;
    if (t.closest("[data-bag-dec]") && items[idx]) items[idx].qty = Math.max(0, items[idx].qty - 1);
    if (t.closest("[data-bag-rm]") && items[idx]) items[idx].qty = 0;
    save(items.filter((i) => i.qty > 0));
    renderBag();
    return;
  }
  if (t.closest("[data-yukino-checkout]")) {
    alert("Demo only - no payment.");
  }
});

renderBag();

async function bootMotion() {
  if (reduce) return;
  const snow = document.querySelector("[data-yukino-snow]");
  if (snow && !snow.childElementCount) {
    for (let i = 0; i < 36; i++) {
      const s = document.createElement("span");
      s.style.left = Math.random() * 100 + "%";
      s.style.animationDuration = 6 + Math.random() * 10 + "s";
      s.style.animationDelay = Math.random() * 8 + "s";
      s.style.opacity = String(0.25 + Math.random() * 0.5);
      snow.appendChild(s);
    }
  }
  try {
    const mod = await import("https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm");
    const gsap = mod.default || mod.gsap || mod;
    document.querySelectorAll("[data-yukino-reveal]").forEach((el) => el.classList.add("yk-will-animate"));
    gsap.to("[data-yukino-reveal].yk-will-animate", {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "power2.out",
      clearProps: "transform",
    });
    const heroBrand = document.querySelector(".yk-hero-brand");
    if (heroBrand) {
      gsap.from(heroBrand, { y: 28, opacity: 0, duration: 1, ease: "power3.out" });
    }
  } catch (_) {
    document.querySelectorAll("[data-yukino-reveal]").forEach((el) => {
      el.classList.remove("yk-will-animate");
    });
  }
}

bootMotion();
`.trim();
