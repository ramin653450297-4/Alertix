"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import styles from "@/components/AdminReportList.module.css";

const emergencyTypes = [
  "อุบัติเหตุ",
  "เจ็บป่วย",
  "เหตุรุนแรง",
  "ทะเลาะวิวาท",
  "ไฟไหม้",
  "อื่น ๆ",
];

export default function AdminReportList() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      const q = query(collection(db, "emergencies"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    };
    fetchReports();
  }, []);

  const handleSaveStatus = async () => {
    if (!selectedReport) return;
    setLoading(true);
    const ref = doc(db, "emergencies", selectedReport.id);
    await updateDoc(ref, { status: newStatus, adminNote: note });
    setReports(prev =>
      prev.map(report =>
        report.id === selectedReport.id
          ? { ...report, status: newStatus, adminNote: note }
          : report
      )
    );
    setSelectedReport(null);
    setNote("");
    setNewStatus("");
    setLoading(false);
  };

  const getStatusClass = (status: string) => {
    if (status === "รอดำเนินการ") return styles.statusPending;
    if (status === "กำลังดำเนินการ") return styles.statusInProgress;
    if (status === "เสร็จสิ้น") return styles.statusSuccess;
    return "";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>รายงานเหตุฉุกเฉินทั้งหมด</h1>

      {reports.length === 0 ? (
        <p>ไม่มีรายงาน</p>
      ) : (
        emergencyTypes.map((type) => {
          const reportsOfType = reports.filter(report => report.type === type);
          if (reportsOfType.length === 0) return null;
          return (
            <div key={type} className={styles.typeSection}>
              <h2 className={styles.typeTitle}>{type}</h2>
              <div className={styles.grid}>
                {reportsOfType.map((report) => (
                  <div key={report.id} className={styles.card}>
                    <img
                      src={report.imageBase64 || "/default-image.png"}
                      alt="ภาพเหตุการณ์"
                      className={styles.image}
                    />
                    <p><strong>ประเภท:</strong> {report.type}</p>
                    <p><strong>รายละเอียด:</strong> {report.description}</p>
                    <p><strong>สถานที่:</strong> {report.location}</p>
                    <p>
                      <strong>สถานะ:</strong>{" "}
                      <span className={getStatusClass(report.status)}>{report.status}</span>
                    </p>
                    <p><strong>หมายเหตุ:</strong> {report.adminNote || "-"}</p>
                    <button
                    className={styles.primary}
                    onClick={() => {
                        setSelectedReport(report);
                        setNewStatus(report.status);
                        setNote(report.adminNote || "");
                    }}
                    disabled={report.status === "เสร็จสิ้น"}
                    style={{ 
                        backgroundColor: report.status === "เสร็จสิ้น" ? "#ccc" : undefined,
                        cursor: report.status === "เสร็จสิ้น" ? "not-allowed" : "pointer"
                    }}
                    >
                    แก้ไขสถานะ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Popup Center */}
      {selectedReport && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2>อัปเดตสถานะ</h2>
            <p><strong>เหตุการณ์:</strong> {selectedReport.type}</p>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className={styles.select}
            >
              <option value="รอดำเนินการ">รอดำเนินการ</option>
              <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            </select>
            <textarea
              placeholder="ใส่หมายเหตุ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.textarea}
            />
            <div className={styles.popupButtons}>
              <button onClick={handleSaveStatus} className={styles.primary} disabled={loading}>
                บันทึก
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className={styles.cancel}
                disabled={loading}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
