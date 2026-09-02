import type { User } from "@/types/user";

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthSession = {
  accessToken: string;
  user: User;
};
