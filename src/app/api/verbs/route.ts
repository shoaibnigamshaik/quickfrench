import { handleApiQuery } from '@/lib/api-utils';
export const dynamic = 'force-static';
export const revalidate = 1296000;

export async function GET() {
    return handleApiQuery('SELECT * FROM verbs', 'Error fetching verbs');
}
