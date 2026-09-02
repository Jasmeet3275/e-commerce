import { findUserByEmail, findUserById } from "@/data/users";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/auth/tokens";
import type { AuthSession, LoginInput } from "@/types/auth";

export async function login(
  input: LoginInput,
): Promise<{ session: AuthSession; refreshToken: string } | { error: "invalid_credentials" }> {
  const storedUser = findUserByEmail(input.email);
  if (!storedUser || !verifyPassword(input.password, storedUser.passwordHash)) {
    return { error: "invalid_credentials" };
  }

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(storedUser.id),
    signRefreshToken(storedUser.id),
  ]);

  return {
    session: {
      accessToken,
      user: {
        id: storedUser.id,
        name: storedUser.name,
        avatarUrl: storedUser.avatarUrl,
        country: storedUser.country,
      },
    },
    refreshToken,
  };
}

export async function refresh(
  refreshToken: string,
): Promise<{ session: AuthSession } | { error: "invalid_token" }> {
  const payload = await verifyToken(refreshToken);
  if (!payload) return { error: "invalid_token" };

  const user = findUserById(payload.sub);
  if (!user) return { error: "invalid_token" };

  const accessToken = await signAccessToken(user.id);
  return { session: { accessToken, user } };
}
