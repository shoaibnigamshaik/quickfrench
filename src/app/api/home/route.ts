import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT h.word, h.meaning, hc.name as category
        FROM home h
        JOIN home_categories hc ON h.category_id = hc.id
        ORDER BY RANDOM()
      `,
    });
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching home:", error);
    return Response.json({ error: "Failed to fetch home" }, { status: 500 });
  }
}
