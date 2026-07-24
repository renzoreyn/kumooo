INSERT INTO demo_posts (id, slug, title, excerpt, body, status, published_at, created_at, updated_at) VALUES
('dpost_seed1', 'hello-kumooo', 'Hello from kumooo.js', 'Next.js starters, @kumooo/ui, and a place to publish.', 'kumooo.js sits on Next.js App Router with shared UI and starters for blank, blog, and shop.

## Try the editor

Sign into **Admin** with `admin` / `admin`, publish a post, leave a comment. Body text supports Markdown — headings, lists, links, and image URLs.

Content resets every day at 00:00 UTC.', 'published', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('dpost_seed2', 'why-not-wordpress', 'Why not WordPress', 'A small stack when you want pages you own.', 'Use this starter when you want a blog without a full CMS install.

- Write posts in Admin
- Comment as a guest
- Ship the same theme from `create-kumooo`

The demo database clears nightly so you can experiment freely.', 'published', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
