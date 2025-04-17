import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import db from "./db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Adapter } from "next-auth/adapters";
import { accounts, sessions, users, verificationTokens } from "./schema";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      },
      profile(profile, tokens) {
        return (async () => {
          let primaryEmail = null;
          try {
            // Fetch user's emails from GitHub API
            const emailRes = await fetch('https://api.github.com/user/emails', {
              headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            });
            if (emailRes.ok) {
              const emails = await emailRes.json();
              primaryEmail = emails.find((email: any) => email.primary)?.email || emails[0]?.email;
            }
          } catch (error) {
            console.error('Error fetching GitHub emails:', error);
          }

          // If we couldn't get the email, generate a placeholder one
          if (!primaryEmail) {
            primaryEmail = `${profile.id}@users.noreply.github.com`;
          }
          
          return {
            id: profile.id.toString(),
            name: profile.name || profile.login,
            gh_username: profile.login,
            email: primaryEmail,
            image: profile.avatar_url,
          };
        })();
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: "/login", // Error code passed in query string as ?error=
  },
  adapter: DrizzleAdapter(db, {
    // @ts-ignore - Type compatibility issues with DrizzleAdapter
    usersTable: users,
    // @ts-ignore - Type compatibility issues with DrizzleAdapter
    accountsTable: accounts,
    // @ts-ignore - Type compatibility issues with DrizzleAdapter
    sessionsTable: sessions,
    // @ts-ignore - Type compatibility issues with DrizzleAdapter
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Force cookies to use same name in all environments
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user = {
          ...session.user,
          // @ts-expect-error
          id: token.sub,
          // @ts-expect-error
          username: token?.user?.username || token?.user?.gh_username,
        };
      }
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions) as Promise<{
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      image: string;
    };
  } | null>;
}

export function withSiteAuth(action: any) {
  return async (
    formData: FormData | null,
    siteId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session) {
      return {
        error: "Not authenticated",
      };
    }

    const site = await db.query.sites.findFirst({
      where: (sites, { eq }) => eq(sites.id, siteId),
    });

    if (!site || site.userId !== session.user.id) {
      return {
        error: "Not authorized",
      };
    }

    return action(formData, site, key);
  };
}

export function withPostAuth(action: any) {
  return async (
    formData: FormData | null,
    postId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const post = await db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, postId),
      with: {
        site: true,
      },
    });

    if (!post || post.userId !== session.user.id) {
      return {
        error: "Post not found",
      };
    }

    return action(formData, post, key);
  };
}
