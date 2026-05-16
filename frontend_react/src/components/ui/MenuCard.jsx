import { C } from "../../styles/tokens";
import { BtnRed, BtnGhost } from "./Button";

export default function MenuCard({ m, role, onEdit, onDel, onCart }) {
  const isMerchant = role === "MERCHANT";
  const isPelanggan = role === "PELANGGAN";
  const inStock = Number(m.stok) > 0;

  return (
    <div className="card-hover" style={{ background: C.white, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.gray100}`, boxShadow: "0 2px 8px rgba(15,23,42,.06)" }}>
      <div style={{ height: 120, position: "relative", background: `linear-gradient(135deg, ${C.blueLight}, ${C.redLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
        {m.gambar && <img src={m.gambar.startsWith('http') ? m.gambar : `http://localhost:8000/storage/${m.gambar}`} alt={m.nama_menu} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />}
        {!m.gambar && "🍽️"}
        {!inStock && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ background: C.danger, color: C.white, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 50 }}>HABIS</span>
          </div>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900 }}>{m.nama_menu}</div>
          {m.kategori && <span style={{ fontSize: 10, background: C.blueLight, color: C.blueDark, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>{m.kategori}</span>}
        </div>
        <div style={{ fontSize: 12, color: C.gray400, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          {m.merchant?.user?.foto_profil && <img src={m.merchant.user.foto_profil} alt="" style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }} />}
          {m.merchant?.nama_merchant}
        </div>
        <div style={{ fontWeight: 800, fontSize: 17, color: C.red }}>Rp{Number(m.harga).toLocaleString("id-ID")}</div>
        <div style={{ fontSize: 12, marginTop: 3, color: inStock ? C.success : C.danger, fontWeight: 600 }}>Stok: {inStock ? m.stok : "Habis"}</div>
      </div>
      <div style={{ padding: "0 14px 14px", display: "flex", gap: 8 }}>
        {isMerchant && <>
          <BtnGhost small style={{ flex: 1 }} onClick={() => onEdit(m)}>✏️ Edit</BtnGhost>
          <BtnGhost small danger onClick={() => onDel(m.id)}>🗑️</BtnGhost>
        </>}
        {isPelanggan && inStock && <BtnRed small full onClick={() => onCart(m)}>+ Keranjang</BtnRed>}
      </div>
    </div>
  );
}
