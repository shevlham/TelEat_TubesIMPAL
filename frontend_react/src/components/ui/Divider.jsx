import { C } from "../../styles/tokens";

export default function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: C.gray400, fontSize: 13 }}>
      <div style={{ flex: 1, height: 1, background: C.gray100 }} />
      <span style={{ fontWeight: 600 }}>atau</span>
      <div style={{ flex: 1, height: 1, background: C.gray100 }} />
    </div>
  );
}
