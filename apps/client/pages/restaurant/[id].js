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

  if (!restaurant) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 28, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto' }}>
      <h1>{restaurant.name}</h1>
      <p style={{ color: '#555' }}>{restaurant.description}</p>
      <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
        <div style={{ flex: 1 }}>
          <h2>Menus</h2>
          {menus.map((menu) => (
            <div key={menu.id} style={{ marginBottom: 12 }}>
              <h3 style={{ marginBottom: 6 }}>{menu.title}</h3>
              <ul>
                {menu.items.map((it) => (
                  <li key={it.id} style={{ marginBottom: 6 }}>
                    <strong>{it.name}</strong>{it.price ? ` — $${it.price}` : ''}
                    {it.description ? <div style={{ color: '#666' }}>{it.description}</div> : null}
                  </li>
                ))}
              </ul>
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
    </div>
  );
}

// Render the ChatWidget for this restaurant
export function ChatWidgetWrapper({ params }) {
  const id = params?.id || 'windmill-creek';
  return <ChatWidget restaurantId={id} />;
}
