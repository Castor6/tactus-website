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
      profile(profile) {
        return {
          id: String(profile.id),
          name: (profile.name as string | null) ?? (profile.login as string),
          email: profile.email as string | null,
          image: profile.avatar_url as string,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "github") {
        token.githubId =
          account.providerAccountId ??
          (profile && "id" in profile ? String((profile as { id?: string | number }).id ?? "") : undefined);

        if (profile) {
          token.picture =
            (profile as { avatar_url?: string }).avatar_url ??
            user?.image ??
            token.picture;
          token.name = profile.name ?? (profile as { login?: string }).login ?? token.name;
        } else if (user?.image) {
          token.picture = user.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      const githubId = typeof token.githubId === "string" ? token.githubId : undefined;

      if (session.user) {
        session.user.id = githubId;
        session.user.isAdmin = isAdminGithubId(githubId);
        session.user.image =
          (typeof token.picture === "string" ? token.picture : undefined) ??
          (githubId ? `https://avatars.githubusercontent.com/u/${githubId}?v=4` : undefined);
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
