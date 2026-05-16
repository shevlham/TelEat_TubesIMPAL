import { C } from "../../styles/tokens";

export const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: `1.5px solid ${C.gray200}`, background: C.white,
  fontSize: 14, color: C.gray900, transition: "border .2s",
};

export const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 700, color: C.gray600,
  marginBottom: 6, textTransform: "uppercase", letterSpacing: .5,
};

export default function Input({ label, style: extraStyle, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input style={{ ...inputStyle, ...extraStyle }} {...props} />
    </div>
  );
}
