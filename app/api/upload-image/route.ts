import { auth } from "@/auth";
import { createSkillImageKey, uploadImageToR2, validateImageFile } from "@/lib/r2";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return Response.json({ error: "image is required" }, { status: 400 });
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  try {
    const key = createSkillImageKey(file.name, session.user.id);
    const uploaded = await uploadImageToR2({
      key,
      file,
      uploadedBy: session.user.id,
    });

    return Response.json(uploaded, { status: 201 });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return Response.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
