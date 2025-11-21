import React from "react";
import { ChatWidget } from "@tandem/ui-kit";

export default function WindmillDemo() {
  const id = "windmill-creek";
  return (
    <div style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(/restaurants/${id}/hero-image.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.9)",
        }}
      />

      <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
        <ChatWidget restaurantId={id} />
      </div>
    </div>
  );
}
