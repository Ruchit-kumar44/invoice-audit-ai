"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Mirror the exact server limits (4 MB max)
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_MIME_TYPES = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

// Track the lifecycle of each individual file in the queue
type FileUploadItem = {
  id: string;
  fileName: string;
  status: "queued" | "uploading" | "done" | "failed";
  message: string;
};

export function InvoiceUploadArea() {
  const router = useRouter();
  const [items, setItems] = useState<FileUploadItem[]>([]);

  // Helper to update a single file's status/message without disturbing other files
  const updateItem = (id: string, patch: Partial<FileUploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  // Upload a single file to /api/invoices/upload
  const uploadSingleFile = async (id: string, file: File) => {
    updateItem(id, { status: "uploading", message: "Uploading..." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/invoices/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Handle specific HTTP status codes from our upload route
      if (response.status === 409) {
        updateItem(id, { status: "failed", message: "Already uploaded" });
        return;
      }

      if (response.status === 413) {
        updateItem(id, { status: "failed", message: "Too large (max 4 MB)" });
        return;
      }

      if (!response.ok) {
        updateItem(id, {
          status: "failed",
          message: data.error || "Upload failed",
        });
        return;
      }

      // Success (201 Created)
      updateItem(id, { status: "done", message: "Uploaded" });

      // Refresh the Server Component list above so the new row appears immediately
      router.refresh();
    } catch {
      updateItem(id, { status: "failed", message: "Network error" });
    }
  };

  // Triggered whenever files are dropped or picked via the file browser
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // 1. Immediately record any files rejected by client-side size/type rules
      const rejectedItems: FileUploadItem[] = rejectedFiles.map((rejection) => {
        const isTooLarge = rejection.errors.some((e) => e.code === "file-too-large");
        const isInvalidType = rejection.errors.some((e) => e.code === "file-invalid-type");

        let message = "Invalid file";
        if (isTooLarge) message = "Too large (max 4 MB)";
        else if (isInvalidType) message = "Only PDF, PNG, or JPEG allowed";

        return {
          id: crypto.randomUUID(),
          fileName: rejection.file.name,
          status: "failed",
          message,
        };
      });

      // 2. Queue all valid files
      const validQueue = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        item: {
          id: crypto.randomUUID(),
          fileName: file.name,
          status: "queued" as const,
          message: "Queued...",
        },
      }));

      // Fix ID alignment so item.id matches the ID passed to uploadSingleFile
      const alignedQueue = validQueue.map((entry) => ({
        ...entry,
        item: { ...entry.item, id: entry.id },
      }));

      // Add both rejected and queued items to the UI list right away
      setItems((prev) => [
        ...rejectedItems,
        ...alignedQueue.map((q) => q.item),
        ...prev,
      ]);

      // 3. Fire one independent POST request per valid file
      alignedQueue.forEach(({ id, file }) => {
        uploadSingleFile(id, file);
      });
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_MIME_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* Large dashed dropzone box */}
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isDragActive
            ? "Drop your invoices here..."
            : "Drag & drop invoices here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, PNG, or JPEG up to 4 MB per file
        </p>
      </div>

      {/* Per-file status list */}
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border bg-card px-4 py-2.5 text-sm"
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{item.fileName}</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium">
                {item.status === "uploading" && (
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {item.message}
                  </span>
                )}
                {item.status === "queued" && (
                  <span className="text-muted-foreground">{item.message}</span>
                )}
                {item.status === "done" && (
                  <span className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item.message}
                  </span>
                )}
                {item.status === "failed" && (
                  <span className="flex items-center gap-1.5 text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {item.message}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
