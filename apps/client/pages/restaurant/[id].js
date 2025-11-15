import React, { useEffect, useState } from "react";
import { ChatWidget } from "../../../../packages/ui";

export default function RestaurantPage({ params }) {
  const id = params?.id || "windmill-creek";
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [heroSrc, setHeroSrc] = useState(`/restaurants/${id}/hero-image.jpg`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const API_BASE =
          typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
            : "";
        const base = API_BASE || "";

        const [rRes, rMenus, rFaqs] = await Promise.all([
          fetch(`${base}/api/demo/restaurant`),
          fetch(`${base}/api/demo/menus`),
          fetch(`${base}/api/demo/faqs`),
        ]);

        if (!rRes.ok || !rMenus.ok || !rFaqs.ok)
          throw new Error("Demo endpoints unavailable");

        const restaurantJson = await rRes.json();
        const menusJson = await rMenus.json();
        const faqsJson = await rFaqs.json();

        if (!mounted) return;
        setRestaurant(restaurantJson);
        setMenus(menusJson);
        setFaqs(faqsJson);

        // probe for hero-image.jpg in public folder; fall back to svg if missing
        try {
          const imgResp = await fetch(`/restaurants/${id}/hero-image.jpg`);
          if (imgResp.ok) setHeroSrc(`/restaurants/${id}/hero-image.jpg`);
          else setHeroSrc(`/restaurants/${id}/hero.svg`);
        } catch (e) {
          setHeroSrc(`/restaurants/${id}/hero.svg`);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load demo data", err);
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!restaurant)
    return (
      <div style={{ padding: 24 }}>Failed to load restaurant demo data.</div>
    );

  // Render only the static hero background and the chat widget (per request)
  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto',
      }}
    >
      <section
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${heroSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </section>

      {/* Chat widget only (anchored bottom-right) */}
      <ChatWidget restaurantId={restaurant.id || id} />
    </div>
  );
}
