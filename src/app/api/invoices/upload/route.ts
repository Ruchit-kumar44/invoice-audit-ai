import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import crypto from "crypto";
import { prisma } from "@/db";
import { requireOrgSession } from "@/features/auth/session";

// 4 MB cap 
const MAX_FILE_SIZE = 4 * 1024 * 1024;

// Map allowed MIME types to clean file extensions for Blob storage
const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
};

export async function POST(request: Request) {
  try {
    // 1. CHECK WHO IS ASKING (Never trust organizationId from the client body)
    const session = await requireOrgSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in and select an organization." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum allowed size is 4 MB." },
        { status: 413 }
      );
    }

    const fileExtension = MIME_TO_EXT[file.type];
    if (!fileExtension) {
      return NextResponse.json(
        { error: "Unsupported format. Only PDF, PNG, and JPEG are allowed." },
        { status: 400 }
      );
    }

    // 3. COMPUTE SHA-256 HASH OF THE FILE BYTES
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 4. CHECK FOR EXACT DUPLICATE (Uses [organizationId, fileHash] index)
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        organizationId: session.organizationId,
        fileHash: fileHash,
      },
      select: { id: true },
    });

    if (existingInvoice) {
      return NextResponse.json(
        {
          error: "This exact invoice file has already been uploaded.",
          invoiceId: existingInvoice.id,
        },
        { status: 409 }
      );
    }

    // 5. UPLOAD TO PRIVATE BLOB WITH UUID PATHNAME
    const randomId = crypto.randomUUID();
    const blobPath = `invoices/${session.organizationId}/${randomId}.${fileExtension}`;

    const blob = await put(blobPath, buffer, {
      access: "private",
      contentType: file.type,
    });

    // 6. INSERT DATABASE ROW (With orphan blob rollback if DB insert fails)
    try {
      const invoice = await prisma.invoice.create({
        data: {
          organizationId: session.organizationId,
          uploadedById: session.userId,
          status: "UPLOADED",
          fileUrl: blob.url,
          fileName: file.name,
          mimeType: file.type,
          fileHash: fileHash,
        },
      });

      return NextResponse.json({ invoiceId: invoice.id }, { status: 201 });
    } catch (dbError) {
      // Rollback: Delete the uploaded file from Vercel Blob so no orphan file remains
      await del(blob.url);
      throw dbError;
    }
  } catch (error) {
    console.error("Invoice upload failed:", error);
    return NextResponse.json(
      { error: "Internal server error during upload." },
      { status: 500 }
    );
  }
}
