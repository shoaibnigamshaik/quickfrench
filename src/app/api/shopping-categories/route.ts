import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute(
      "SELECT * FROM shopping_categories ORDER BY name",
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching shopping categories:", error);
    return Response.json(
      { error: "Failed to fetch shopping categories" },
      { status: 500 },
    );
  }
}
