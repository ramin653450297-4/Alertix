"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import styles from "@/components/ReportListPage.module.css";

export default function ReportListPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // ฟังก์ชันสำหรับเลือกคลาสสีสถานะ
  const getStatusClass = (status: string) => {
    if (status === "รอดำเนินการ") return styles.statusPending;
    if (status === "กำลังดำเนินการ") return styles.statusInProgress;
    if (status === "เสร็จสิ้น") return styles.statusSuccess;
    return "";
  };

  useEffect(() => {
    const fetchReports = async () => {
      const q = query(collection(db, "emergencies"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    fetchReports();
    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>รายงานเหตุฉุกเฉิน</h1>
        {user && <span className={styles.email}>👤 {user.email}</span>}
      </div>

      <Link href="/create" className={styles.button}>
        + แจ้งเหตุฉุกเฉิน
      </Link>

      {reports.length === 0 ? (
        <p>ไม่มีรายงาน</p>
      ) : (
        <div className="grid gap-4 mt-4">
          {reports.map((report) => (
            <div key={report.id} className={styles.card}>
              <img
                src={report.imageBase64 || "/default-image.png"}
                alt="ภาพเหตุการณ์"
                className={styles.image}
              />
              <p><strong>ประเภท:</strong> {report.type}</p>
              <p><strong>รายละเอียด:</strong> {report.description}</p>
              <p><strong>สถานที่:</strong> {report.location}</p>
              <p className={styles.timestamp}>
                วันที่: {report.createdAt?.toDate().toLocaleString()}
              </p>
              <p>
                      <strong>สถานะ:</strong>{" "}
                      <span className={getStatusClass(report.status)}>{report.status}</span>
                    </p>
              {/* แสดงหมายเหตุจากแอดมิน ถ้ามี */}
              {report.adminNote && (
                <p className={styles["admin-note"]}>
                  หมายเหตุจากแอดมิน: {report.adminNote}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
