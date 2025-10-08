import { handleApiQuery } from "@/lib/api-utils";
export const revalidate = 1296000;

export async function GET() {
  return handleApiQuery(
    {
      sql: `
        SELECT e.word, e.meaning, ec.name as category
        FROM education e
        LEFT JOIN education_categories ec ON e.category_id = ec.id
      `,
    },
    "Error fetching education",
  );
}
