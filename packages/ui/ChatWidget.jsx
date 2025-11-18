import React, { useState, useRef, useEffect } from "react";

export default function ChatWidget({ restaurantId } = {}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const msgsRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(1); // start at 1 to show the badge on first load

  // Prefer the explicit NEXT_PUBLIC_API_URL env var, fall back to NEXT_PUBLIC_API_BASE for backwards compatibility
  const _envUrl = typeof window !== "undefined" && (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE)
    ? (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE).replace(/\/$/, "")
    : "";
  const API_BASE = _envUrl;

  const COLORS = {
    nearshore: "#0E5A81",
    beach: "#FFB801",
    delmarva: "#78A5CF",
    oc: "#F3E1CE",
    bay: "#7AC1CD",
    inlet: "#344A55",
  };

  // Replace em dashes and double dashes with a colon per project rule
  function replaceEmDashes(s) {
    return s ? s.replace(/—|--/g, ':') : s;
  }

  function escapeHtml(unsafe) {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Lightweight markdown -> safe HTML renderer supporting bold, italics, lists, and line breaks
  function renderMarkdownToHtml(input) {
    if (!input && input !== 0) return '';
    let s = String(input);
    s = replaceEmDashes(s);

    // Collapse duplicate blank lines
    s = s.replace(/\n{3,}/g, '\n\n');

    // Escape HTML first
    s = escapeHtml(s);

    // Bold **text**
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic *text* (avoid interfering with bold)
    s = s.replace(/\*(?!\*)([^*]+?)\*(?!\*)/g, '<em>$1</em>');

    const lines = s.split(/\r?\n/);
    let out = '';
    let inUl = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^[-*•]\s+/.test(line)) {
        if (inOl) { out += '</ol>'; inOl = false; }
        if (!inUl) { out += '<ul>'; inUl = true; }
        const item = line.replace(/^[-*•]\s+/, '');
        out += `<li>${item}</li>`;
      } else if (/^\d+\.\s+/.test(line)) {
        if (inUl) { out += '</ul>'; inUl = false; }
        if (!inOl) { out += '<ol>'; inOl = true; }
        const item = line.replace(/^\d+\.\s+/, '');
        out += `<li>${item}</li>`;
      } else if (line === '') {
        if (inUl) { out += '</ul>'; inUl = false; }
        if (inOl) { out += '</ol>'; inOl = false; }
        out += '<br/>';
      } else {
        if (inUl) { out += '</ul>'; inUl = false; }
        if (inOl) { out += '</ol>'; inOl = false; }
        out += `<p>${line}</p>`;
      }
    }

    if (inUl) out += '</ul>';
    if (inOl) out += '</ol>';

    return out;
  }


  const scrollToBottom = () => {
    // If the element exists, update scroll position.
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const send = async (text) => {
    const content = typeof text === "string" ? text : input;
    if (!content) return;

    const msg = { role: "user", text: content, time: new Date().toISOString() };
    setMessages((m) => [...m, msg]);
    setInput("");
    setTyping(true);

    try {
      // Always send chat requests to the backend's /api/chat endpoint.
      // Prefer NEXT_PUBLIC_API_BASE when provided; otherwise send same-origin `/chat`.
      const url = API_BASE ? `${API_BASE}/api/chat` : "/chat";
      const payload = { message: content };
      // restaurantId may be a slug or a uuid; send slug as `restaurant_slug` and uuid as `restaurant_id`.
      function isUUID(v) {
        return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      }
      if (restaurantId) {
        if (isUUID(restaurantId)) payload.restaurant_id = restaurantId;
        else payload.restaurant_slug = restaurantId;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      const reply = {
        role: "assistant",
        text: json?.reply ?? "No reply",
        time: new Date().toISOString(),
      };

      setMessages((m) => [...m, reply]);
      if (!open) setUnreadCount((n) => n + 1);
    } catch {
      const err = {
        role: "assistant",
        text: "Error sending message",
        time: new Date().toISOString(),
      };
      setMessages((m) => [...m, err]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const quickReplies = ["Show menu", "Make a reservation", "Hours", "Contact"];

  // Derived values used in JSX to avoid very long inline expressions
  const FONT_FAMILY =
    "Inter, system-ui, -apple-system, \"Segoe UI\", Roboto, 'Helvetica Neue', Arial";
  const avatarDisplay = open ? "none" : "block";
  const panelTransform = open ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)";

  const styles = {
    root: {
      position: "fixed",
      right: 20,
      bottom: 20,
      zIndex: 9999,
      fontFamily: FONT_FAMILY,
    },
    toggle: {
      padding: "8px 12px",
      borderRadius: 8,
      background: "#fff",
      border: "1px solid rgba(52,74,85,0.08)",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    },
    panel: {
      width: 360,
      maxHeight: 480,
      boxShadow: "0 12px 40px rgba(52,74,85,0.12)",
      borderRadius: 12,
      overflow: "hidden",
      background: `linear-gradient(180deg, ${COLORS.oc}, #ffffff)`,
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      transition: "transform 200ms ease, opacity 200ms ease",
    },
    header: {
      padding: 12,
      borderBottom: "1px solid rgba(52,74,85,0.06)",
      fontWeight: 700,
      background: `linear-gradient(90deg, ${COLORS.delmarva}, ${COLORS.nearshore})`,
      color: "#fff",
    },
    closeBtn: {
      position: "absolute",
      right: 10,
      top: 8,
      width: 28,
      height: 28,
      borderRadius: 8,
      background: "rgba(0,0,0,0.12)",
      border: "none",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: 16,
      lineHeight: "16px",
      fontWeight: 600,
    },
    messages: {
      padding: 12,
      height: 340,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    msgRow: { display: "flex", gap: 8, alignItems: "flex-end" },
    bubbleUser: {
      background: COLORS.delmarva,
      padding: 10,
      borderRadius: 14,
      maxWidth: "78%",
      alignSelf: "flex-end",
      color: COLORS.inlet,
    },
    bubbleAssistant: {
      background: "#fff",
      padding: 10,
      borderRadius: 14,
      maxWidth: "78%",
      alignSelf: "flex-start",
      border: "1px solid rgba(52,74,85,0.06)",
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      background: "#ddd",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      color: "#444",
    },
    inputRow: {
      padding: 10,
      borderTop: "1px solid rgba(52,74,85,0.06)",
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    input: {
      flex: 1,
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid rgba(120,165,207,0.2)",
    },
    sendBtn: {
      padding: "8px 12px",
      borderRadius: 8,
      background: COLORS.nearshore,
      color: "#fff",
      border: "none",
      cursor: "pointer",
    },
    quickRow: {
      display: "flex",
      gap: 8,
      padding: "0 12px 8px 12px",
      flexWrap: "wrap",
    },
    quickBtn: {
      padding: "6px 10px",
      borderRadius: 999,
      border: `1px solid ${COLORS.beach}`,
      background: "#fff",
      cursor: "pointer",
      fontSize: 13,
    },
  };

  return (
    <div style={styles.root}>
      {/* Avatar trigger */}
      <div
        style={{
          position: "fixed",
          right: 12,
          bottom: 12,
          zIndex: 998,
          display: avatarDisplay,
        }}
      >
        <div style={{ position: "relative", width: 80, height: 80 }}>
          <button
            onClick={() =>
              setOpen((v) => {
                const next = !v;
                if (next) setUnreadCount(0);
                return next;
              })
            }
            aria-label="Open chat"
            style={{ all: "unset", cursor: "pointer", display: "inline-block" }}
          >
            <img
              src="/tandem-widget.jpg"
              srcSet="/tandem-widget.jpg 1x"
              alt="Tandem"
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                boxShadow: "0 8px 30px rgba(10,20,30,0.12)",
                objectFit: "cover",
              }}
            />
          </button>

          {unreadCount > 0 && (
            <div
              role="status"
              aria-label={`${unreadCount} unread messages`}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                minWidth: 20,
                height: 20,
                padding: "0 6px",
                borderRadius: 10,
                background: COLORS.beach,
                color: "#002",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 6px 12px rgba(251,184,1,0.18)",
              }}
            >
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* Panel */}
      <div
        style={{
          ...styles.panel,
          transform: panelTransform,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div style={{ ...styles.header, position: "relative" }}>
          <span>Tandem Chat</span>
          <button
            aria-label="Minimize chat"
            onClick={() => setOpen(false)}
            style={styles.closeBtn}
          >
            —
          </button>
        </div>

        <div ref={msgsRef} style={styles.messages}>
          {messages.length === 0 && (
            <div style={{ color: "#667085" }}>
              Hello — ask about the menu, reservations, or hours.
            </div>
          )}

          {messages.map((m, i) => {
            const bubbleStyle =
              m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant;
            return (
              <div
                key={i}
                style={{
                  ...styles.msgRow,
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {m.role === "assistant" && (
                  <img
                    src="/tandem-widget.jpg"
                    alt="A"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      marginRight: 8,
                      objectFit: "cover",
                    }}
                  />
                )}
                <div style={bubbleStyle}>
                  {m.role === 'assistant' ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(String(m.text || '')) }}
                    />
                  ) : (
                    // user messages rendered as plain text
                    <div>{String(m.text)}</div>
                  )}
                </div>
                {m.role === "user" && <div style={styles.avatar}>U</div>}
              </div>
            );
          })}

          {typing && (
            <div style={{ fontStyle: "italic", color: "#667085" }}>
              Assistant is typing...
            </div>
          )}
        </div>

        <div style={styles.quickRow}>
          {quickReplies.map((q) => (
            <button key={q} onClick={() => send(q)} style={styles.quickBtn}>
              {q}
            </button>
          ))}
        </div>

        <div style={styles.inputRow}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            style={styles.input}
            rows={1}
          />
          <button onClick={() => send()} style={styles.sendBtn}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
