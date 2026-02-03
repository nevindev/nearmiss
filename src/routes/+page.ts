import type { PageLoad } from "./$types";
import { db } from "$lib/db";
import type { Report } from "$lib/types";

export const load: PageLoad = async ({url, params}) => {
  const reports: Report[] = await db.table("reports").toArray()
  const id = url.searchParams.get('selected')
  const selected = await db.reports.get(Number(id))


  return {params, reports, selected}
}