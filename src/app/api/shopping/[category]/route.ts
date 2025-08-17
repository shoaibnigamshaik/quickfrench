import { turso } from "../../../../lib/turso";
export const revalidate = 1296000;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  try {
    const { category } = await params;
    const categoryName = decodeURIComponent(category);

    const result = await turso.execute({
      sql: `
        SELECT s.word, s.meaning, sc.name as category
        FROM shopping s
        LEFT JOIN shopping_categories sc ON s.category_id = sc.id
        WHERE sc.name = ?
      `,
      args: [categoryName],
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching shopping by category:", error);
    return Response.json(
      { error: "Failed to fetch shopping items" },
      { status: 500 },
    );
  }
}
