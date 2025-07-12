import { turso } from '../../../lib/turso';

export async function GET() {
  try {
    const result = await turso.execute('SELECT * FROM prepositions ORDER BY RANDOM()');
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch prepositions' }, { status: 500 });
  }
}