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
        SELECT b.word, b.meaning, bc.name as category 
        FROM body b 
        JOIN body_categories bc ON b.category_id = bc.id 
        WHERE bc.name = ? 
      `,
            args: [categoryName],
        });

        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching body by category:', error);
        return Response.json(
            { error: 'Failed to fetch body items' },
            { status: 500 },
        );
    }
}
