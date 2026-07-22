import { newId } from "@kumooo/core";
import { siteEvents, type Db } from "@kumooo/db";

export async function recordSiteEvent(
  db: Db,
  input: {
    siteId: string;
    actorId?: string | null;
    type: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await db.insert(siteEvents).values({
    id: newId("evt"),
    siteId: input.siteId,
    actorId: input.actorId ?? null,
    type: input.type,
    resourceType: input.resourceType ?? null,
    resourceId: input.resourceId ?? null,
    metadata: JSON.stringify(input.metadata ?? {}),
  });
}
