import { turso } from "../../../../lib/turso";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  try {
    const { category } = await params;
    const categoryName = decodeURIComponent(category);

    const result = await turso.execute({
      sql: `
        SELECT f.word, f.meaning, fc.name as category 
        FROM food f 
        JOIN food_categories fc ON f.category_id = fc.id 
        WHERE fc.name = ? 
        ORDER BY RANDOM()
      `,
      args: [categoryName],
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching food by category:", error);
    return Response.json(
      { error: "Failed to fetch food items" },
      { status: 500 },
    );
  }
}
