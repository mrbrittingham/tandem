<<<<<<< HEAD
-- Seed data for Windmill Creek demo (supabase)
-- Creates a restaurant with the UUID used in some routes and sample menus/faqs.

-- Restaurant (use the UUID from the failing route)
INSERT INTO restaurants (id, name, domain)
VALUES (
  '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f',
  'Windmill Creek Winery & Farm Kitchen',
  'windmillcreekvineyard.com'
);

-- Menus and items
WITH kids_menu AS (
  INSERT INTO menus (id, restaurant_id, name)
  VALUES (gen_random_uuid(), '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f', 'Kids Menu')
  RETURNING id
)
INSERT INTO menu_items (id, menu_id, name, description, price)
SELECT gen_random_uuid(), id, name, description, price FROM (
  VALUES
    ('Kids Menu', 'Served with house chips, or add a side for $3.', 8),
    ('Grilled Cheese', NULL, NULL),
    ('Cheesy Mac & Cheese', NULL, NULL),
    ('Crispy Chicken Strips', NULL, NULL)
) AS vals(name, description, price), kids_menu;

-- Sample mains menu
WITH mains AS (
  INSERT INTO menus (id, restaurant_id, name)
  VALUES (gen_random_uuid(), '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f', 'Entrees')
  RETURNING id
)
INSERT INTO menu_items (id, menu_id, name, description, price)
SELECT gen_random_uuid(), id, name, description, price FROM (
  VALUES
    ('Braised Short Ribs', 'Braised in house red wine with mushrooms and broccolini over polenta.', 30),
    ('Blackened Swordfish', 'Over andouille and red bean risotto with roasted red pepper aioli.', 30),
    ('Lamb Ragout', 'Slow-cooked leg of lamb with capers, olives, and shaved parmesan.', 25)
) AS vals(name, description, price), mains;

-- FAQs
INSERT INTO faqs (id, restaurant_id, question, answer)
VALUES
  (gen_random_uuid(), '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f', 'Do you take reservations?', 'Yes — we accept reservations for dining and special events.'),
  (gen_random_uuid(), '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f', 'Do you offer outdoor seating?', 'Yes — we have patios and outdoor seating when weather permits.');

-- Done. Run this file with psql or the Supabase SQL editor.
=======
-- Seed data for Windmill Creek demo (supabase)
-- Creates a restaurant with the UUID used in some routes and sample menus/faqs.

-- Restaurant (use the UUID from the failing route)
INSERT INTO restaurants (id, name, domain)
VALUES (
  '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f',
  'Windmill Creek Winery & Farm Kitchen',
  'windmillcreekvineyard.com'
);

-- Menus and items
WITH kids_menu AS (
  INSERT INTO menus (id, restaurant_id, name)
  VALUES (gen_random_uuid(), '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f', 'Kids Menu')
  RETURNING id
)
INSERT INTO menu_items (id, menu_id, name, description, price)
SELECT gen_random_uuid(), id, name, description, price FROM (
  VALUES
    ('Kids Menu', 'Served with house chips, or add a side for $3.', 8),
    ('Grilled Cheese', NULL, NULL),
    ('Cheesy Mac & Cheese', NULL, NULL),
    ('Crispy Chicken Strips', NULL, NULL)
) AS vals(name, description, price), kids_menu;

-- Sample mains menu
WITH mains AS (
  INSERT INTO menus (id, restaurant_id, name)
  VALUES (gen_random_uuid(), '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f', 'Entrees')
  RETURNING id
)
INSERT INTO menu_items (id, menu_id, name, description, price)
SELECT gen_random_uuid(), id, name, description, price FROM (
  VALUES
    ('Braised Short Ribs', 'Braised in house red wine with mushrooms and broccolini over polenta.', 30),
    ('Blackened Swordfish', 'Over andouille and red bean risotto with roasted red pepper aioli.', 30),
    ('Lamb Ragout', 'Slow-cooked leg of lamb with capers, olives, and shaved parmesan.', 25)
) AS vals(name, description, price), mains;

-- FAQs
INSERT INTO faqs (id, restaurant_id, question, answer)
VALUES
  (gen_random_uuid(), '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f', 'Do you take reservations?', 'Yes — we accept reservations for dining and special events.'),
  (gen_random_uuid(), '0d3c0d39-05e1-400f-b8b5-1e9e6bf38d5f', 'Do you offer outdoor seating?', 'Yes — we have patios and outdoor seating when weather permits.');

-- Done. Run this file with psql or the Supabase SQL editor.
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
