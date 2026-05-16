import { createContext, useContext, useState, useCallback } from "react";
import { C } from "../styles/tokens";

const ToastCtx = createContext(null);

export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  
  const push = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setList(p => [...p, { id, msg, type }]);
    setTimeout(() => setList(p => p.filter(t => t.id !== id)), 3800);
  }, []);

  const bgMap = { success: C.success, error: C.danger, warn: C.warn };
  const iconMap = { success: "✓", error: "✕", warn: "⚠" };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
        {list.map(t => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: bgMap[t.type] || C.success,
            color: C.white, padding: "12px 18px", borderRadius: 12,
            fontSize: 14, fontWeight: 600,
            boxShadow: `0 8px 24px ${(bgMap[t.type] || C.success)}55`,
            animation: "slideRight .3s ease",
          }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{iconMap[t.type]}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
