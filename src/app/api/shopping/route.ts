import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT s.word, s.meaning, sc.name as category
        FROM shopping s
        LEFT JOIN shopping_categories sc ON s.category_id = sc.id
        ORDER BY RANDOM()
      `,
    });
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching shopping:", error);
    return Response.json({ error: "Failed to fetch shopping" }, { status: 500 });
  }
}
