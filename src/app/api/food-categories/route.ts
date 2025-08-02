import { turso } from "../../../lib/turso";

export async function GET() {
  try {
    const result = await turso.execute(
      "SELECT * FROM food_categories ORDER BY name",
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching food categories:", error);
    return Response.json(
      { error: "Failed to fetch food categories" },
      { status: 500 },
    );
  }
}
