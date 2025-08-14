import { turso } from "../../../lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT e.word, e.meaning, ec.name as category
        FROM education e
        LEFT JOIN education_categories ec ON e.category_id = ec.id
      `,
    });
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching education:", error);
    return Response.json(
      { error: "Failed to fetch education" },
      { status: 500 },
    );
  }
}
