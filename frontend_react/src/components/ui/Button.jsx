import { C } from "../../styles/tokens";

export function BtnRed({ children, full, small, style: s, ...p }) {
  return (
    <button className="btn-hover" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      width: full ? "100%" : "auto", padding: small ? "8px 16px" : "12px 20px",
      background: `linear-gradient(135deg, ${C.red}, ${C.redDark})`,
      color: C.white, border: "none", borderRadius: 10,
      fontWeight: 700, fontSize: small ? 13 : 15, cursor: "pointer",
      boxShadow: `0 4px 12px ${C.red}44`,
      ...s,
    }} {...p}>{children}</button>
  );
}

export function BtnBlue({ children, full, small, ...p }) {
  return (
    <button className="btn-hover" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      width: full ? "100%" : "auto", padding: small ? "8px 16px" : "12px 20px",
      background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
      color: C.white, border: "none", borderRadius: 10,
      fontWeight: 700, fontSize: small ? 13 : 15, cursor: "pointer",
      boxShadow: `0 4px 12px ${C.blue}44`,
    }} {...p}>{children}</button>
  );
}

export function BtnGhost({ children, full, small, danger, style: s, ...p }) {
  return (
    <button className="btn-hover" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      width: full ? "100%" : "auto", padding: small ? "7px 14px" : "11px 18px",
      background: "transparent",
      color: danger ? C.red : C.gray600,
      border: `1.5px solid ${danger ? C.redLight : C.gray200}`,
      borderRadius: 10, fontWeight: 600, fontSize: small ? 13 : 14, cursor: "pointer",
      ...s,
    }} {...p}>{children}</button>
  );
}
