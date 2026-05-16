import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../styles/tokens";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { apiFetch } from "../services/api";
import AuthShell from "../components/layout/AuthShell";
import Inp, { inputStyle, labelStyle } from "../components/ui/Input";
import Divider from "../components/ui/Divider";
import GoogleSignInBtn from "../components/ui/GoogleSignInBtn";
import { BtnRed } from "../components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async e => {
    e.preventDefault(); 
    setLoading(true);
    try {
      const res = await apiFetch("POST", "/login", form);
      login(res.user, res.token);
      toast("Selamat datang kembali! 👋");
      navigate("/");
    } catch (err) { 
        toast(err.message, "error"); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <AuthShell>
      <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: C.gray900, marginBottom: 4 }}>Masuk</h1>
      <p style={{ color: C.gray400, fontSize: 14, marginBottom: 24 }}>Senang melihatmu lagi!</p>

      <form onSubmit={submit}>
        <Inp label="Username" placeholder="Masukkan username"
          value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPw ? "text" : "password"} placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
              style={{ ...inputStyle, paddingRight: 42 }} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.gray400, lineHeight: 1,
            }}>{showPw ? "🙈" : "👁"}</button>
          </div>
        </div>

        <Divider />
        <GoogleSignInBtn />

        <BtnRed full disabled={loading} style={{ marginTop: 24 }}>
          {loading ? "Masuk…" : "Masuk"}
        </BtnRed>
      </form>

      <p style={{ textAlign: "center", marginTop: 24, color: C.gray400, fontSize: 14 }}>
        Belum punya akun?{" "}
        <span style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("/register")}>Daftar sekarang</span>
      </p>
    </AuthShell>
  );
}
