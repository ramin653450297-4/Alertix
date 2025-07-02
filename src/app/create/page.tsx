"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import styles from "@/components/Create.module.css";
import MapPicker from "@/components/MapPicker";

const emergencyTypes = [
  "อุบัติเหตุ",
  "เจ็บป่วย",
  "เหตุรุนแรง",
  "ทะเลาะวิวาท",
  "ไฟไหม้",
  "อื่น ๆ",
];

const defaultImage =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/450px-No_image_available.svg.png";

export default function NewReportPage() {
  const [form, setForm] = useState({
    type: "",
    description: "",
    location: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageBase64 = file ? await toBase64(file) : defaultImage;

      await addDoc(collection(db, "emergencies"), {
        type: form.type,
        description: form.description,
        location: form.location,
        imageBase64,
        status: "รอการตอบสนอง",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        responseNote: "",
      });

      router.push("/report");
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

return (
  <div className={styles.container}>
    <h1 className={styles.title}>แจ้งเหตุฉุกเฉิน</h1>
    <form onSubmit={handleSubmit} className={styles.form}>
      <select
        className={styles.select}
        name="type"
        value={form.type}
        onChange={handleChange}
        required
      >
        <option value="" className={styles.option}>
          -- เลือกประเภทเหตุฉุกเฉิน --
        </option>
        {emergencyTypes.map((type) => (
          <option key={type} value={type} className={styles.option}>
            {type}
          </option>
        ))}
      </select>

      <textarea
        name="description"
        placeholder="รายละเอียดเหตุการณ์"
        value={form.description}
        onChange={handleChange}
        required
        className={styles.input}
      />

      {/* Google Map Picker */}
      
      <label style={{ display: "block", marginBottom: 4 }}>สถานที่เกิดเหตุ</label>
      <MapPicker
        onLocationSelect={(lat, lng, address) => {
          setForm((prev) => ({
            ...prev,
            location: address || `${lat},${lng}`,
          }));
        }}
      />
      {form.location && (
        <p style={{ marginTop: 8, fontSize: 14 }}>
          สถานที่ที่เลือก: {form.location}
        </p>
      )}
      <label style={{ display: "block", marginTop: 16 }}>แนบรูปภาพ (ถ้ามี)</label>
      <p style={{ fontSize: 12, color: "#666" }}>
      </p>


      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.input}
      />

      <div className={styles.previewContainer}>
        <img
          src={preview || defaultImage}
          alt="preview"
          className={styles.previewImage}
        />
        {preview && (
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            className={styles.button}
            style={{
              marginTop: "0.5rem",
              backgroundColor: "#fff",
              fontSize: "0.9rem",
              padding: "0.4rem 0.8rem",
              borderRadius: "1rem",
            }}
          >
            ลบรูป
          </button>
        )}
      </div>

      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? "กำลังส่ง..." : "ส่งรายงาน"}
      </button>
    </form>
  </div>
);

}
