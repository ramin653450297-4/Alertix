"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import styles from "@/components/Login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      if (user.email?.endsWith("@admin.ac.th")) {
        router.push("/admin");
      } else {
        router.push("/report");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <h2 className={styles.loginTitle}>เข้าสู่ระบบ</h2>

        {error && <p className={styles.loginError}>{error}</p>}

        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="E-MAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>

        <button type="submit" className={`${styles.primary} ${styles.loginButton}`}>
          เข้าสู่ระบบ
        </button>

        <p className={styles.loginFooter}>
          ยังไม่มีบัญชีใช่ไหม?{" "}
          <Link href="/register" className={styles.loginLink}>
            สมัครสมาชิกที่นี่
          </Link>
        </p>
      </form>
    </div>
  );
}
