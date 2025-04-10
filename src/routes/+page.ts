import type { PageLoad } from "./$types";
// import type { AnonymousUser } from "$lib/types";
import { db } from "$lib/db";
import { registerAnonymous } from "$lib/api";

export const load: PageLoad = async () => {
  const reports = await db.table("reports").toArray()
  let user_id = localStorage.getItem("user_id");
  if (!user_id || user_id === "undefined") {
    const id = await registerAnonymous() as string
    localStorage.setItem("user_id", id);
    user_id = id

  }
  console.log(user_id)
  return { user_id, reports }
}