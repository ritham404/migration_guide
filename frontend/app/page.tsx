"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "migrating" | "done"
  >("idle");

  const uploadAndMigrate = async () => {
    if (!file) {
      alert("Please select a ZIP file first");
      return;
    }

    try {
      setStatus("uploading");

      // Upload
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // Migrate
      setStatus("migrating");

      const migrateRes = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!migrateRes.ok) throw new Error("Migration failed");

      setStatus("done");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setStatus("idle");
    }
  };

  const statusColor = {
    idle: "bg-gray-200 text-gray-800",
    uploading: "bg-blue-100 text-blue-800",
    migrating: "bg-yellow-100 text-yellow-800",
    done: "bg-green-100 text-green-800",
  }[status];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Cloud Migration Refactoring Tool
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Migrate AWS Lambda (Python) functions to GCP Cloud Functions
        </p>

        {/* File Upload */}
        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">
            Upload AWS Lambda ZIP
          </span>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 block w-full text-sm
              file:mr-4 file:rounded-lg file:border-0
              file:bg-slate-100 file:px-4 file:py-2
              file:text-sm file:font-semibold
              hover:file:bg-slate-200"
          />
        </label>

        {/* Selected File */}
        {file && (
          <div className="mb-4 text-sm text-gray-700">
            Selected file: <strong>{file.name}</strong>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={uploadAndMigrate}
          disabled={status === "uploading" || status === "migrating"}
          className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition
            ${
              status === "idle"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : status === "done"
                ? "bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {status === "idle" && "Start Migration"}
          {status === "uploading" && "Uploading…"}
          {status === "migrating" && "Migrating…"}
          {status === "done" && "Migration Complete"}
        </button>

        {/* Status Badge */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Status
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
          >
            {status.toUpperCase()}
          </span>
        </div>
      </div>
    </main>
  );
}
