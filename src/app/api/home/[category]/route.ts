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
        SELECT h.word, h.meaning, hc.name as category 
        FROM home h 
        JOIN home_categories hc ON h.category_id = hc.id 
        WHERE hc.name = ? 
      `,
      args: [categoryName],
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching home by category:", error);
    return Response.json(
      { error: "Failed to fetch home items" },
      { status: 500 },
    );
  }
}
