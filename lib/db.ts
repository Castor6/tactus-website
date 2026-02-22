import { getCloudflareEnv } from "@/lib/cloudflare";

export type SkillStatus = "pending" | "approved" | "rejected";

export type Skill = {
  id: string;
  name: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  fileKey: string;
  fileSize: number | null;
  status: SkillStatus;
  downloads: number;
  createdAt: string;
  updatedAt: string | null;
  reviewedAt: string | null;
};

type SkillRow = {
  id: string;
  name: string;
  description: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  file_key: string;
  file_size: number | null;
  status: SkillStatus;
  downloads: number;
  created_at: string;
  updated_at: string | null;
  reviewed_at: string | null;
};

export type CreateSkillInput = {
  name: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  fileKey: string;
  fileSize?: number | null;
};

const SKILL_COLUMNS = [
  "id",
  "name",
  "description",
  "author_id",
  "author_name",
  "author_avatar",
  "file_key",
  "file_size",
  "status",
  "downloads",
  "created_at",
  "updated_at",
  "reviewed_at",
].join(", ");

// Fallback columns for when updated_at doesn't exist in the DB yet
const FALLBACK_SKILL_COLUMNS = [
  "id",
  "name",
  "description",
  "author_id",
  "author_name",
  "author_avatar",
  "file_key",
  "file_size",
  "status",
  "downloads",
  "created_at",
  "NULL as updated_at",
  "reviewed_at",
].join(", ");

async function withColumnFallback<T>(queryFn: (columns: string) => Promise<T>): Promise<T> {
  try {
    return await queryFn(SKILL_COLUMNS);
  } catch {
    return await queryFn(FALLBACK_SKILL_COLUMNS);
  }
}

function mapSkillRow(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    fileKey: row.file_key,
    fileSize: row.file_size,
    status: row.status,
    downloads: row.downloads,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at,
  };
}

export async function listApprovedSkills(search?: string) {
  const env = getCloudflareEnv();
  const keyword = search?.trim();

  return withColumnFallback(async (columns) => {
    if (keyword) {
      const pattern = `%${keyword}%`;
      const { results } = await env.DB.prepare(
        `SELECT ${columns} FROM skills WHERE status = 'approved' AND (name LIKE ? OR description LIKE ?) ORDER BY created_at DESC`,
      )
        .bind(pattern, pattern)
        .all<SkillRow>();
      return (results ?? []).map(mapSkillRow);
    }

    const { results } = await env.DB.prepare(
      `SELECT ${columns} FROM skills WHERE status = 'approved' ORDER BY created_at DESC`,
    ).all<SkillRow>();
    return (results ?? []).map(mapSkillRow);
  });
}

export async function getSkillById(id: string) {
  return withColumnFallback(async (columns) => {
    const env = getCloudflareEnv();
    const row = await env.DB.prepare(`SELECT ${columns} FROM skills WHERE id = ?`).bind(id).first<SkillRow>();
    return row ? mapSkillRow(row) : null;
  });
}

export async function getApprovedSkillById(id: string) {
  return withColumnFallback(async (columns) => {
    const env = getCloudflareEnv();
    const row = await env.DB.prepare(`SELECT ${columns} FROM skills WHERE id = ? AND status = 'approved'`)
      .bind(id)
      .first<SkillRow>();
    return row ? mapSkillRow(row) : null;
  });
}

export async function createSkill(input: CreateSkillInput) {
  const env = getCloudflareEnv();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  try {
    await env.DB.prepare(
      "INSERT INTO skills (id, name, description, author_id, author_name, author_avatar, file_key, file_size, status, downloads, created_at, updated_at, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, NULL, NULL)",
    )
      .bind(
        id,
        input.name,
        input.description,
        input.authorId,
        input.authorName,
        input.authorAvatar ?? null,
        input.fileKey,
        input.fileSize ?? null,
        createdAt,
      )
      .run();
  } catch {
    // Fallback: INSERT without updated_at column if it doesn't exist yet
    await env.DB.prepare(
      "INSERT INTO skills (id, name, description, author_id, author_name, author_avatar, file_key, file_size, status, downloads, created_at, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, NULL)",
    )
      .bind(
        id,
        input.name,
        input.description,
        input.authorId,
        input.authorName,
        input.authorAvatar ?? null,
        input.fileKey,
        input.fileSize ?? null,
        createdAt,
      )
      .run();
  }

  const skill = await getSkillById(id);

  if (!skill) {
    throw new Error("Failed to create skill");
  }

  return skill;
}

export async function incrementSkillDownloads(id: string) {
  const env = getCloudflareEnv();

  await env.DB.prepare("UPDATE skills SET downloads = downloads + 1 WHERE id = ?").bind(id).run();
}

export async function listPendingSkills() {
  return withColumnFallback(async (columns) => {
    const env = getCloudflareEnv();
    const { results } = await env.DB.prepare(
      `SELECT ${columns} FROM skills WHERE status = 'pending' ORDER BY created_at ASC`,
    ).all<SkillRow>();
    return (results ?? []).map(mapSkillRow);
  });
}

export async function reviewSkill(id: string, status: Extract<SkillStatus, "approved" | "rejected">) {
  const env = getCloudflareEnv();
  const reviewedAt = new Date().toISOString();

  await env.DB.prepare("UPDATE skills SET status = ?, reviewed_at = ? WHERE id = ?")
    .bind(status, reviewedAt, id)
    .run();

  return getSkillById(id);
}

// ── Skill Likes ─────────────────────────────────────────────

export async function toggleSkillLike(skillId: string, userId: string): Promise<{ liked: boolean; count: number }> {
  const env = getCloudflareEnv();

  const existing = await env.DB.prepare(
    "SELECT 1 FROM skill_likes WHERE skill_id = ? AND user_id = ?",
  )
    .bind(skillId, userId)
    .first<{ 1: number }>();

  if (existing) {
    await env.DB.prepare("DELETE FROM skill_likes WHERE skill_id = ? AND user_id = ?")
      .bind(skillId, userId)
      .run();
  } else {
    await env.DB.prepare("INSERT INTO skill_likes (skill_id, user_id) VALUES (?, ?)")
      .bind(skillId, userId)
      .run();
  }

  const count = await getSkillLikeCount(skillId);
  return { liked: !existing, count };
}

export async function getSkillLikeCount(skillId: string): Promise<number> {
  const env = getCloudflareEnv();
  const row = await env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM skill_likes WHERE skill_id = ?",
  )
    .bind(skillId)
    .first<{ cnt: number }>();
  return row?.cnt ?? 0;
}

export async function getSkillLikeCounts(skillIds: string[]): Promise<Record<string, number>> {
  if (skillIds.length === 0) return {};
  const env = getCloudflareEnv();
  const placeholders = skillIds.map(() => "?").join(", ");
  const { results } = await env.DB.prepare(
    `SELECT skill_id, COUNT(*) as cnt FROM skill_likes WHERE skill_id IN (${placeholders}) GROUP BY skill_id`,
  )
    .bind(...skillIds)
    .all<{ skill_id: string; cnt: number }>();

  const counts: Record<string, number> = {};
  for (const id of skillIds) counts[id] = 0;
  for (const row of results ?? []) counts[row.skill_id] = row.cnt;
  return counts;
}

export async function getUserLikedSkillIds(userId: string, skillIds: string[]): Promise<Set<string>> {
  if (skillIds.length === 0 || !userId) return new Set();
  const env = getCloudflareEnv();
  const placeholders = skillIds.map(() => "?").join(", ");
  const { results } = await env.DB.prepare(
    `SELECT skill_id FROM skill_likes WHERE user_id = ? AND skill_id IN (${placeholders})`,
  )
    .bind(userId, ...skillIds)
    .all<{ skill_id: string }>();

  return new Set((results ?? []).map((r) => r.skill_id));
}

export type UpdateSkillInput = {
  name?: string;
  description?: string;
  fileKey?: string;
  fileSize?: number | null;
};

export async function updateSkill(id: string, input: UpdateSkillInput) {
  const env = getCloudflareEnv();
  const updatedAt = new Date().toISOString();

  const setClauses: string[] = ["updated_at = ?"];
  const values: unknown[] = [updatedAt];

  if (input.name !== undefined) {
    setClauses.push("name = ?");
    values.push(input.name);
  }
  if (input.description !== undefined) {
    setClauses.push("description = ?");
    values.push(input.description);
  }
  if (input.fileKey !== undefined) {
    setClauses.push("file_key = ?");
    values.push(input.fileKey);
  }
  if (input.fileSize !== undefined) {
    setClauses.push("file_size = ?");
    values.push(input.fileSize);
  }

  values.push(id);

  try {
    await env.DB.prepare(`UPDATE skills SET ${setClauses.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();
  } catch {
    // Fallback: UPDATE without updated_at if column doesn't exist yet
    const fallbackClauses = setClauses.slice(1); // skip "updated_at = ?"
    const fallbackValues = values.slice(1); // skip updatedAt value, rest includes trailing id
    if (fallbackClauses.length > 0) {
      await env.DB.prepare(`UPDATE skills SET ${fallbackClauses.join(", ")} WHERE id = ?`)
        .bind(...fallbackValues)
        .run();
    }
  }

  return getSkillById(id);
}
