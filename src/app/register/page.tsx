"use client";

import { useState } from "react";
import { auth, db, provider } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import styles from "@/components/RegisterForm.module.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    student_id: "",
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      let role = "user";
      if (form.email.endsWith("@admin.ac.th")) {
        role = "teacher";
      } else if (form.email.endsWith("@kkumail.com")) {
        role = "student";
      } else {
        setError(
          "กรุณาใช้อีเมลของมหาวิทยาลัย เช่น @kkumail.com หรือ @admin.ac.th"
        );
        setLoading(false);
        return;
      }

      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        student_id: form.student_id,
        name: form.name,
        phone: form.phone,
        email: form.email,
        role,
        createdAt: serverTimestamp(),
      });

      router.push("/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError("ไม่สามารถสมัครสมาชิกได้: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let role = "user";
      if (user.email?.endsWith("@admin.ac.th")) {
        role = "teacher";
      } else if (user.email?.endsWith("@kkumail.com")) {
        role = "student";
      } else {
        setError(
          "กรุณาใช้อีเมลของมหาวิทยาลัย เช่น @kkumail.com หรือ @admin.ac.th"
        );
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          student_id: "",
          name: user.displayName || "",
          phone: user.phoneNumber || "",
          email: user.email,
          role,
          createdAt: serverTimestamp(),
        });
      }

      router.push("/report");
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setError("ไม่สามารถเข้าสู่ระบบด้วย Google ได้: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>สมัครสมาชิก</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          name="student_id"
          placeholder="รหัสนักศึกษา"
          value={form.student_id}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          name="name"
          placeholder="ชื่อ-นามสกุล"
          value={form.name}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          name="phone"
          placeholder="เบอร์โทร"
          value={form.phone}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          name="email"
          type="email"
          placeholder="อีเมล"
          value={form.email}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          name="password"
          type="password"
          placeholder="รหัสผ่าน"
          value={form.password}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${styles.primary}`}
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>

        <button
        type="button"
        onClick={handleGoogleLogin}
        className={`${styles.button} ${styles.google}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px", 
        }}
      >
        <img
          src="/image/icons8-google.svg"
          alt="Google"
          style={{ width: 24, height: 24 }}
        />
        <span className={styles.googleText}>เข้าสู่ระบบด้วย Google</span>
        </button>



        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}
