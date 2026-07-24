-- Product detail fields for shop demo
ALTER TABLE demo_products ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE demo_products ADD COLUMN sizes_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE demo_products ADD COLUMN colors_json TEXT NOT NULL DEFAULT '[]';
