import { getApprovedSkillById } from "@/lib/db";
import { getSkillImage } from "@/lib/r2";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const index = Math.max(0, parseInt(url.searchParams.get("index") ?? "0", 10) || 0);

  try {
    const skill = await getApprovedSkillById(id);
    if (!skill || skill.imageKeys.length === 0) {
      return new Response("Not found", { status: 404 });
    }

    const imageKey = skill.imageKeys[Math.min(index, skill.imageKeys.length - 1)];
    if (!imageKey) {
      return new Response("Not found", { status: 404 });
    }

    const image = await getSkillImage(imageKey);
    if (!image) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(image.body, {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(image.size),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Failed to get skill image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
