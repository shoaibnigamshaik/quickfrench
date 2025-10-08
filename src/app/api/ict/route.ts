import { turso } from '@/lib/turso';
export const revalidate = 1296000;

export async function GET() {
    try {
        const result = await turso.execute({
            sql: `
        SELECT i.word, i.meaning, ic.name as category
        FROM ict i
        LEFT JOIN ict_categories ic ON i.category_id = ic.id
      `,
        });
        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching ict:', error);
        return Response.json({ error: 'Failed to fetch ict' }, { status: 500 });
    }
}
