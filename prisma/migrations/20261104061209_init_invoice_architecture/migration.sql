-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('UPLOADED', 'EXTRACTING', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'EXTRACTION_FAILED');

-- CreateEnum
CREATE TYPE "FlagSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'DISMISSED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AuditRule" AS ENUM ('LINE_ITEMS_SUM_MISMATCH', 'TOTAL_MISMATCH', 'DUPLICATE_INVOICE', 'UNUSUAL_AMOUNT');

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "vendor_id" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'UPLOADED',
    "invoice_number" TEXT,
    "invoice_date" DATE,
    "due_date" DATE,
    "currency" TEXT,
    "subtotal_cents" INTEGER,
    "tax_cents" INTEGER,
    "total_cents" INTEGER,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "ai_extraction" JSONB,
    "field_confidence" JSONB,
    "error_message" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "amount_cents" INTEGER NOT NULL,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_flags" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "rule" "AuditRule" NOT NULL,
    "severity" "FlagSeverity" NOT NULL,
    "status" "FlagStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendors_organization_id_idx" ON "vendors"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_organization_id_normalized_name_key" ON "vendors"("organization_id", "normalized_name");

-- CreateIndex
CREATE INDEX "invoices_organization_id_status_idx" ON "invoices"("organization_id", "status");

-- CreateIndex
CREATE INDEX "invoices_organization_id_invoice_date_idx" ON "invoices"("organization_id", "invoice_date");

-- CreateIndex
CREATE INDEX "invoices_organization_id_vendor_id_idx" ON "invoices"("organization_id", "vendor_id");

-- CreateIndex
CREATE INDEX "invoices_organization_id_vendor_id_invoice_number_idx" ON "invoices"("organization_id", "vendor_id", "invoice_number");

-- CreateIndex
CREATE INDEX "invoices_organization_id_file_hash_idx" ON "invoices"("organization_id", "file_hash");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");

-- CreateIndex
CREATE INDEX "audit_flags_organization_id_status_idx" ON "audit_flags"("organization_id", "status");

-- CreateIndex
CREATE INDEX "audit_flags_invoice_id_idx" ON "audit_flags"("invoice_id");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_flags" ADD CONSTRAINT "audit_flags_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
