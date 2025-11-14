import React, { useEffect, useState } from 'react';
import { ChatWidget } from '../../../../packages/ui';

export default function RestaurantPage({ params }) {
  const id = params?.id || 'windmill-creek';
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/demo/restaurant');
        setRestaurant(await r.json());
        const m = await fetch('/api/demo/menus');
        setMenus(await m.json());
        const f = await fetch('/api/demo/faqs');
        setFaqs(await f.json());
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [id]);

  // hero image selection: try a large photo first, fall back to existing SVG
  const [heroSrc, setHeroSrc] = useState('/restaurants/windmill-creek/hero-image.jpg');
  useEffect(() => {
    // probe for the large hero jpg; fallback to svg if not present
    const img = new Image();
    img.onload = () => setHeroSrc('/restaurants/windmill-creek/hero-image.jpg');
    img.onerror = () => setHeroSrc('/restaurants/windmill-creek/hero.svg');
    img.src = '/restaurants/windmill-creek/hero-image.jpg';
  }, []);

  if (!restaurant) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 28, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto' }}>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: '100%',
              height: 360,
              backgroundImage: `url(${heroSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{ padding: '28px 40px', maxWidth: 720, color: '#fff', textShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, opacity: 0.95 }}>{restaurant.short_name}</div>
                <h1 style={{ margin: '8px 0 8px', fontSize: 44, lineHeight: 1.02 }}>{restaurant.name}</h1>
                <p style={{ fontSize: 16, maxWidth: 560, marginTop: 6 }}>{restaurant.description}</p>
              </div>
            </div>
          </div>
        </div>
        <aside style={{ width: 300 }}>
          <img src="/restaurants/windmill-creek/avatar.svg" alt="avatar" style={{ width: 120, height: 120, borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }} />
        </aside>
      </div>
      <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
        <div style={{ flex: 1 }}>
          <h2>Menus</h2>
          {menus.map((menu) => (
            <div key={menu.id} style={{ marginBottom: 12 }}>
              <h3 style={{ marginBottom: 6 }}>{menu.title}</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <img src="/restaurants/windmill-creek/menu-placeholder.svg" alt="menu" style={{ width: 140, height: 90, borderRadius: 8 }} />
                <ul>
                {menu.items.map((it) => (
                  <li key={it.id} style={{ marginBottom: 6 }}>
                    <strong>{it.name}</strong>{it.price ? ` — $${it.price}` : ''}
                    {it.description ? <div style={{ color: '#666' }}>{it.description}</div> : null}
                  </li>
                ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <aside style={{ width: 320 }}>
          <h2>Info</h2>
          <div><strong>Phone:</strong> {restaurant.phone}</div>
          <div><strong>Hours:</strong> {restaurant.hours}</div>
          <div style={{ marginTop: 12 }}>
            <h3>FAQs</h3>
            {faqs.map((q) => (
              <div key={q.id} style={{ marginBottom: 8 }}>
                <strong>{q.question}</strong>
                <div style={{ color: '#555' }}>{q.answer}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
      {/* Embedded chat widget specific to this restaurant */}
      <ChatWidget restaurantId={restaurant.id || 'windmill-creek'} />
    </div>
  );
}

// Render the ChatWidget for this restaurant
export function ChatWidgetWrapper({ params }) {
  const id = params?.id || 'windmill-creek';
  return <ChatWidget restaurantId={id} />;
}
