import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute(
      "SELECT * FROM numbers ORDER BY RANDOM()",
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching numbers:", error);
    return Response.json({ error: "Failed to fetch numbers" }, { status: 500 });
  }
}
