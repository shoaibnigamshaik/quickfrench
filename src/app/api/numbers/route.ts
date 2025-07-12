import { turso } from '../../../lib/turso';

export async function GET() {
  try {
    const result = await turso.execute('SELECT * FROM numbers ORDER BY RANDOM()');
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch numbers' }, { status: 500 });
  }
}