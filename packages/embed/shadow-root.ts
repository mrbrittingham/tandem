export function createTandemShadowRoot(): ShadowRoot {
  const hostId = "tandem-root";
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    document.body.appendChild(host);
  }

  const shadow = host.attachShadow({ mode: "closed" });

  // Inject basic styles for isolation
  const style = document.createElement("style");
  style.textContent = `/* Tandem embed base styles */\n:host { all: initial; }\n* { box-sizing: border-box; }\nbody { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif; }`;
  shadow.appendChild(style);

  const container = document.createElement("div");
  container.id = "tandem-widget-container";
  shadow.appendChild(container);

  return shadow;
}
