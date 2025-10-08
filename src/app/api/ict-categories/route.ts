import { turso } from "@/lib/turso";
export const revalidate = 1296000;

export async function GET() {
  try {
    const result = await turso.execute(
      "SELECT * FROM ict_categories ORDER BY name",
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching ict categories:", error);
    return Response.json(
      { error: "Failed to fetch ict categories" },
      { status: 500 },
    );
  }
}
