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

  if (keyword) {
    const pattern = `%${keyword}%`;
    const statement = env.DB.prepare(
      `SELECT ${SKILL_COLUMNS} FROM skills WHERE status = 'approved' AND (name LIKE ? OR description LIKE ?) ORDER BY created_at DESC`,
    ).bind(pattern, pattern);

    const { results } = await statement.all<SkillRow>();
    return (results ?? []).map(mapSkillRow);
  }

  const statement = env.DB.prepare(
    `SELECT ${SKILL_COLUMNS} FROM skills WHERE status = 'approved' ORDER BY created_at DESC`,
  );
  const { results } = await statement.all<SkillRow>();
  return (results ?? []).map(mapSkillRow);
}

export async function getSkillById(id: string) {
  const env = getCloudflareEnv();
  const statement = env.DB.prepare(`SELECT ${SKILL_COLUMNS} FROM skills WHERE id = ?`).bind(id);
  const row = await statement.first<SkillRow>();

  if (!row) {
    return null;
  }

  return mapSkillRow(row);
}

export async function getApprovedSkillById(id: string) {
  const env = getCloudflareEnv();
  const statement = env.DB.prepare(
    `SELECT ${SKILL_COLUMNS} FROM skills WHERE id = ? AND status = 'approved'`,
  ).bind(id);
  const row = await statement.first<SkillRow>();

  if (!row) {
    return null;
  }

  return mapSkillRow(row);
}

export async function createSkill(input: CreateSkillInput) {
  const env = getCloudflareEnv();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

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
  const env = getCloudflareEnv();
  const statement = env.DB.prepare(
    `SELECT ${SKILL_COLUMNS} FROM skills WHERE status = 'pending' ORDER BY created_at ASC`,
  );
  const { results } = await statement.all<SkillRow>();

  return (results ?? []).map(mapSkillRow);
}

export async function reviewSkill(id: string, status: Extract<SkillStatus, "approved" | "rejected">) {
  const env = getCloudflareEnv();
  const reviewedAt = new Date().toISOString();

  await env.DB.prepare("UPDATE skills SET status = ?, reviewed_at = ? WHERE id = ?")
    .bind(status, reviewedAt, id)
    .run();

  return getSkillById(id);
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

  await env.DB.prepare(`UPDATE skills SET ${setClauses.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  return getSkillById(id);
}
