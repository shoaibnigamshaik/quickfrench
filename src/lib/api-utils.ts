import { turso } from "./turso";

export async function handleApiQuery(
  sql: string | { sql: string },
  errorMessage: string,
) {
  try {
    const result = await turso.execute(sql);
    return Response.json(result.rows);
  } catch (error) {
    console.error(errorMessage, error);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}