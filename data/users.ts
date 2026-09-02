import { hashPassword } from "@/lib/auth/password";
import type { User } from "@/types/user";

type StoredUser = User & { email: string; passwordHash: string };

// Demo credentials for local testing / E2E: demo@example.com / password123
const users: StoredUser[] = [
  {
    id: "user-1",
    name: "Demo User",
    email: "demo@example.com",
    avatarUrl: null,
    country: "US",
    passwordHash: hashPassword("password123"),
  },
];

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.find((user) => user.email === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const user = users.find((entry) => entry.id === id);
  if (!user) return undefined;
  return { id: user.id, name: user.name, avatarUrl: user.avatarUrl, country: user.country };
}
