import React from "react";
import { useRouter } from "next/router";
import { ChatWidget } from "ui";

export default function ChatPage() {
  const router = useRouter();
  const { restaurant } = router.query || {};

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Chat</h1>
      <p>Chat for restaurant: {restaurant || "(none)"}</p>

      <div style={{ marginTop: 20 }}>
        <ChatWidget restaurantId={restaurant} />
      </div>
    </div>
  );
}
