import { auth } from "@/auth";
import { createSkillFileKey, uploadZipToR2 } from "@/lib/r2";

export const runtime = "edge";

function isZipFile(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed";
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "file is required" }, { status: 400 });
  }

  if (!isZipFile(file)) {
    return Response.json({ error: "Only zip files are allowed" }, { status: 400 });
  }

  if (file.size === 0) {
    return Response.json({ error: "File is empty" }, { status: 400 });
  }

  try {
    const key = createSkillFileKey(file.name, session.user.id);
    const uploaded = await uploadZipToR2({
      key,
      file,
      uploadedBy: session.user.id,
    });

    return Response.json(uploaded, { status: 201 });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return Response.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
