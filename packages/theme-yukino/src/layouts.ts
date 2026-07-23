import { html, joinHtml, raw, type Html, type PostListItem, type RenderedContent } from "@kumooo/theme-kit";
import { YUKINO_CATALOG, productBySlug } from "./catalog.js";
import { ic } from "./icons.js";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;

function dropCard(p: (typeof YUKINO_CATALOG)[number]): Html {
  return html`<a class="yk-card" href="/${p.slug}" data-yukino-reveal>
    <div class="yk-card-media">
      <img src="${p.image}" alt="${p.imageAlt}" width="600" height="750" loading="lazy" decoding="async" />
      <span class="yk-card-tag">Drop</span>
    </div>
    <div class="yk-card-body">
      <div class="yk-card-top">
        <h3>${p.title}</h3>
        <span class="yk-price">${p.price}</span>
      </div>
      <p class="yk-blurb">${p.blurb}</p>
    </div>
  </a>`;
}

export function shopMain(page: RenderedContent): Html {
  const drops = joinHtml(YUKINO_CATALOG.map(dropCard), "");
  return html`<main class="yukino-shop">
  <header class="yk-page-head">
    <p class="kicker">${raw(ic.snow!)} Catalog</p>
    <h1>${page.title}</h1>
    <p class="lead">Limited glacial drop. Add to bag is theater. Demo only - no payment.</p>
  </header>
  <div class="yk-prose yk-prose-tight">${raw(page.html)}</div>
  <div class="yk-drops">${drops}</div>
</main>`;
}

export function productMain(post: RenderedContent): Html {
  const product = productBySlug(post.slug);
  const title = product?.title ?? post.title;
  const price = product?.price ?? "";
  const id = product?.id ?? post.slug;
  const image = product?.image ?? "";
  const imageAlt = product?.imageAlt ?? title;
  const sizes = joinHtml(
    SIZES.map(
      (s, i) =>
        html`<button type="button" class="yk-size${i === 2 ? " is-active" : ""}" data-size="${s}">${s}</button>`,
    ),
    "",
  );

  return html`<main class="yukino-product">
  <div class="yk-product-media">
    ${image
      ? html`<img src="${image}" alt="${imageAlt}" width="900" height="1100" fetchpriority="high" decoding="async" />`
      : html`<div class="yk-product-art yk-art-a" aria-hidden="true"></div>`}
  </div>
  <div class="yk-product-meta">
    <p class="kicker">Product</p>
    <h1>${title}</h1>
    <span class="yk-price yk-price-lg">${price}</span>
    <p class="yk-blurb">${product?.blurb ?? post.excerpt ?? ""}</p>
    <p class="yk-label">Size</p>
    <div class="yk-sizes" role="group" aria-label="Size">${sizes}</div>
    <button type="button" class="yk-btn yk-btn-primary yk-btn-wide" data-add-to-bag
      data-id="${id}" data-title="${title}" data-price="${price}">
      ${raw(ic.bag!)} Add to bag
    </button>
    <p class="yk-demo-note">Demo only - no payment.</p>
    <div class="yk-accordion">
      <details class="yk-acc-item" open>
        <summary>Details ${raw(ic.chevron!)}</summary>
        <div class="body yk-prose">${raw(post.html)}</div>
      </details>
      <details class="yk-acc-item">
        <summary>Shipping ${raw(ic.chevron!)}</summary>
        <div class="body">Showcase theme only. Nothing ships. Nothing charges.</div>
      </details>
    </div>
  </div>
  <div class="yk-sticky-buy">
    <div>
      <strong>${title}</strong>
      <span class="yk-price">${price}</span>
    </div>
    <button type="button" class="yk-btn yk-btn-primary" data-add-to-bag
      data-id="${id}" data-title="${title}" data-price="${price}">Add to bag</button>
  </div>
</main>`;
}

export function articleMain(title: string, body: Html, excerpt?: string | null): Html {
  return html`<main class="yukino-article">
  <header class="yk-page-head">
    <p class="kicker">Journal</p>
    <h1>${title}</h1>
    ${excerpt ? html`<p class="lead">${excerpt}</p>` : html``}
  </header>
  <div class="yk-prose">${body}</div>
</main>`;
}

export function archiveMain(title: string, posts: PostListItem[]): Html {
  const list = posts.length
    ? joinHtml(
        posts.map(
          (p) => html`<a class="yk-journal-item" href="${p.url}">
            <div>
              <h3>${p.title}</h3>
              ${p.excerpt ? html`<p>${p.excerpt}</p>` : html``}
            </div>
            <span class="yk-journal-go">Read</span>
          </a>`,
        ),
        "",
      )
    : html`<p class="yk-blurb">No entries yet.</p>`;
  return html`<main class="yukino-archive">
  <header class="yk-page-head">
    <p class="kicker">Archive</p>
    <h1>${title}</h1>
  </header>
  <div class="yk-journal-list">${list}</div>
</main>`;
}

export function notFoundMain(): Html {
  return html`<main class="yk-404">
  <p class="kicker">404</p>
  <h1>Lost in the whiteout</h1>
  <p class="yk-blurb">That path drifted. Head back to the drop.</p>
  <p><a class="yk-btn yk-btn-primary" href="/">Home</a></p>
</main>`;
}
