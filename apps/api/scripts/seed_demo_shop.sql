DELETE FROM demo_products;

INSERT INTO demo_products (id, slug, name, price, blurb, image_url, description, sizes_json, colors_json, status, created_at, updated_at) VALUES
('dprod_seed1', 'drift', 'Drift Parka', '$420', 'Wind-cut shell for cold starts.', 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80', 'A layered shell built for cold starts and long walks. Storm flap, quiet hardware, and a hood that actually stays put.

Packs into its own pocket. Water-resistant face fabric with a soft brushed liner.', '["XS","S","M","L","XL"]', '[{"name":"Ink","hex":"#1d1d1f"},{"name":"Fog","hex":"#8b93a7"},{"name":"Mint","hex":"#6ee7b7"}]', 'published', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('dprod_seed2', 'rime', 'Rime Shell', '$280', 'Hardface layer. Quiet zippers.', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', 'Hardface outer with taped seams and a clean silhouette. Made for shoulder seasons when weather won''t pick a side.

Two-way zip, packable hood, reflective stitch at the hem.', '["S","M","L","XL"]', '[{"name":"Black","hex":"#0a0a0a"},{"name":"Ice","hex":"#c8d6ef"}]', 'published', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('dprod_seed3', 'glacier', 'Glacier Knit', '$160', 'Merino weight for the descent.', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', 'Fine merino knit with enough structure for layering and enough softness for all-day wear. Ribbed cuffs, relaxed collar.

Machine wash cold. Lay flat to dry.', '["XS","S","M","L"]', '[{"name":"Cream","hex":"#f4f0e8"},{"name":"Stone","hex":"#9a9590"},{"name":"Navy","hex":"#1e3a5f"}]', 'published', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
