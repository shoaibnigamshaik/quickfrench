import { turso } from "../../../lib/turso";
export const dynamic = "force-static";
export const revalidate = 1296000;

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM verbs");
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching verbs:", error);
    return Response.json({ error: "Failed to fetch verbs" }, { status: 500 });
  }
}
