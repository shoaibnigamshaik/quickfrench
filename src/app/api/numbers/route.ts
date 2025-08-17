import { turso } from "../../../lib/turso";
export const dynamic = "force-static";
export const revalidate = 1296000;

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM numbers");
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching numbers:", error);
    return Response.json({ error: "Failed to fetch numbers" }, { status: 500 });
  }
}
