import { prisma } from "@/db";
import { requireOrgSession } from "@/features/auth/session";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
){
   try{
        // 1. Verify the caller is logged in with an active organization
       const session = await requireOrgSession();
       if (!session) {
           return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }   

       const {id} = await params

      // 3. Load the invoice scoped strictly to the user's organization
      const invoice = await prisma.invoice.findFirst({
        where: {
            id: id,
            organizationId: session.organizationId
        },
        select: {
          fileUrl: true,
          fileName: true,
          mimeType: true,
        }
      })

      // Return 404 (not 403) so cross-tenant users cannot probe valid invoice IDs
        if (!invoice) {
           return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

       // 4. Fetch the private blob stream using Vercel Blob's server SDK
       const blobResult = await get(invoice.fileUrl, {
          access: "private",
        });

       if (!blobResult || blobResult.statusCode !== 200 || !blobResult.stream) {
           return NextResponse.json({ error: "File unavailable in storage" }, { status: 404 });
        }

      return new NextResponse(blobResult.stream, {
        status: 200,
        headers: {
            "Content-Type": invoice.mimeType,
            "Content-Disposition": `inline; filename="${encodeURIComponent(invoice.fileName)}"`,
            "Cache-Control": "private, no-store",
        }
      })

    } catch(error){
      console.error("Error serving private invoice file:", error);
       return NextResponse.json(
            { error: "Failed to retrieve invoice file" },
           { status: 500 }
       );
    }
}