import { getApprovedSkillById, incrementSkillDownloads } from "@/lib/db";
import { getSkillFile } from "@/lib/r2";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const skill = await getApprovedSkillById(id);

    if (!skill) {
      return Response.json({ error: "Skill not found" }, { status: 404 });
    }

    const file = await getSkillFile(skill.fileKey);

    if (!file) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    await incrementSkillDownloads(id);

    const filename = `${skill.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.zip`;
    const headers = new Headers();
    headers.set("Content-Type", file.contentType);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    if (file.size) {
      headers.set("Content-Length", String(file.size));
    }

    return new Response(file.body, { headers });
  } catch (error) {
    console.error("Failed to create download link:", error);
    return Response.json({ error: "Failed to create download link" }, { status: 500 });
  }
}
