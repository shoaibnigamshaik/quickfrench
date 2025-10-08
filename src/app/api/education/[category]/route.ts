import { turso } from '@/lib/turso';
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
        SELECT e.word, e.meaning, ec.name as category
        FROM education e
        LEFT JOIN education_categories ec ON e.category_id = ec.id
        WHERE ec.name = ?
      `,
            args: [categoryName],
        });

        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching education by category:', error);
        return Response.json(
            { error: 'Failed to fetch education items' },
            { status: 500 },
        );
    }
}
