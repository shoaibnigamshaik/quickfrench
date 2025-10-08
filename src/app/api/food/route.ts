import { handleApiQuery } from "@/lib/api-utils";
export const revalidate = 1296000; // 24 hours

export async function GET() {
  return handleApiQuery(
    {
      sql: `
        SELECT f.word, f.meaning, fc.name as category
        FROM food f
        JOIN food_categories fc ON f.category_id = fc.id
      `,
    },
    "Error fetching food",
  );
}
