import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM buildings");
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return Response.json(
      { error: "Failed to fetch buildings" },
      { status: 500 },
    );
  }
}
