import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute(
      "SELECT * FROM wardrobe ORDER BY RANDOM()",
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching wardrobe:", error);
    return Response.json(
      { error: "Failed to fetch wardrobe" },
      { status: 500 },
    );
  }
}
