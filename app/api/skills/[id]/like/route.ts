import { auth } from "@/auth";
import { getApprovedSkillById, toggleSkillLike } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const skill = await getApprovedSkillById(id);
  if (!skill) {
    return Response.json({ error: "Skill not found" }, { status: 404 });
  }

  try {
    const result = await toggleSkillLike(id, session.user.id);
    return Response.json(result);
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return Response.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
