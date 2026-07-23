import { html, joinHtml, raw, type Html, type PostListItem, type ThemeSiteContext } from "@kumooo/theme-kit";
import {
  YUKINO_CATALOG,
  YUKINO_HERO_IMAGE,
  YUKINO_STORY_IMAGE,
  isYukinoProductSlug,
} from "./catalog.js";
import { ic } from "./icons.js";

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

export function homeMain(
  _site: ThemeSiteContext,
  data: { posts: PostListItem[]; page: number; totalPages: number; basePath: string },
): Html {
  const featured = YUKINO_CATALOG[0]!;
  const drops = joinHtml(YUKINO_CATALOG.map(dropCard), "");
  const journalPosts = data.posts.filter((p) => !isYukinoProductSlug(p.slug)).slice(0, 4);
  const journalSource = journalPosts.length ? journalPosts : data.posts.slice(0, 4);
  const journal = journalSource.length
    ? joinHtml(
        journalSource.map(
          (p) => html`<a class="yk-journal-item" href="${p.url}" data-yukino-reveal>
            <div>
              <h3>${p.title}</h3>
              ${p.excerpt ? html`<p>${p.excerpt}</p>` : html``}
            </div>
            <span class="yk-journal-go">Read ${raw(ic.chevron!)}</span>
          </a>`,
        ),
        "",
      )
    : html`<p class="yk-blurb">Journal drops land here when you publish.</p>`;

  return html`<main>
  <section class="yk-hero yukino-hero" data-yukino-hero>
    <div class="yk-hero-media" aria-hidden="true">
      <img src="${YUKINO_HERO_IMAGE}" alt="" width="2000" height="1200" fetchpriority="high" decoding="async" />
      <div class="yk-hero-veil"></div>
    </div>
    <div class="yk-hero-snow" data-yukino-snow aria-hidden="true"></div>
    <div class="yk-hero-inner">
      <p class="yk-hero-brand">YUKINO</p>
      <h1>Cut for the whiteout.</h1>
      <p class="yk-lead">Glacial outerwear. Limited drops. A lookbook theme that shows what Kumooo can do.</p>
      <div class="yk-cta">
        <a class="yk-btn yk-btn-primary" href="/shop">Shop the drop</a>
        <a class="yk-btn yk-btn-ghost" href="/about">Brand story</a>
      </div>
    </div>
  </section>

  <section class="yk-section">
    <div class="yk-wrap">
      <div class="yk-section-head">
        <p class="kicker">${raw(ic.snow!)} Current drop</p>
        <h2>Three pieces. No noise.</h2>
      </div>
      <div class="yk-drops">${drops}</div>
    </div>
  </section>

  <section class="yk-section yk-story">
    <div class="yk-wrap yk-story-grid">
      <div class="yk-story-copy" data-yukino-reveal>
        <p class="kicker">Manifesto</p>
        <h2>Cold clarity over clutter.</h2>
        <p>Yukino is a lookbook theme: full-bleed hero, product theater, demo bag. One launcher, many sites. Built to feel like a brand, not a template.</p>
      </div>
      <div class="yk-story-media" data-yukino-reveal>
        <img src="${YUKINO_STORY_IMAGE}" alt="Snowy mountain ridge at dusk" width="1200" height="900" loading="lazy" decoding="async" />
      </div>
    </div>
  </section>

  <section class="yk-section">
    <div class="yk-wrap yk-featured">
      <div class="yk-featured-media" data-yukino-reveal>
        <img src="${featured.image}" alt="${featured.imageAlt}" width="900" height="1100" loading="lazy" decoding="async" />
      </div>
      <div data-yukino-reveal>
        <p class="kicker">Featured</p>
        <h2>${featured.title}</h2>
        <p class="yk-blurb">${featured.blurb}</p>
        <span class="yk-price yk-price-lg">${featured.price}</span>
        <div class="yk-cta" style="margin-top:1.25rem">
          <button type="button" class="yk-btn yk-btn-primary" data-add-to-bag
            data-id="${featured.id}" data-title="${featured.title}" data-price="${featured.price}">
            ${raw(ic.bag!)} Add to bag
          </button>
          <a class="yk-btn yk-btn-ghost" href="/${featured.slug}">View details</a>
        </div>
        <p class="yk-demo-note">Demo only - no payment.</p>
      </div>
    </div>
  </section>

  <section class="yk-section yk-section-tight">
    <div class="yk-wrap">
      <div class="yk-section-head">
        <p class="kicker">Journal</p>
        <h2>Field notes from the freeze.</h2>
      </div>
      <div class="yk-journal-list">${journal}</div>
    </div>
  </section>
</main>`;
}
