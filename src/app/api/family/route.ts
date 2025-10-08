import { turso } from "@/lib/turso";
export const revalidate = 1296000;

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT f.word, f.meaning, fc.name as category
        FROM family f
        JOIN family_categories fc ON f.category_id = fc.id
      `,
    });
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching family:", error);
    return Response.json({ error: "Failed to fetch family" }, { status: 500 });
  }
}
