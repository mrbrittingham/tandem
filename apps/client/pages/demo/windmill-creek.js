import React from "react";

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
    </div>
  );
}
