import { getApprovedSkillById, incrementSkillDownloads } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";

export const runtime = "edge";

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

    await incrementSkillDownloads(id);
    const downloadUrl = await getSignedDownloadUrl(skill.fileKey);

    return Response.json({ downloadUrl });
  } catch (error) {
    console.error("Failed to create download link:", error);
    return Response.json({ error: "Failed to create download link" }, { status: 500 });
  }
}
