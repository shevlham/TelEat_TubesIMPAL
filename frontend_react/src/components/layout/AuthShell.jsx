import { C } from "../../styles/tokens";

export default function AuthShell({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", overflow: "hidden" }}>

      {/* LEFT: hero panel — 40% lebar layar, hanya tampil di desktop */}
      <div className="hide-mobile" style={{
        flex: "0 0 40%",
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${C.blueDark} 0%, ${C.blue} 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 52px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative glow */}
        <div style={{ position: "absolute", width: "70%", height: "70%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", top: "-20%", right: "-20%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)", bottom: "5%", left: "-10%", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Logo */}
          <div style={{ width: 96, height: 96, borderRadius: 20, overflow: "hidden", marginBottom: 36, boxShadow: "0 16px 36px rgba(0,0,0,0.25)" }}>
            <img src="/logo.png" alt="TelEat Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3vw, 40px)", color: C.white, lineHeight: 1.2, marginBottom: 18 }}>
            Pesan makanan<br />favoritmu,<br /><span style={{ color: C.redLight }}>kapan saja.</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,.7)", fontSize: "clamp(14px, 1.2vw, 16px)", lineHeight: 1.7, marginBottom: 40 }}>
            Nikmati kemudahan memesan di kantin Telkom&nbsp;— tanpa antre, langsung dari HP-mu.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "🚀", text: "Pesan cepat & mudah" },
              { icon: "🏪", text: "Tanpa antre panjang" },
              { icon: "💳", text: "QRIS, Cash, Transfer" },
            ].map(f => (
              <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, background: "rgba(255,255,255,.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                <span style={{ color: "rgba(255,255,255,.88)", fontSize: 14, fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: form panel — mengisi sisa layar */}
      <div style={{
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: C.white,
        overflowY: "auto",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp .32s ease" }}>

          {/* Mobile-only logo */}
          <div className="hide-desktop" style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ width: 88, height: 88, borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 24px rgba(0,0,0,0.12)" }}>
              <img src="/logo.png" alt="TelEat Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>

          {children}
        </div>
      </div>

    </div>
  );
}
