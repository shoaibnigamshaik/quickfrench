import { turso } from "@/lib/turso";
export const revalidate = 1296000;

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT n.word, n.meaning, nc.name as category
        FROM nature n
        LEFT JOIN nature_categories nc ON n.category_id = nc.id
      `,
    });
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching nature:", error);
    return Response.json({ error: "Failed to fetch nature" }, { status: 500 });
  }
}
