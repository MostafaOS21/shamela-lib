"use client";
import axios from "axios";
import { useRef, useState } from "react";

export default function DownloadBtn({
  bookUrl,
  bookTitle,
}: {
  bookUrl: string;
  bookTitle: string;
}) {
  const limitRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const donwloadBook = async () => {
    const limit = limitRef.current?.value;
    const url = `/api/download?url=${bookUrl}&limit=${
      limit || "MAX"
    }&title=${bookTitle}`;

    try {
      setIsDownloading(true);
      const res = await axios.get(url, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": "attachment; filename=output.pdf",
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsDownloading(false);
      setIsDownloaded(true);
    }
  };

  let content;

  if (isDownloading) {
    content = (
      <svg className="spinner" viewBox="0 0 50 50">
        <circle
          className="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
        ></circle>
      </svg>
    );
  } else if (isDownloaded) {
    content = (
      <>
        <p>تم تحميل الكتاب بنجاح</p>
      </>
    );
  } else {
    content = (
      <>
        <input
          placeholder="الحد الأقصى"
          className="main__input"
          ref={limitRef}
        />
        <p>الإفتراضي: تحميل الكتاب كاملا وقد يتطلب هذا مزيدًا الوقت </p>
        <button className="main__btn" onClick={donwloadBook}>
          تحميل الكتاب كاملًا
        </button>
      </>
    );
  }

  return <div className="flex flex-col mx-auto gap-6">{content}</div>;
}
