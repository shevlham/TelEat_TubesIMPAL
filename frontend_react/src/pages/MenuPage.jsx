import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/tokens";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { apiFetch, API_URL } from "../services/api";
import Spinner from "../components/ui/Spinner";
import Empty from "../components/ui/Empty";
import Modal from "../components/ui/Modal";
import Inp, { inputStyle, labelStyle } from "../components/ui/Input";
import Sel from "../components/ui/Select";
import { BtnRed, BtnGhost } from "../components/ui/Button";
import MenuCard from "../components/ui/MenuCard";

const qtyBtnStyle = {
  width: 28, height: 28, border: `1px solid ${C.gray200}`, borderRadius: 7,
  background: C.gray50, cursor: "pointer", fontSize: 14, fontWeight: 700,
  display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.gray800,
};

export default function MenuPage() {
  const { user, token } = useAuth();
  const toast = useToast();
  const role = user?.role;
  const isMerchant = role === "MERCHANT";
  const isPelanggan = role === "PELANGGAN";

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterToko, setFilterToko] = useState("Semua");
  const [cart, setCart] = useState([]);
  const [menuModal, setMenuModal] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [form, setForm] = useState({ nama_menu: "", harga: "", stok: "", kategori: "Lainnya" });
  const [editId, setEditId] = useState(null);
  const [metode, setMetode] = useState("CASH");
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentOrders, setPaymentOrders] = useState([]);
  const [bankTransfer, setBankTransfer] = useState("BCA");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch("GET", "/menus");
      setMenus(r.data);
    }
    catch (e) {
      toast(e.message, "error");
    }
    finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const displayed = menus
    .filter(m => isMerchant ? m.merchant_id === user.profile?.id : true)
    .filter(m => m.nama_menu?.toLowerCase().includes(search.toLowerCase()))
    .filter(m => filterKategori === "Semua" || m.kategori === filterKategori)
    .filter(m => filterToko === "Semua" || m.merchant_id === filterToko);

  const saveMenu = async e => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("nama_menu", form.nama_menu);
      fd.append("harga", form.harga);
      fd.append("stok", form.stok);
      fd.append("kategori", form.kategori);

      if (form.gambar) {
        fd.append("gambar", form.gambar);
      }

      if (editId) {
        fd.append("_method", "PUT");
      }

      const res = await apiFetch("POST", (editId ? `/menus/${editId}` : "/menus"), fd, token);

      toast(editId ? "Menu diperbarui!" : "Menu ditambahkan! 🎉");
      setMenuModal(false);
      load();

    } catch (er) {
      toast(er.message, "error");
    }
  };

  const delMenu = async id => {
    if (!window.confirm("Hapus menu ini?")) return;
    try { 
        await apiFetch("DELETE", `/menus/${id}`, null, token); 
        toast("Menu dihapus"); 
        load(); 
    } catch (er) { 
        toast(er.message, "error"); 
    }
  };

  const addCart = (m) => {
    const stokTersedia = Number(m.stok);
    const existingItem = cart.find(c => c.id === m.id);
    const currentQty = existingItem ? existingItem.qty : 0;

    if (currentQty >= stokTersedia) {
      toast(`Stok ${m.nama_menu} hanya tersisa ${stokTersedia}!`, "warn");
      return;
    }

    setCart(p => {
      const ex = p.find(c => c.id === m.id);
      if (ex) {
        return p.map(c => c.id === m.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...p, { ...m, qty: 1 }];
    });
    toast(`${m.nama_menu} ditambahkan 🛒`);
  };

  const changeQty = (id, delta) => {
    setCart(p => p.map(c => {
      if (c.id !== id) return c;
      const newQty = c.qty + delta;
      const stokTersedia = Number(c.stok);
      if (delta > 0 && newQty > stokTersedia) {
        toast(`Stok ${c.nama_menu} hanya ${stokTersedia}`, "warn");
        return c;
      }
      if (newQty < 1) return c;
      return { ...c, qty: newQty };
    }));
  };

  const removeItem = id => setCart(p => p.filter(c => c.id !== id));
  const totalCart = cart.reduce((s, c) => s + Number(c.harga) * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const submitOrder = async () => {
    if (!cart.length) return;
    try {
      const byMerchant = {};
      cart.forEach(c => {
        if (!byMerchant[c.merchant_id]) byMerchant[c.merchant_id] = [];
        byMerchant[c.merchant_id].push(c);
      });

      const orders = [];
      for (const mId in byMerchant) {
        const res = await apiFetch("POST", "/pesanans", {
          merchant_id: mId,
          metode_bayar: metode,
          items: byMerchant[mId].map(c => ({ menu_id: c.id, jumlah: c.qty }))
        }, token);
        orders.push(res.data);
      }
      toast("Pesanan berhasil dibuat! 🎉");
      setCart([]); 
      setOrderModal(false);
      setPaymentOrders(orders);
      setPaymentModal(true);
    } catch (er) { 
        toast(er.message, "error"); 
    }
  };

  return (
    <>
      <div className="page-enter" style={{ paddingBottom: "90px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.gray900 }}>Daftar Menu</h2>
            <p style={{ color: C.gray400, fontSize: 13, marginTop: 2 }}>{displayed.length} menu tersedia</p>
          </div>
          {isMerchant && (
            <BtnRed small onClick={() => { 
                setEditId(null); 
                setForm({ nama_menu: "", harga: "", stok: "", kategori: "Lainnya" }); 
                setMenuModal(true); 
            }}>
                + Tambah Menu
            </BtnRed>
          )}
        </div>

        {isPelanggan && (
          <div style={{ marginBottom: 24 }}>
            {/* Rekomendasi — infinite auto-scroll */}
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Rekomendasi Menu</h3>
            <div style={{ overflow: "hidden", margin: "0 -20px", paddingBottom: 16 }}>
              <style>{`
                @keyframes marquee {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .rekom-track {
                  display: flex;
                  width: max-content;
                  animation: marquee 55s linear infinite;
                  gap: 16px;
                  padding: 4px 20px 8px;
                }
                .rekom-track:hover {
                  animation-play-state: paused;
                }
              `}</style>
              <div className="rekom-track">
                {/* original set */}
                {menus.filter(m => m.stok > 0).slice(0, 8).map(m => (
                  <div key={`orig-${m.id}`}
                    onClick={() => { setFilterToko(m.merchant_id); setFilterKategori(m.kategori || "Lainnya"); setSearch(m.nama_menu); }}
                    className="card-hover"
                    style={{ minWidth: 200, maxWidth: 200, background: C.white, borderRadius: 16, cursor: "pointer", boxShadow: "0 6px 16px rgba(0,0,0,0.06)", overflow: "hidden", flexShrink: 0 }}>
                    {m.gambar
                      ? <img src={m.gambar.startsWith('http') ? m.gambar : `http://localhost:8000/storage/${m.gambar}`} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} alt={m.nama_menu} />
                      : <div style={{ width: "100%", height: 130, background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🍽️</div>
                    }
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.gray900 }}>{m.nama_menu}</div>
                      <div style={{ fontSize: 12, color: C.gray400, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11 }}>🏪</span> {m.merchant?.nama_merchant}
                      </div>
                    </div>
                  </div>
                ))}
                {/* clone set — for seamless loop */}
                {menus.filter(m => m.stok > 0).slice(0, 8).map(m => (
                  <div key={`clone-${m.id}`}
                    onClick={() => { setFilterToko(m.merchant_id); setFilterKategori(m.kategori || "Lainnya"); setSearch(m.nama_menu); }}
                    className="card-hover"
                    style={{ minWidth: 200, maxWidth: 200, background: C.white, borderRadius: 16, cursor: "pointer", boxShadow: "0 6px 16px rgba(0,0,0,0.06)", overflow: "hidden", flexShrink: 0 }}>
                    {m.gambar
                      ? <img src={m.gambar.startsWith('http') ? m.gambar : `http://localhost:8000/storage/${m.gambar}`} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} alt={m.nama_menu} />
                      : <div style={{ width: "100%", height: 130, background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🍽️</div>
                    }
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.gray900 }}>{m.nama_menu}</div>
                      <div style={{ fontSize: 12, color: C.gray400, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11 }}>🏪</span> {m.merchant?.nama_merchant}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Toko */}
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, marginTop: 12 }}>Pilih Toko</h3>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12, margin: "0 -20px", padding: "0 20px 12px" }}>
              <div onClick={() => setFilterToko("Semua")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 8px", borderRadius: 16, background: filterToko === "Semua" ? C.blueLight : C.white, border: `1px solid ${filterToko === "Semua" ? C.blue : C.gray100}`, cursor: "pointer", minWidth: 76, transition: "all .2s" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: filterToko === "Semua" ? C.blue : C.gray50, color: filterToko === "Semua" ? C.white : C.gray400, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌐</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: filterToko === "Semua" ? C.blueDark : C.gray600, textAlign: "center", width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Semua</span>
              </div>
              {Array.from(new Map(menus.map(m => [m.merchant_id, m.merchant])).values()).filter(Boolean).map(merch => (
                <div key={merch.id} onClick={() => setFilterToko(merch.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 8px", borderRadius: 16, background: filterToko === merch.id ? C.blueLight : C.white, border: `1px solid ${filterToko === merch.id ? C.blue : C.gray100}`, cursor: "pointer", minWidth: 76, maxWidth: 84, transition: "all .2s" }}>
                  {merch.user?.foto_profil ? <img src={merch.user.foto_profil} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} /> : <div style={{ width: 44, height: 44, borderRadius: 12, background: filterToko === merch.id ? C.blue : C.gray50, color: filterToko === merch.id ? C.white : C.gray400, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏪</div>}
                  <span style={{ fontSize: 11, fontWeight: 700, color: filterToko === merch.id ? C.blueDark : C.gray600, textAlign: "center", width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{merch.nama_merchant}</span>
                </div>
              ))}
            </div>

            {/* Filter Kategori */}
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, marginTop: 12 }}>Kategori Makanan</h3>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, margin: "0 -20px", padding: "0 20px 12px" }}>
              {["Semua", "Makanan", "Minuman", "Cemilan", "Lainnya"].map(kat => (
                <button key={kat} onClick={() => setFilterKategori(kat)} style={{ padding: "6px 16px", borderRadius: 99, background: filterKategori === kat ? C.red : C.gray100, color: filterKategori === kat ? C.white : C.gray600, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}>{kat}</button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: C.gray400 }}>🔍</span>
          <input style={{ ...inputStyle, paddingLeft: 42 }} placeholder="Cari menu…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <Spinner /> : displayed.length === 0
          ? <Empty icon="🍽️" title="Menu tidak ditemukan" sub="Coba kata kunci lain" />
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14 }}>
            {displayed.map(m => <MenuCard key={m.id} m={m} role={role} onEdit={m => { setEditId(m.id); setForm({ nama_menu: m.nama_menu, harga: m.harga, stok: m.stok }); setMenuModal(true); }} onDel={delMenu} onCart={addCart} />)}
          </div>
        }
      </div>

      {/* Cart FAB */}
      {isPelanggan && cart.length > 0 && (
        <button onClick={() => setOrderModal(true)} style={{
          position: "fixed",
          bottom: 16,
          right: 20,
          background: `linear-gradient(135deg, ${C.red}, ${C.redDark})`,
          color: C.white,
          border: "none",
          borderRadius: 99,
          padding: "12px 20px",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          zIndex: 190,
          boxShadow: `0 8px 24px ${C.red}66`,
          animation: "pulseRed 2s infinite",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          width: "auto",
          minWidth: 160
        }}>
          <span style={{ fontSize: 20, order: 1 }}>🛒</span>
          <div style={{ textAlign: "right", order: 2 }}>
            <div style={{ fontSize: 11, opacity: 0.9 }}>{cartCount} item</div>
            <div style={{ fontWeight: 800 }}>Rp{totalCart.toLocaleString("id-ID")}</div>
          </div>
        </button>
      )}

      {/* Menu Modal */}
      <Modal open={menuModal} onClose={() => setMenuModal(false)} title={editId ? "Edit Menu" : "Tambah Menu"}>
        <form onSubmit={saveMenu}>
          <Inp label="Nama Menu" placeholder="Contoh: Nasi Goreng Spesial" value={form.nama_menu} onChange={e => setForm({ ...form, nama_menu: e.target.value })} required />
          <Sel label="Kategori" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
            <option value="Cemilan">Cemilan</option>
            <option value="Lainnya">Lainnya</option>
          </Sel>
          <Inp label="Harga (Rp)" type="number" placeholder="15000" value={form.harga} onChange={e => setForm({ ...form, harga: e.target.value })} required />
          <Inp label="Stok" type="number" placeholder="10" value={form.stok} onChange={e => setForm({ ...form, stok: e.target.value })} required />
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Gambar Menu</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setForm({ ...form, gambar: e.target.files[0] })}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <BtnRed full>Simpan</BtnRed>
            <BtnGhost full onClick={() => setMenuModal(false)}>Batal</BtnGhost>
          </div>
        </form>
      </Modal>

      {/* Order Modal */}
      <Modal open={orderModal} onClose={() => setOrderModal(false)} title="🛒 Konfirmasi Pesanan">
        <div style={{ maxHeight: "35vh", overflowY: "auto", marginBottom: 16 }}>
          {cart.map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.gray100}` }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900 }}>{c.nama_menu}</div>
                <div style={{ fontSize: 13, color: C.red, fontWeight: 700 }}>Rp{(Number(c.harga) * c.qty).toLocaleString("id-ID")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button style={qtyBtnStyle} onClick={() => changeQty(c.id, -1)}>−</button>
                <span style={{ fontWeight: 700, minWidth: 22, textAlign: "center", fontSize: 14 }}>{c.qty}</span>
                <button style={qtyBtnStyle} onClick={() => changeQty(c.id, +1)}>+</button>
                <button style={{ ...qtyBtnStyle, color: C.red }} onClick={() => removeItem(c.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${C.gray100}`, marginBottom: 16 }}>
          <span style={{ color: C.gray600, fontWeight: 600 }}>Total</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: C.red }}>Rp{totalCart.toLocaleString("id-ID")}</span>
        </div>
        <Sel label="Metode Pembayaran" value={metode} onChange={e => setMetode(e.target.value)}>
          <option value="CASH">💵 Cash</option>
          <option value="QRIS">📱 QRIS</option>
          <option value="TRANSFER">🏦 Transfer Bank</option>
        </Sel>
        <div style={{ display: "flex", gap: 10 }}>
          <BtnRed full onClick={submitOrder}>Pesan Sekarang</BtnRed>
          <BtnGhost full onClick={() => setOrderModal(false)}>Batal</BtnGhost>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title="💳 Tagihan Pembayaran">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.gray900 }}>Instruksi Pembayaran</h3>
          <p style={{ fontSize: 13, color: C.gray600, marginTop: 4 }}>
            Silakan lakukan pembayaran ke Kantin Telkom Pusat (Admin). Total tagihan di bawah ini adalah gabungan seluruh keranjang Anda.
          </p>
        </div>

        {paymentOrders.length > 0 && (
          <div style={{ background: C.offWhite, borderRadius: 16, padding: "20px", marginBottom: 16, border: `1px solid ${C.gray100}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, borderBottom: `2px dashed ${C.gray200}`, paddingBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: C.gray400, fontWeight: 600 }}>Tujuan Pembayaran</div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Kantin Telkom (Admin)</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: C.gray400, fontWeight: 600 }}>Grand Total</div>
                <div style={{ fontWeight: 900, fontSize: 22, color: C.red }}>
                  Rp{paymentOrders.reduce((sum, o) => sum + Number(o.transaksi?.total_bayar || 0), 0).toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {paymentOrders[0]?.transaksi?.metode_bayar === "CASH" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ fontSize: 12, color: C.gray600, marginBottom: 8 }}>Nomor Pesanan Anda:</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.blue, letterSpacing: 2 }}>
                  #{paymentOrders.map(o => o.id).join(", #")}
                </div>
                <div style={{ fontSize: 13, color: C.gray600, marginTop: 16, background: C.white, padding: "16px", borderRadius: 10, border: `1px solid ${C.blueLight}` }}>
                  Silakan menuju ke Kasir Pusat Kantin Telkom, tunjukkan nomor pesanan di atas, dan lakukan pembayaran tunai. Admin akan memverifikasi pesanan Anda.
                </div>
              </div>
            )}

            {paymentOrders[0]?.transaksi?.metode_bayar === "QRIS" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.gray600, marginBottom: 8 }}>Nomor Pesanan Anda:</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.blue, letterSpacing: 2, marginBottom: 12 }}>
                  #{paymentOrders.map(o => o.id).join(", #")}
                </div>
                <div style={{ background: C.white, padding: "16px", borderRadius: 12, display: "inline-block", border: `1px solid ${C.gray200}`, marginBottom: 12 }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QRIS Kantin Telkom" style={{ width: 180, height: 180, opacity: 0.9 }} />
                </div>
                <div style={{ fontSize: 13, color: C.gray600, textAlign: "left", background: C.white, padding: "16px", borderRadius: 10, border: `1px solid ${C.blueLight}` }}>
                  <strong style={{ display: "block", marginBottom: 8 }}>Cara Bayar:</strong>
                  1. Buka aplikasi M-Banking atau e-Wallet Anda.<br />
                  2. Pilih menu Scan QRIS.<br />
                  3. Scan gambar QRIS Kantin Telkom di atas.<br />
                  4. Masukkan Grand Total tepat <strong>Rp{paymentOrders.reduce((sum, o) => sum + Number(o.transaksi?.total_bayar || 0), 0).toLocaleString("id-ID")}</strong>.<br />
                  5. Tunjukkan bukti transfer ke kasir pusat untuk diverifikasi.
                </div>
              </div>
            )}

            {paymentOrders[0]?.transaksi?.metode_bayar === "TRANSFER" && (
              <div>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: C.gray600, marginBottom: 8 }}>Nomor Pesanan Anda:</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: C.blue, letterSpacing: 2 }}>
                    #{paymentOrders.map(o => o.id).join(", #")}
                  </div>
                </div>

                <Sel label="Pilih Bank Tujuan (Kantin Telkom)" value={bankTransfer} onChange={e => setBankTransfer(e.target.value)}>
                  <option value="BCA">BCA</option>
                  <option value="MANDIRI">Mandiri</option>
                  <option value="BRI">BRI</option>
                  <option value="BNI">BNI</option>
                </Sel>

                <div style={{ background: C.white, padding: "20px", borderRadius: 12, border: `1px dashed ${C.blue}`, textAlign: "center", marginBottom: 16, marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: C.gray600 }}>Nomor Rekening {bankTransfer}:</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.gray900, margin: "6px 0", letterSpacing: 2 }}>
                    {bankTransfer === "BCA" ? "8720 1234 567" : bankTransfer === "MANDIRI" ? "1370 0012 3456" : bankTransfer === "BRI" ? "0012 0102 3456 789" : "0123 4567 89"}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.gray700 }}>a.n. Kantin Telkom Pusat</div>
                </div>
              </div>
            )}
          </div>
        )}
        <BtnRed full onClick={() => setPaymentModal(false)}>Saya Sudah Bayar</BtnRed>
      </Modal>
    </>
  );
}
