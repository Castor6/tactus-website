import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const adminGithubIds = new Set(
  (process.env.ADMIN_GITHUB_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

export function isAdminGithubId(githubId?: string | null) {
  if (!githubId) {
    return false;
  }

  return adminGithubIds.has(githubId);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "github") {
        token.githubId =
          account.providerAccountId ??
          (profile && "id" in profile ? String((profile as { id?: string | number }).id ?? "") : undefined);
      }

      return token;
    },
    async session({ session, token }) {
      const githubId = typeof token.githubId === "string" ? token.githubId : undefined;

      if (session.user) {
        session.user.id = githubId;
        session.user.isAdmin = isAdminGithubId(githubId);
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
