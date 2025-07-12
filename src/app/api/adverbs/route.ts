import { turso } from "../../../lib/turso";

export async function GET() {
  try {
    const result = await turso.execute(
      "SELECT * FROM adverbs ORDER BY RANDOM()",
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching adverbs:", error);
    return Response.json({ error: "Failed to fetch adverbs" }, { status: 500 });
  }
}
