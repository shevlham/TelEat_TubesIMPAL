import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/tokens";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { apiFetch } from "../services/api";
import Spinner from "../components/ui/Spinner";
import Empty from "../components/ui/Empty";
import { BtnRed, BtnBlue, BtnGhost } from "../components/ui/Button";

const STATUS_CFG = {
  PENDING: { color: C.warn, bg: "#FEF3C7" },
  DIPROSES: { color: C.blue, bg: C.blueLight },
  SELESAI: { color: C.success, bg: "#DCFCE7" },
  BATAL: { color: C.red, bg: C.redLight },
};

export default function OrderPage() {
  const { user, token } = useAuth();
  const toast = useToast();
  const isMerchant = user?.role === "MERCHANT";

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("SEMUA");

  const load = useCallback(async () => {
    setLoading(true);
    try { 
        const r = await apiFetch("GET", "/pesanans", null, token); 
        setList(r.data); 
    } catch (e) { 
        toast(e.message, "error"); 
    } finally { 
        setLoading(false); 
    }
  }, [token, toast]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try { 
        await apiFetch("PUT", `/pesanans/${id}/status`, { status }, token); 
        toast(`Status → ${status}`); 
        load(); 
    } catch (e) { 
        toast(e.message, "error"); 
    }
  };

  const shown = filter === "SEMUA" ? list : list.filter(p => p.status === filter);

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.gray900 }}>📋 Pesanan</h2>
        <BtnGhost small onClick={load}>↻ Refresh</BtnGhost>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["SEMUA", "PENDING", "DIPROSES", "SELESAI", "BATAL"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
            background: filter === f ? C.red : C.gray100, color: filter === f ? C.white : C.gray600, transition: "all .15s",
          }}>{f}</button>
        ))}
      </div>

      {loading ? <Spinner /> : shown.length === 0
        ? <Empty icon="📋" title="Belum ada pesanan" sub="Pesanan akan muncul di sini" />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shown.map(p => {
              const sc = STATUS_CFG[p.status] || { color: C.gray400, bg: C.gray100 };
              return (
                <div key={p.id} style={{ background: C.white, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.gray100}`, boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <span style={{ fontWeight: 800, color: C.red, fontSize: 16 }}>#{p.id}</span>
                      <div style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>{p.pelanggan?.nama} → {p.merchant?.nama_merchant}</div>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg }}>{p.status}</span>
                  </div>

                  <div style={{ borderTop: `1px solid ${C.gray100}`, paddingTop: 10, marginBottom: 12 }}>
                    {p.details?.map(d => (
                      <div key={d.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.gray600, padding: "3px 0" }}>
                        <span>{d.menu?.nama_menu} ×{d.jumlah}</span>
                        <span style={{ fontWeight: 600 }}>Rp{Number(d.subtotal).toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>

                  {p.transaksi && (
                    <div style={{ background: C.gray50, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, fontSize: 13 }}>
                      <span style={{ color: C.gray600 }}>Total: <strong style={{ color: C.red }}>Rp{Number(p.transaksi.total_bayar).toLocaleString("id-ID")}</strong></span>
                      <span style={{ color: C.gray600 }}>{p.transaksi.metode_bayar} · <strong style={{ color: p.transaksi.status_bayar === "LUNAS" ? C.success : C.warn }}>{p.transaksi.status_bayar}</strong></span>
                    </div>
                  )}

                  {isMerchant && (
                    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {p.status === "PENDING" && <>
                        <BtnBlue small onClick={() => updateStatus(p.id, "DIPROSES")}>▶ Proses</BtnBlue>
                        <BtnRed small onClick={() => updateStatus(p.id, "SELESAI")}>✅ Selesai</BtnRed>
                        <BtnGhost small danger onClick={() => updateStatus(p.id, "BATAL")}>✕ Batal</BtnGhost>
                      </>}
                      {p.status === "DIPROSES" && <BtnRed small onClick={() => updateStatus(p.id, "SELESAI")}>✅ Selesai</BtnRed>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
