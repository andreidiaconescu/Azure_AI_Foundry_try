import "dotenv/config";
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

// Get the Azure AI endpoint and deployment name from environment variables
const endpoint = process.env.PROJECT_ENDPOINT;
const deployment = process.env.MODEL_DEPLOYMENT_NAME || "gpt-4o";

// Create an Azure OpenAI Client
const project = new AIProjectClient(endpoint, new DefaultAzureCredential());
const client = await project.getAzureOpenAIClient({
  // The API version should match the version of the Azure OpenAI resource
  apiVersion: "2024-12-01-preview",
});

// Create a chat completion
const chatCompletion = await client.chat.completions.create({
  model: deployment,
  messages: [
    // { role: "system", content: "You are a helpful writing assistant" },
    { role: "user", content: "Write me a poem about flowers" },
  ],
});
console.log(
  `\n==================== 🌷 COMPLETIONS POEM ====================\n`
);
console.log(chatCompletion.choices[0].message.content);
