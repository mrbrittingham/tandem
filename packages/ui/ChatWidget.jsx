import React, { useState, useRef, useEffect } from "react";
import TypingIndicator from "./TypingIndicator";

export default function ChatWidget({ restaurantId } = {}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem("tandem_sound_enabled") !== "false";
    } catch (e) {
      return true;
    }
  });
  const [showMenu, setShowMenu] = useState(false);
  // Track whether we've already expanded after the user's first interaction
  const expandedOnceRef = useRef(false);
  // Keep a set of prior detailed assistant replies to avoid near-duplicates
  const priorAssistantRepliesRef = useRef(new Set());
  const msgsRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(1); // start at 1 to show the badge on first load

  // Prefer the explicit NEXT_PUBLIC_API_URL env var, fall back to NEXT_PUBLIC_API_BASE for backwards compatibility
  const _envUrl =
    typeof window !== "undefined" &&
    (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE)
      ? (
          process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE
        ).replace(/\/$/, "")
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
  const replaceEmDashes = (s) => (s ? s.replace(/—|--/g, ":") : s);

  const escapeHtml = (unsafe) =>
    String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // Lightweight markdown -> safe HTML renderer supporting bold, italics, lists, and line breaks
  const renderMarkdownToHtml = (input) => {
    if (!input && input !== 0) return "";
    let s = String(input);
    s = replaceEmDashes(s);

    // Collapse duplicate blank lines
    s = s.replace(/\n{3,}/g, "\n\n");

    // Escape HTML first
    s = escapeHtml(s);

    // Bold **text**
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Italic *text* (avoid interfering with bold)
    s = s.replace(/\*(?!\*)([^*]+?)\*(?!\*)/g, "<em>$1</em>");

    const lines = s.split(/\r?\n/);
    let out = "";
    let inUl = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^[-*•]\s+/.test(line)) {
        if (inOl) {
          out += "</ol>";
          inOl = false;
        }
        if (!inUl) {
          out += "<ul>";
          inUl = true;
        }
        const item = line.replace(/^[-*•]\s+/, "");
        out += `<li>${item}</li>`;
      } else if (/^\d+\.\s+/.test(line)) {
        if (inUl) {
          out += "</ul>";
          inUl = false;
        }
        if (!inOl) {
          out += "<ol>";
          inOl = true;
        }
        const item = line.replace(/^\d+\.\s+/, "");
        out += `<li>${item}</li>`;
      } else if (line === "") {
        if (inUl) {
          out += "</ul>";
          inUl = false;
        }
        if (inOl) {
          out += "</ol>";
          inOl = false;
        }
        out += "<br/>";
      } else {
        if (inUl) {
          out += "</ul>";
          inUl = false;
        }
        if (inOl) {
          out += "</ol>";
          inOl = false;
        }
        out += `<p>${line}</p>`;
      }
    }

    if (inUl) out += "</ul>";
    if (inOl) out += "</ol>";

    return out;
  };

  const scrollToBottom = () => {
    // If the element exists, update scroll position.
    if (msgsRef.current)
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Play a short beep using WebAudio for cues (no external assets)
  const playBeep = (opts = {}) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = opts.type || "sine";
      o.frequency.value = opts.freq || 880;
      g.gain.value = opts.volume ?? 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        try {
          ctx.close();
        } catch (e) {}
      }, opts.duration || 120);
    } catch (e) {
      // ignore audio errors
    }
  };

  // Remove auto-expand-by-content; instead expand only once after the user's first interaction

  const send = async (text) => {
    const content = typeof text === "string" ? text : input;
    if (!content) return;

    const msg = { role: "user", text: content, time: new Date().toISOString() };
    setMessages((m) => [...m, msg]);
    setInput("");
    setTyping(true);

    // Expand the chat smoothly after the user's FIRST interaction only
    try {
      if (!expandedOnceRef.current) {
        // small timeout so the user's message renders before expansion animation
        setTimeout(() => {
          setExpanded(true);
          expandedOnceRef.current = true;
          // play expansion cue
          playBeep({ freq: 520, duration: 180, volume: 0.04 });
        }, 220);
      }
    } catch (e) {}

    try {
      // Always send chat requests to the backend's /api/chat endpoint.
      // Prefer NEXT_PUBLIC_API_BASE when provided; otherwise send same-origin `/chat`.
      const url = API_BASE ? `${API_BASE}/api/chat` : "/chat";
      const payload = { message: content };
      // restaurantId may be a slug or a uuid; send slug as `restaurant_slug` and uuid as `restaurant_id`.
      const isUUID = (v) =>
        typeof v === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
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
      let assistantText = String(json?.reply ?? "No reply");

      // Check if user explicitly asked for full menu / equivalent
      const lastUser = content.toLowerCase();
      const explicitMenuRequest = /\b(full menu|show full menu|show menu|display menu|full list of|entire menu)\b/i.test(lastUser);

      // Detect if assistant is attempting to dump a menu or long list
      const isMenuLike = /Appetizers|Entrees|Dessert|Wine list|Menu|Small Plates|Mains|Sides|Drinks|Ingredients/i.test(assistantText) || (assistantText.split(/\r?\n/).filter(Boolean).length >= 6);

      // If menu-like and user did NOT explicitly request it, suppress the full dump and offer a prompt/button
      let messageObj = { role: "assistant", text: assistantText, time: new Date().toISOString(), meta: {} };
      if (isMenuLike && !explicitMenuRequest) {
        // store the full menu in meta for later reveal
        messageObj.meta.fullMenu = assistantText;
        messageObj.text = "I can show the full menu if you'd like — would you like to see the full menu?";
        messageObj.meta.offerShowFullMenu = true;
      }

      // Reservation suggestion normalization: if assistant mentions reservations, standardize the message and attach button
      const suggestsReservation = /reserv|book|reservation|reserve|reservations page/i.test(assistantText);
      if (suggestsReservation) {
        messageObj.text = "You can visit our reservations page to book your next visit. Just click the button below.";
        messageObj.meta.showReservationButton = true;
      }

      // Redundancy check: avoid repeating detailed messages
      const normalize = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();
      const normalized = normalize(messageObj.text);
      const prior = priorAssistantRepliesRef.current;
      const userAskedRepeat = /repeat|again|say that|repeat that|restate/i.test(lastUser);
      if (!userAskedRepeat) {
        for (let prev of prior) {
          if (!prev) continue;
          // If new message is identical or contained in previous or vice versa, treat as duplicate
          if (prev === normalized || prev.includes(normalized) || normalized.includes(prev)) {
            // skip adding duplicate; instead show a brief acknowledgement
            messageObj.text = "I already shared that — would you like more details or a different summary?";
            messageObj.meta.isDuplicateNotice = true;
            break;
          }
        }
      }

      // If message contains substantial content and isn't just a duplicate notice, remember it for future dedup checks
      if (!messageObj.meta.isDuplicateNotice) prior.add(normalized);

      setMessages((m) => {
        // play receipt cue when assistant reply arrives
        try {
          playBeep({ freq: 880, duration: 100, volume: 0.04 });
        } catch (e) {}
        return [...m, messageObj];
      });
      if (!open) setUnreadCount((n) => n + 1);
    } catch {
      const err = { role: "assistant", text: "Error sending message", time: new Date().toISOString() };
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
  const panelTransform = open
    ? "translateY(0) scale(1)"
    : "translateY(8px) scale(0.98)";

  const panelWidth = 414; // ~15% wider than previous 360
  const basePanelHeight = 480; // previous starting height
  const expandedPanelHeight = Math.min(basePanelHeight * 1.5, typeof window !== "undefined" ? Math.round(window.innerHeight * 0.9) : 720);
  const panelMaxHeight = typeof window !== "undefined" && expanded ? expandedPanelHeight : basePanelHeight;

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
      width: panelWidth,
      maxHeight: panelMaxHeight,
      boxShadow: "0 12px 40px rgba(52,74,85,0.12)",
      borderRadius: 12,
      overflow: "hidden",
      background: `linear-gradient(180deg, ${COLORS.oc}, #ffffff)`,
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      transition: "transform 300ms cubic-bezier(.2,.9,.2,1), opacity 200ms ease, max-height 420ms cubic-bezier(.2,.9,.2,1), width 220ms",
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
      display: expanded ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: 16,
      lineHeight: "16px",
      fontWeight: 600,
    },
    messages: {
      padding: 12,
      flex: "1 1 auto",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      // Reserve space for typing indicator overlay so it does not push content
      position: "relative",
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
      wordBreak: "break-word",
      overflowWrap: "anywhere",
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
    footer: {
      padding: 8,
      textAlign: "center",
      fontSize: 11,
      color: "#fff",
      background: `linear-gradient(90deg, ${COLORS.nearshore}, ${COLORS.delmarva})`,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    hero: {
      height: 110,
      background: `linear-gradient(90deg, ${COLORS.bay}, ${COLORS.nearshore})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: 18,
    },
    menuButton: {
      position: "absolute",
      left: 10,
      top: 8,
      width: 28,
      height: 28,
      borderRadius: 8,
      background: "rgba(255,255,255,0.12)",
      border: "none",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    menuPanel: {
      position: "absolute",
      left: 10,
      top: 44,
      background: "#fff",
      color: "#111",
      borderRadius: 8,
      boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
      padding: 8,
      minWidth: 180,
      zIndex: 20,
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
          <button
            aria-label="Menu"
            onClick={() => setShowMenu((s) => !s)}
            style={styles.menuButton}
          >
            ⚙
          </button>
          {showMenu && (
            <div style={styles.menuPanel} role="menu">
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!soundEnabled}
                  onChange={(e) => {
                    const on = !!e.target.checked;
                    setSoundEnabled(on);
                    try {
                      localStorage.setItem("tandem_sound_enabled", on ? "true" : "false");
                    } catch (e) {}
                  }}
                />
                Sound cues
              </label>
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    // toggle panel expansion manually
                    setExpanded((v) => !v);
                    playBeep({ freq: 520, duration: 140, volume: 0.04 });
                  }}
                >
                  Toggle expand
                </button>
              </div>
            </div>
          )}
          <span>Windmill Creek Chat</span>
          <button
            aria-label="Minimize chat"
            onClick={() => {
              setOpen(false);
              setExpanded(false);
            }}
            style={styles.closeBtn}
          >
            ✕
          </button>
        </div>

        {/* Hero image placeholder */}
        <div style={styles.hero}>WINDMILL CREEK — [hero image placeholder]</div>

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
                  {m.role === "assistant" ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdownToHtml(String(m.text || "")),
                      }}
                    />
                  ) : (
                    // user messages rendered as plain text
                    <div>{String(m.text)}</div>
                  )}
                </div>
                  {/* Assistant-level action buttons (reservation / show full menu) */}
                  {m.role === "assistant" && m.meta && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                      {m.meta.showReservationButton && (
                        <a
                          href="https://windmillcreekvineyard.com/mariner-house-dining-reservations-2/"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-block",
                            padding: "8px 14px",
                            borderRadius: 999,
                            background: COLORS.nearshore,
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: 700,
                          }}
                        >
                          Book A Reservation
                        </a>
                      )}

                      {m.meta.offerShowFullMenu && (
                        <button
                          onClick={() => {
                            // Replace the offer message with the full menu stored in meta
                            setMessages((cur) =>
                              cur.map((cm) => {
                                if (cm === m) {
                                  return { ...cm, text: cm.meta.fullMenu, meta: { ...cm.meta, offerShowFullMenu: false } };
                                }
                                return cm;
                              })
                            );
                          }}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 999,
                            background: "#fff",
                            border: `1px solid ${COLORS.nearshore}`,
                            cursor: "pointer",
                          }}
                        >
                          Show Full Menu
                        </button>
                      )}
                    </div>
                  )}
                {m.role === "user" && <div style={styles.avatar}>U</div>}
              </div>
            );
          })}

          {/* Typing indicator reserved overlay (does not alter flow) */}
          <div style={{ height: 44 }} />
        </div>

        {/* Typing indicator overlay */}
        {typing && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 84, pointerEvents: "none", display: open ? "block" : "none" }}>
            <TypingIndicator />
          </div>
        )}

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
        <div style={styles.footer}>POWERED BY TANDEM</div>
      </div>
    </div>
  );
}
