import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute(
      "SELECT * FROM education_categories ORDER BY name",
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching education categories:", error);
    return Response.json(
      { error: "Failed to fetch education categories" },
      { status: 500 },
    );
  }
}
