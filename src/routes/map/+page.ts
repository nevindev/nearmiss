import type { PageLoad } from "./$types";
// import type { AnonymousUser } from "$lib/types";
import { db } from "$lib/db";
import { registerAnonymous } from "$lib/api";

export const load: PageLoad = async () => {
  const reports = await db.table("reports").toArray()
  return { reports }
}