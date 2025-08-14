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
        SELECT n.word, n.meaning, nc.name as category 
        FROM nature n 
        JOIN nature_categories nc ON n.category_id = nc.id 
        WHERE nc.name = ? 
      `,
      args: [categoryName],
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching nature by category:", error);
    return Response.json(
      { error: "Failed to fetch nature items" },
      { status: 500 },
    );
  }
}
