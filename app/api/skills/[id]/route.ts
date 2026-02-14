import { auth } from "@/auth";
import { getSkillById } from "@/lib/db";

export const runtime = "edge";

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
