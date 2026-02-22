import { auth } from "@/auth";
import { getSkillById, updateSkill } from "@/lib/db";
import { createSkillFileKey, createSkillImageKey, deleteSkillFile, deleteSkillImage, uploadImageToR2, uploadZipToR2, validateImageFile } from "@/lib/r2";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const skill = await getSkillById(id);

    if (!skill) {
      return Response.json({ error: "Skill not found" }, { status: 404 });
    }

    if (skill.status !== "approved") {
      const session = await auth();
      const isOwner = session?.user?.id === skill.authorId;
      const isAdmin = session?.user?.isAdmin === true;

      if (!isOwner && !isAdmin) {
        return Response.json({ error: "Skill not found" }, { status: 404 });
      }
    }

    return Response.json({ skill });
  } catch (error) {
    console.error("Failed to get skill:", error);
    return Response.json({ error: "Failed to get skill" }, { status: 500 });
  }
}

function isZipFile(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed";
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const existingSkill = await getSkillById(id);
    if (!existingSkill) {
      return Response.json({ error: "Skill not found" }, { status: 404 });
    }

    if (existingSkill.authorId !== session.user.id) {
      return Response.json({ error: "Only the skill author can update it" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const file = formData.get("file");
    const image = formData.get("image");

    const updateInput: Parameters<typeof updateSkill>[1] = {};

    if (typeof name === "string" && name.trim()) {
      updateInput.name = name.trim();
    }
    if (typeof description === "string" && description.trim()) {
      updateInput.description = description.trim();
    }

    if (file instanceof File && file.size > 0) {
      if (!isZipFile(file)) {
        return Response.json({ error: "Only zip files are allowed" }, { status: 400 });
      }

      const newKey = createSkillFileKey(file.name, session.user.id);
      await uploadZipToR2({ key: newKey, file, uploadedBy: session.user.id });

      const oldFileKey = existingSkill.fileKey;
      updateInput.fileKey = newKey;
      updateInput.fileSize = file.size;

      try {
        await deleteSkillFile(oldFileKey);
      } catch {
        console.warn("Failed to delete old R2 file:", oldFileKey);
      }
    }

    if (image instanceof File && image.size > 0) {
      const imageError = validateImageFile(image);
      if (imageError) {
        return Response.json({ error: imageError }, { status: 400 });
      }

      const newImageKey = createSkillImageKey(image.name, session.user.id);
      await uploadImageToR2({ key: newImageKey, file: image, uploadedBy: session.user.id });

      if (existingSkill.imageKey) {
        try {
          await deleteSkillImage(existingSkill.imageKey);
        } catch {
          console.warn("Failed to delete old image:", existingSkill.imageKey);
        }
      }

      updateInput.imageKey = newImageKey;
    }

    const skill = await updateSkill(id, updateInput);
    return Response.json({ skill });
  } catch (error) {
    console.error("Failed to update skill:", error);
    return Response.json({ error: "Failed to update skill" }, { status: 500 });
  }
}
