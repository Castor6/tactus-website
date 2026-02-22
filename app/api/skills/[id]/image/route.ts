import { getApprovedSkillById } from "@/lib/db";
import { getSkillImage } from "@/lib/r2";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const skill = await getApprovedSkillById(id);
    if (!skill || !skill.imageKey) {
      return new Response("Not found", { status: 404 });
    }

    const image = await getSkillImage(skill.imageKey);
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
