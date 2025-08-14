import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM transportation");
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching transportation:", error);
    return Response.json(
      { error: "Failed to fetch transportation" },
      { status: 500 },
    );
  }
}
