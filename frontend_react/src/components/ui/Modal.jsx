import { useEffect } from "react";
import { C } from "../../styles/tokens";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div 
      style={{ 
          position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", 
          backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", 
          display: "flex", alignItems: "center", justifyContent: "center", 
          zIndex: 500, padding: 16 
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ 
          background: C.white, borderRadius: 20, padding: "28px 28px 24px", 
          width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", 
          boxShadow: "0 32px 80px rgba(15,23,42,.24)", animation: "fadeUp .25s ease" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.gray900 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.gray400, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
