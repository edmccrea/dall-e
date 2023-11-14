import { ENCRYPTION_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  return new Response(ENCRYPTION_KEY, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
