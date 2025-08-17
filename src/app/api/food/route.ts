import { turso } from "../../../lib/turso";
export const revalidate = 1296000; // 24 hours

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT f.word, f.meaning, fc.name as category
        FROM food f
        JOIN food_categories fc ON f.category_id = fc.id
      `,
    });
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching food:", error);
    return Response.json({ error: "Failed to fetch food" }, { status: 500 });
  }
}
