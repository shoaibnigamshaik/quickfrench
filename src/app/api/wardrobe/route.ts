import { turso } from '@/lib/turso';
export const dynamic = 'force-static';
export const revalidate = 1296000;

export async function GET() {
    try {
        const result = await turso.execute('SELECT * FROM wardrobe');
        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching wardrobe:', error);
        return Response.json(
            { error: 'Failed to fetch wardrobe' },
            { status: 500 },
        );
    }
}
