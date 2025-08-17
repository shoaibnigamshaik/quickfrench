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
        SELECT w.word, w.meaning, wc.name as category
        FROM work w
        LEFT JOIN work_categories wc ON w.category_id = wc.id
        WHERE wc.name = ?
      `,
      args: [categoryName],
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching work by category:", error);
    return Response.json(
      { error: "Failed to fetch work items" },
      { status: 500 },
    );
  }
}
