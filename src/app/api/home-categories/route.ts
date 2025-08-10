import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute(
      "SELECT * FROM home_categories ORDER BY name",
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching home categories:", error);
    return Response.json(
      { error: "Failed to fetch home categories" },
      { status: 500 },
    );
  }
}
