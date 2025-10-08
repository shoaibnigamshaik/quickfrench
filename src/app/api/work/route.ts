import { turso } from '@/lib/turso';
export const revalidate = 1296000;

export async function GET() {
    try {
        const result = await turso.execute({
            sql: `
        SELECT w.word, w.meaning, wc.name as category
        FROM work w
        LEFT JOIN work_categories wc ON w.category_id = wc.id
      `,
        });
        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching work:', error);
        return Response.json(
            { error: 'Failed to fetch work' },
            { status: 500 },
        );
    }
}
