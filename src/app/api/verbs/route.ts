import { turso } from "../../../lib/turso";

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM verbs ORDER BY RANDOM()");
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching verbs:", error);
    return Response.json({ error: "Failed to fetch verbs" }, { status: 500 });
  }
}
