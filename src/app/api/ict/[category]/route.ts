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
        SELECT i.word, i.meaning, ic.name as category 
        FROM ict i 
        JOIN ict_categories ic ON i.category_id = ic.id 
        WHERE ic.name = ? 
      `,
      args: [categoryName],
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching ict by category:", error);
    return Response.json(
      { error: "Failed to fetch ict items" },
      { status: 500 },
    );
  }
}
