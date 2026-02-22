import { auth } from "@/auth";
import { getSkillById, updateSkill } from "@/lib/db";
import { createSkillFileKey, createSkillImageKey, deleteSkillFile, deleteSkillImages, uploadImageToR2, uploadZipToR2, validateImageFile } from "@/lib/r2";

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

      if (existingSkill.imageKeys.length > 0) {
        try {
          await deleteSkillImages(existingSkill.imageKeys);
        } catch {
          console.warn("Failed to delete old images");
        }
      }

      updateInput.imageKeys = [newImageKey];
    }

    // Handle multiple new images
    const images = formData.getAll("images");
    if (images.length > 0) {
      const newKeys: string[] = [];
      for (const img of images) {
        if (!(img instanceof File) || img.size === 0) continue;
        const imgError = validateImageFile(img);
        if (imgError) {
          return Response.json({ error: imgError }, { status: 400 });
        }
        if (newKeys.length >= 5) break;
        const key = createSkillImageKey(img.name, session.user.id);
        await uploadImageToR2({ key, file: img, uploadedBy: session.user.id });
        newKeys.push(key);
      }

      if (newKeys.length > 0) {
        // Merge with kept keys or replace
        const keptKeysRaw = formData.get("keptImageKeys");
        let keptKeys: string[] = [];
        if (typeof keptKeysRaw === "string" && keptKeysRaw.trim()) {
          try {
            const parsed = JSON.parse(keptKeysRaw);
            if (Array.isArray(parsed)) keptKeys = parsed.filter((k): k is string => typeof k === "string");
          } catch { /* ignore */ }
        }
        const mergedKeys = [...keptKeys, ...newKeys].slice(0, 5);

        // Delete removed old keys
        const removedKeys = existingSkill.imageKeys.filter((k) => !mergedKeys.includes(k));
        if (removedKeys.length > 0) {
          try { await deleteSkillImages(removedKeys); } catch { console.warn("Failed to delete removed images"); }
        }

        updateInput.imageKeys = mergedKeys;
      }
    }

    // Handle image deletion / reorder without new uploads
    if (!updateInput.imageKeys) {
      const keptKeysRaw = formData.get("keptImageKeys");
      if (typeof keptKeysRaw === "string") {
        let keptKeys: string[] = [];
        if (keptKeysRaw.trim()) {
          try {
            const parsed = JSON.parse(keptKeysRaw);
            if (Array.isArray(parsed)) keptKeys = parsed.filter((k): k is string => typeof k === "string");
          } catch { /* ignore */ }
        }
        // Only apply if different from existing
        const keptSet = new Set(keptKeys);
        const changed = existingSkill.imageKeys.length !== keptKeys.length || existingSkill.imageKeys.some((k) => !keptSet.has(k));
        if (changed) {
          const removedKeys = existingSkill.imageKeys.filter((k) => !keptSet.has(k));
          if (removedKeys.length > 0) {
            try { await deleteSkillImages(removedKeys); } catch { console.warn("Failed to delete removed images"); }
          }
          updateInput.imageKeys = keptKeys;
        }
      }
    }

    const skill = await updateSkill(id, updateInput);
    return Response.json({ skill });
  } catch (error) {
    console.error("Failed to update skill:", error);
    return Response.json({ error: "Failed to update skill" }, { status: 500 });
  }
}
