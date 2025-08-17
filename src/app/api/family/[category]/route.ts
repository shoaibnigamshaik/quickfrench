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
        SELECT f.word, f.meaning, fc.name as category 
        FROM family f 
        JOIN family_categories fc ON f.category_id = fc.id 
        WHERE fc.name = ? 
      `,
      args: [categoryName],
    });

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching family by category:", error);
    return Response.json(
      { error: "Failed to fetch family items" },
      { status: 500 },
    );
  }
}
