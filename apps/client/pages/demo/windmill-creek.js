import React from "react";
<<<<<<< HEAD
=======
import { ChatWidget } from "@tandem/ui-kit";
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a

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
<<<<<<< HEAD
=======

      <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
        <ChatWidget restaurantId={id} />
      </div>
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
    </div>
  );
}
