import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM adverbs");
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching adverbs:", error);
    return Response.json({ error: "Failed to fetch adverbs" }, { status: 500 });
  }
}
