import "dotenv/config";
import { AzureOpenAI } from "openai";

const apiKey = process.env.AZURE_AI_FOUNDRY_API_KEY;
const apiVersion = "2024-04-01-preview";
const endpoint = "https://rs-aifoundry-1.cognitiveservices.azure.com/";
const modelName = "gpt-4o-mini";
const deployment = "gpt-4o-mini";
const options = { endpoint, apiKey, deployment, apiVersion };

export async function main() {
  const client = new AzureOpenAI(options);

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "I am going to Athens, what should I see?" },
    ],
    max_tokens: 4096,
    temperature: 1,
    top_p: 1,
    model: modelName,
  });

  if (response?.error !== undefined && response.status !== "200") {
    throw response.error;
  }
  console.log(response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
