import { handleApiQuery } from "@/lib/api-utils";
export const dynamic = "force-static";
export const revalidate = 1296000; // 15 days

export async function GET() {
  return handleApiQuery(
    "SELECT * FROM adjectives",
    "Error fetching adjectives",
  );
}
