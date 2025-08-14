import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT b.word, b.meaning, bc.name as category
        FROM body b
        LEFT JOIN body_categories bc ON b.category_id = bc.id
      `,
    });
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching body:", error);
    return Response.json({ error: "Failed to fetch body" }, { status: 500 });
  }
}
