import { request } from "./client";

export type User = { id: string; email: string; name: string };
export type Org = { id: string; name: string; slug: string; role: string };

export const authApi = {
  me: () => request<{ user: User }>("/v1/auth/me"),
  signup: (body: { email: string; password: string; name: string }) =>
    request<{ user: User; organization: { id: string } }>("/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ user: User }>("/v1/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ ok: boolean }>("/v1/auth/logout", { method: "POST" }),
  orgs: () => request<{ organizations: Org[] }>("/v1/orgs"),
};
