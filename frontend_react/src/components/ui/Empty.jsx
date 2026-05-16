import { C } from "../../styles/tokens";

export default function Empty({ icon = "🍽️", title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px", color: C.gray400 }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.gray600, marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13 }}>{sub}</div>}
    </div>
  );
}
