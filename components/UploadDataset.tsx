import { useState } from "react";
import { upload } from "@vercel/blob/client";

export default function UploadDataset() {
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState<string>("");
  const [lastUrl, setLastUrl] = useState<string>("");

  async function onPickFile(file: File | null) {
    setLastUrl("");
    if (!file) return;

    if (!adminKey.trim()) {
      setStatus("Falta ADMIN_KEY.");
      return;
    }

    if (
      file.type &&
      file.type !== "application/json" &&
      !file.name.toLowerCase().endsWith(".json")
    ) {
      setStatus("El archivo debe ser .json");
      return;
    }

    try {
      setStatus("Subiendo...");

      // Nota: el pathname real lo fija tu api/upload.ts (datasets/latest.json)
      const result = await upload("latest.json", file, {
        access: "private",
        handleUploadUrl: "/api/upload",
       clientPayload: { adminkey: adminKey.trim() },
      });

      setLastUrl(result.url);
      setStatus("✅ Subido OK");
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : String(err);
      setStatus("❌ Error: " + msg);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "24px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Subir dataset (latest.json)</h2>

      <label style={{ display: "block", marginBottom: 8 }}>
        ADMIN_KEY (no se guarda):
      </label>
      <input
        value={adminKey}
        onChange={(e) => setAdminKey(e.target.value)}
        type="password"
        placeholder="Ej: PIZARRO_ADMIN_xxxx"
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #ccc",
          marginBottom: 12,
        }}
      />

      <input
        type="file"
        accept="application/json,.json"
        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
      />

      <div style={{ marginTop: 12, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        {status}
      </div>

      {lastUrl ? (
        <div style={{ marginTop: 10 }}>
          URL: <a href={lastUrl} target="_blank" rel="noreferrer">{lastUrl}</a>
        </div>
      ) : null}
    </div>
  );
}
