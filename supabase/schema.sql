-- Supabase schema for Tandem (initial)

-- Restaurants table
CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  created_at timestamptz DEFAULT now()
);

-- Menus and menu items
CREATE TABLE menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL
);

CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES menus(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric
);

-- FAQs
CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text
);

-- Reservations (simple)
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  party_size int,
  reservation_date date,
  reservation_time time,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
