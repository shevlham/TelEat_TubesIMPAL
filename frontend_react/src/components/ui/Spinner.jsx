import { C } from "../../styles/tokens";

export default function Spinner({ size = 32 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <div style={{ 
          width: size, 
          height: size, 
          border: `3px solid ${C.gray100}`, 
          borderTopColor: C.red, 
          borderRadius: "50%", 
          animation: "spin .65s linear infinite" 
      }} />
    </div>
  );
}
