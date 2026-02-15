import { auth } from "@/auth";
import { createSkill, listApprovedSkills } from "@/lib/db";

type CreateSkillBody = {
  name?: unknown;
  description?: unknown;
  fileKey?: unknown;
  fileSize?: unknown;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;

  try {
    const skills = await listApprovedSkills(q);
    return Response.json({ skills });
  } catch (error) {
    console.error("Failed to list skills:", error);
    return Response.json({ error: "Failed to list skills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CreateSkillBody | null;
  if (!body) {
    return badRequest("Invalid JSON body");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const fileKey = typeof body.fileKey === "string" ? body.fileKey.trim() : "";
  const fileSize = typeof body.fileSize === "number" && Number.isFinite(body.fileSize) ? body.fileSize : null;

  if (!name || !description || !fileKey) {
    return badRequest("name, description and fileKey are required");
  }

  try {
    const skill = await createSkill({
      name,
      description,
      fileKey,
      fileSize,
      authorId: session.user.id,
      authorName: session.user.name ?? "GitHub User",
      authorAvatar: session.user.image ?? null,
    });

    return Response.json({ skill }, { status: 201 });
  } catch (error) {
    console.error("Failed to create skill:", error);
    return Response.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
