import { InvoiceUploadArea } from "@/components/invoiceUploadArea";
import { prisma } from "@/db";
import { requireOrgSession } from "@/features/auth/session"

export default async function InvoicesPage(){
    const session = await requireOrgSession();
     
    const invoices = await prisma.invoice.findMany({
        where:{
            organizationId: session.organizationId
        },
        orderBy:{
            createdAt: "desc"
        },
        take: 20,
        select: {
            id: true,
            fileName: true,
            status: true,
            createdAt: true,
        }
    })

   return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Upload financial documents for automated AI auditing.
        </p>
      </div>

      {/* Client component for drag-and-drop / file selection uploads */}
      <InvoiceUploadArea />

      {/* Simple list of the 20 most recent uploaded invoices */}
      <div className="rounded-lg bg-gray-600 border  text-red-600">
        <div className="border-b px-4 py-3 font-medium">Recent Uploads</div>
        {invoices.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No invoices uploaded yet. Upload a PDF, PNG, or JPEG above to get started.
          </p>
        ) : (
          <ul className="divide-y">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-medium">{invoice.fileName}</span>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                    {invoice.status}
                  </span>
                  <span className="text-muted-foreground font-bold">
                    {invoice.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
