import OpenAI from "openai";
import type { RequestHandler } from "./$types";

export const config = {
  runtime: "edge",
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const requestData = await request.json();

    if (!requestData || !requestData.prompt || !requestData.key) {
      throw new Error("Prompt or key is missing");
    }
    const openai = new OpenAI({ apiKey: requestData.key });
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: requestData.prompt,
      response_format: "b64_json",
      style: requestData.style,
    });

    return new Response(JSON.stringify(image.data));
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};
