import { ChatGroq } from "@langchain/groq";
import { HttpResponseOutputParser } from "langchain/output_parsers";

const model = new ChatGroq({
  apiKey: "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",
  model: "llama3-8b-8192",
  temperature: 0.8,
});

const handler = async () => {
  const parser = new HttpResponseOutputParser();

  const stream = await model.pipe(parser).stream("Hello there!");

  const httpResponse = new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
  console.log(httpResponse);
  return httpResponse;
};

await handler();