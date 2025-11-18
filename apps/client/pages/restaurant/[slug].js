import React, { useEffect, useState } from "react";
import { ChatWidget } from "ui";
import { useRouter } from "next/router";

export default function RestaurantPage() {
  const router = useRouter();
  const { slug } = router.query || {};
  console.log("PARAMS:", slug);
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [heroSrc, setHeroSrc] = useState(
    slug ? `/restaurants/${slug}/hero-image.jpg` : "/restaurants/hero.svg",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Always use the same-origin Next.js API route to fetch restaurant data.
        if (!slug) {
          // slug not ready yet (client router); leave loading state until slug appears
          return;
        }

        const rRes = await fetch(
          `/api/restaurant?id=${encodeURIComponent(slug)}`,
        );
        if (!rRes.ok) {
          console.error("/api/restaurant returned non-OK", rRes.status);
          throw new Error("Restaurant endpoint unavailable");
        }
        const restaurantJson = await rRes.json();
        if (!mounted) return;
        setRestaurant(restaurantJson || null);

        // Fetch menus and faqs for this restaurant (only after restaurant fetch succeeds)
        try {
          const mRes = await fetch(
            `/api/menus?restaurant=${encodeURIComponent(slug)}`,
          );
          const menusJson = mRes.ok ? await mRes.json() : [];
          if (mounted) setMenus(menusJson);
        } catch {
          if (mounted) setMenus([]);
        }

        try {
          const fRes = await fetch(
            `/api/faqs?restaurant=${encodeURIComponent(slug)}`,
          );
          const faqsJson = fRes.ok ? await fRes.json() : [];
          if (mounted) setFaqs(faqsJson);
        } catch {
          if (mounted) setFaqs([]);
        }

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
    return <div style={{ padding: 24 }}>Failed to load restaurant data.</div>;

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
      <ChatWidget restaurantId={restaurant?.id || slug} />
    </div>
  );
}
