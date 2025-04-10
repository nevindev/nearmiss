import type { PageLoad } from "./$types";
import { db } from "$lib/db";

export const load: PageLoad = async () => {
  const reports = await db.table("reports").toArray()
  return { reports }
}