import { handleApiQuery } from "../../../lib/api-utils";
export const revalidate = 1296000;

export async function GET() {
  return handleApiQuery(
    "SELECT * FROM food_categories ORDER BY name",
    "Error fetching food categories",
  );
}
