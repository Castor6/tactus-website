import { auth } from "@/auth";
import { getApprovedSkillById, getSkillById, incrementSkillDownloads } from "@/lib/db";
import { getSkillFile } from "@/lib/r2";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    let skill = await getApprovedSkillById(id);
    let isAdminDownload = false;

    if (!skill) {
      const session = await auth();
      if (session?.user?.isAdmin) {
        skill = await getSkillById(id);
        isAdminDownload = true;
      }
    }

    if (!skill) {
      return Response.json({ error: "Skill not found" }, { status: 404 });
    }

    const file = await getSkillFile(skill.fileKey);

    if (!file) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    if (!isAdminDownload) {
      await incrementSkillDownloads(id);
    }

    const safeName = skill.name.replace(/[/\\:*?"<>|]/g, "_");
    const encodedFilename = `${encodeURIComponent(safeName)}.zip`;
    const headers = new Headers();
    headers.set("Content-Type", file.contentType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`
    );
    if (file.size) {
      headers.set("Content-Length", String(file.size));
    }

    return new Response(file.body, { headers });
  } catch (error) {
    console.error("Failed to create download link:", error);
    return Response.json({ error: "Failed to create download link" }, { status: 500 });
  }
}
