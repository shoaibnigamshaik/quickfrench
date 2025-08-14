import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM colours");
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching colours:", error);
    return Response.json({ error: "Failed to fetch colours" }, { status: 500 });
  }
}
