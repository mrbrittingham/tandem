import React, { useEffect, useState } from "react";
import { ChatWidget } from "ui";

export default function RestaurantPage({ params }) {
  const id = params?.id || "windmill-creek";
  const [restaurant, setRestaurant] = useState(null);
  // menus/faqs are unused in this simplified demo page
  const [heroSrc, setHeroSrc] = useState(`/restaurants/${id}/hero-image.jpg`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const API_BASE =
          typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE
            ? process.env.NEXT_PUBLIC_API_BASE.replace(/\/$/, "")
            : "";
        const base = API_BASE || "";

        // Only load the demo restaurant payload used by this page
        const rRes = await fetch(`${base}/api/demo/restaurant`);
        if (!rRes.ok) throw new Error("Demo endpoint unavailable");
        const restaurantJson = await rRes.json();
        if (!mounted) return;
        setRestaurant(restaurantJson);

        // probe for hero-image.jpg in public folder; fall back to svg if missing
        try {
          const imgResp = await fetch(`/restaurants/${id}/hero-image.jpg`);
          if (imgResp.ok) setHeroSrc(`/restaurants/${id}/hero-image.jpg`);
          else setHeroSrc(`/restaurants/${id}/hero.svg`);
        } catch {
          // ignore failures probing the public image; fall back to svg
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
