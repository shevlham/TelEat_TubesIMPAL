import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/tokens";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { apiFetch } from "../services/api";
import Spinner from "../components/ui/Spinner";
import { BtnRed, BtnGhost } from "../components/ui/Button";

const ROLE_CLR = { 
  ADMIN: { c: C.red, bg: C.redLight }, 
  MERCHANT: { c: C.blue, bg: C.blueLight }, 
  PELANGGAN: { c: C.success, bg: "#DCFCE7" } 
};

export default function AdminPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([
        apiFetch("GET", "/admin/users", null, token),
        apiFetch("GET", "/admin/dashboard", null, token),
      ]);
      setUsers(u.data); 
      setStats(s.data);
    } catch (e) { 
        toast(e.message, "error"); 
    } finally { 
        setLoading(false); 
    }
  }, [token, toast]);

  useEffect(() => { load(); }, [load]);

  const delUser = async id => {
    if (!window.confirm("Hapus user ini?")) return;
    try { 
        await apiFetch("DELETE", `/admin/users/${id}`, null, token); 
        toast("User dihapus"); 
        load(); 
    } catch (e) { 
        toast(e.message, "error"); 
    }
  };

  const lunasTransaksi = async id => {
    if (!window.confirm("Verifikasi pembayaran LUNAS?")) return;
    try { 
        await apiFetch("PUT", `/admin/transaksi/${id}/lunas`, null, token); 
        toast("Pembayaran berhasil dikonfirmasi! ✅"); 
        load(); 
    } catch (e) { 
        toast(e.message, "error"); 
    }
  };

  const statCards = stats ? [
    { label: "Total User", val: stats.total_user, icon: "👥", border: C.blue },
    { label: "Total Pesanan", val: stats.total_pesanan, icon: "📋", border: C.red },
    { label: "Pesanan Pending", val: stats.pesanan_pending, icon: "⏳", border: C.warn },
    { label: "Pendapatan Valid (Lunas)", val: `Rp${Number(stats.total_transaksi || 0).toLocaleString("id-ID")}`, icon: "💰", border: C.success },
  ] : [];

  return (
    <div className="page-enter">
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.gray900, marginBottom: 20 }}>⚙️ Dashboard Kantin Pusat (Admin)</h2>

      {loading ? <Spinner /> : <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 28 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: C.white, borderRadius: 16, padding: "20px", border: `1px solid ${C.gray100}`, borderLeft: `4px solid ${s.border}`, boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: s.border }}>{s.val}</div>
              <div style={{ fontSize: 12, color: C.gray400, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabel Pembayaran Masuk */}
        <h3 style={{ fontSize: 16, fontWeight: 800, color: C.gray900, marginBottom: 14 }}>💳 Pembayaran Masuk</h3>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.gray100}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)", marginBottom: 28 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.gray50 }}>
                  {["Order ID", "Pelanggan", "Merchant", "Metode", "Total Bayar", "Status", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.transaksis && stats.transaksis.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: C.gray400, fontSize: 13 }}>Tidak ada data transaksi.</td></tr>
                ) : stats.transaksis?.map((t, i) => (
                  <tr key={t.transaksi_id} style={{ borderTop: `1px solid ${C.gray100}`, background: i % 2 === 0 ? C.white : C.gray50 }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray900, fontWeight: 800 }}>#{t.pesanan_id}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray600 }}>{t.pesanan?.pelanggan?.nama || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray600 }}>{t.pesanan?.merchant?.nama_merchant || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: C.gray600 }}>{t.metode_bayar}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.red, fontWeight: 700 }}>Rp{Number(t.total_bayar).toLocaleString("id-ID")}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: t.status_bayar === "LUNAS" ? C.success : C.warn, background: t.status_bayar === "LUNAS" ? "#DCFCE7" : "#FEF3C7" }}>
                        {t.status_bayar}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {t.status_bayar === "PENDING" && (
                        <BtnRed small onClick={() => lunasTransaksi(t.transaksi_id)}>✅ Lunas</BtnRed>
                      )}
                      {t.status_bayar === "LUNAS" && (
                        <span style={{ fontSize: 12, color: C.gray400 }}>Terkonfirmasi</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 800, color: C.gray900, marginBottom: 14 }}>👥 Semua User</h3>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.gray100}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.gray50 }}>
                  {["ID", "Username", "Role", "Nama", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rc = ROLE_CLR[u.role] || { c: C.gray600, bg: C.gray100 };
                  return (
                    <tr key={u.id} style={{ borderTop: `1px solid ${C.gray100}`, background: i % 2 === 0 ? C.white : C.gray50 }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray600, fontWeight: 600 }}>{u.id}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray900, fontWeight: 600 }}>{u.username}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: rc.c, background: rc.bg }}>{u.role}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray900 }}>{u.nama}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <BtnGhost small danger onClick={() => delUser(u.id)}>🗑️ Hapus</BtnGhost>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>}
    </div>
  );
}
