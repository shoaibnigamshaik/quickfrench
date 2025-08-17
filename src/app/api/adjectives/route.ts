import { turso } from "../../../lib/turso";
export const dynamic = "force-static";
export const revalidate = 1296000; // 15 days

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM adjectives");
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching adjectives:", error);
    return Response.json(
      { error: "Failed to fetch adjectives" },
      { status: 500 },
    );
  }
}
