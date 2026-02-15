import { auth } from "@/auth";
import { getSkillById, listPendingSkills, reviewSkill } from "@/lib/db";

type ReviewSkillBody = {
  id?: unknown;
  status?: unknown;
};

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: Response.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  if (!session.user.isAdmin) {
    return {
      error: Response.json({ error: "Admin permission required" }, { status: 403 }),
    };
  }

  return { session };
}

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const skills = await listPendingSkills();
    return Response.json({ skills });
  } catch (error) {
    console.error("Failed to list pending skills:", error);
    return Response.json({ error: "Failed to list pending skills" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin();
  if (authResult.error) {
    return authResult.error;
  }

  const body = (await request.json().catch(() => null)) as ReviewSkillBody | null;

  if (!body) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const status = body.status === "approved" || body.status === "rejected" ? body.status : null;

  if (!id || !status) {
    return Response.json({ error: "id and status are required" }, { status: 400 });
  }

  try {
    const existingSkill = await getSkillById(id);

    if (!existingSkill) {
      return Response.json({ error: "Skill not found" }, { status: 404 });
    }

    if (existingSkill.status !== "pending") {
      return Response.json({ error: "Only pending skills can be reviewed" }, { status: 400 });
    }

    const skill = await reviewSkill(id, status);

    if (!skill) {
      return Response.json({ error: "Skill not found" }, { status: 404 });
    }

    return Response.json({ skill });
  } catch (error) {
    console.error("Failed to review skill:", error);
    return Response.json({ error: "Failed to review skill" }, { status: 500 });
  }
}
