import React, { useEffect, useState } from "react";
import { ChatWidget } from "ui";

export default function RestaurantPage({ params }) {
  const slug = params?.slug;
  const [restaurant, setRestaurant] = useState(null);
  const [heroSrc, setHeroSrc] = useState(slug ? `/restaurants/${slug}/hero-image.jpg` : "/restaurants/hero.svg");
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

        if (!slug) throw new Error("restaurant slug required");

        const rRes = await fetch(`${base}/api/restaurant?id=${encodeURIComponent(slug)}`);
        if (!rRes.ok) throw new Error("Restaurant endpoint unavailable");
        const restaurantJson = await rRes.json();
        if (!mounted) return;
        setRestaurant(restaurantJson);

        try {
          const imgResp = await fetch(`/restaurants/${slug}/hero-image.jpg`);
          if (imgResp.ok) setHeroSrc(`/restaurants/${slug}/hero-image.jpg`);
          else setHeroSrc(`/restaurants/${slug}/hero.svg`);
        } catch {
          setHeroSrc(`/restaurants/${slug}/hero.svg`);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load restaurant data", err);
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!restaurant)
    return (
      <div style={{ padding: 24 }}>Failed to load restaurant data.</div>
    );

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
      <ChatWidget restaurantId={slug} />
    </div>
  );
}
