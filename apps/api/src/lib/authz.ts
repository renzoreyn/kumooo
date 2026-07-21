import { orgMembers, sites, type Db } from "@kumooo/db";
import { and, eq } from "drizzle-orm";
import type { Role } from "@kumooo/core";
import { ApiError } from "../errors.js";

const rank: Record<Role, number> = {
  viewer: 1,
  author: 2,
  editor: 3,
  admin: 4,
  owner: 5,
};

export async function requireOrgRole(db: Db, orgId: string, userId: string, min: Role) {
  const row = (
    await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)))
  )[0];
  if (!row || rank[row.role as Role] < rank[min]) {
    throw ApiError.forbidden(`You need the ${min} role (or higher) for that.`);
  }
  return row.role as Role;
}

export async function requireSiteAccess(db: Db, siteId: string, userId: string, min: Role) {
  const site = (await db.select().from(sites).where(eq(sites.id, siteId)))[0];
  if (!site) throw ApiError.notFound("Site not found.");
  const role = await requireOrgRole(db, site.orgId, userId, min);
  return { site, role };
}
