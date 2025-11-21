import { createTandemShadowRoot } from "./shadow-root";

export interface TandemEmbedOptions {
  restaurantSlug?: string;
  theme?: string;
}

function mountShadowWidget(options: TandemEmbedOptions = {}): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const restaurantSlug =
    options.restaurantSlug ||
    (document.currentScript as HTMLScriptElement | null)?.dataset.restaurant ||
    "windmill-creek";

  const shadow = createTandemShadowRoot();
  const container = (shadow as any).getElementById?.("tandem-widget-container") ||
    shadow.querySelector("#tandem-widget-container");

  if (!container) {
    console.error("[Tandem Embed] Missing container inside shadow root.");
    return;
  }

  const state = { isOpen: false };
  const apiBase = "/api/public/chatbot-config";
  const configUrl = `${apiBase}?slug=${encodeURIComponent(restaurantSlug)}`;

  fetch(configUrl)
    .then((res) => res.json())
    .then((config) => {
      // For now, use minimal render while full React widget wiring is added.
      renderWidget(container as HTMLElement, state, config);
    })
    .catch((err) => {
      console.error("[Tandem Embed] Failed to load chatbot config", err);
      renderWidget(container as HTMLElement, state, null);
    });

  function renderWidget(root: HTMLElement, state: { isOpen: boolean }, config: any) {
    root.innerHTML = "";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Open chat");
    Object.assign(btn.style, {
      position: "fixed",
      right: "24px",
      bottom: "24px",
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      border: "none",
      padding: "0",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#D9A441",
      boxShadow: "0 8px 20px rgba(61, 40, 23, 0.18)",
      zIndex: "2147483000",
    } as CSSStyleDeclaration);

    btn.innerHTML = `
      <div style="position:relative;width:64px;height:64px;display:flex;align-items:center;justify-content:center;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5C2E4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 10a7 7 0 0 1 14 0v7a2 2 0 0 1-2 2h-1" />
          <path d="M3 10v7a2 2 0 0 0 2 2h1" />
          <path d="M21 10v3" />
          <path d="M21 14v1a2 2 0 0 1-2 2h-1" />
          <path d="M21 10a7 7 0 0 0-14 0v7a2 2 0 0 0 2 2h1" />
        </svg>
        <div style="position:absolute;top:8px;right:10px;width:16px;height:16px;border-radius:9999px;background:#D4598B;color:#fff;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;">
          1
        </div>
      </div>
    `;

    btn.onclick = () => {
      state.isOpen = !state.isOpen;
      renderPanel(root, state, config);
    };

    root.appendChild(btn);
    renderPanel(root, state, config);
  }

  function renderPanel(root: HTMLElement, state: { isOpen: boolean }, config: any) {
    let panel = root.querySelector("#tandem-panel") as HTMLElement | null;

    if (!state.isOpen) {
      if (panel && panel.parentElement) {
        panel.parentElement.removeChild(panel);
      }
      return;
    }

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "tandem-panel";
      Object.assign(panel.style, {
        position: "fixed",
        right: "24px",
        bottom: "24px",
        width: "400px",
        height: "650px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        boxShadow: "0 8px 20px rgba(61, 40, 23, 0.18)",
        backgroundColor: "#F5EFE7",
        overflow: "hidden",
        zIndex: "2147483001",
      } as CSSStyleDeclaration);
    }

    panel.innerHTML = `
      <div style="width:100%;padding:14px 16px;background:#5C2E4A;color:#fff;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;">
        <span style="font-family:'Lilita One', system-ui;font-size:18px;">${(config?.theme?.branding?.chatTitle) || "Chat with us"}</span>
        <button type="button" aria-label="Close chat" style="background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer;">×</button>
      </div>
      <div style="flex:1;padding:16px;overflow-y:auto;font-family:'Inter', system-ui;font-size:14px;line-height:1.5;">
        <p style="margin:0 0 12px 0;color:#5C2E4A;">Welcome to ${(config?.theme?.branding?.brandName) || "our tasting room"}! This is a demo embed.</p>
      </div>
    `;

    const closeBtn = panel.querySelector("button[aria-label='Close chat']") as HTMLButtonElement | null;
    if (closeBtn) {
      closeBtn.onclick = () => {
        state.isOpen = false;
        renderPanel(root, state, config);
      };
    }

    if (!panel.parentElement) {
      root.appendChild(panel);
    }
  }
}

// Expose global API for script snippet usage
(function attachGlobal() {
  if (typeof window === "undefined") return;
  const anyWin = window as any;
  anyWin.TandemEmbed = anyWin.TandemEmbed || {};
  anyWin.TandemEmbed.init = (options: TandemEmbedOptions) => mountShadowWidget(options);
})();
