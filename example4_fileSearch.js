// Largely inspired from Microsoft Corporation: https://github.com/Azure/azure-sdk-for-js/blob/%40azure/ai-agents_1.1.0/sdk/ai/ai-agents/samples/v1-beta/javascript/fileSearch.js

/**
 * This sample demonstrates how to use agent operations with file searching from the Azure Agents service.
 *
 * @summary This sample demonstrates how to use agent operations with file searching.
 */

import "dotenv/config";
import fs from "fs";

import { AgentsClient, isOutputOfType, ToolUtility } from "@azure/ai-agents";
import { DefaultAzureCredential } from "@azure/identity";


const projectEndpoint = "https://rs-aifoundry-1.services.ai.azure.com/api/projects/prj-aifoundry-1";
const modelDeploymentName = "gpt-4o-mini";

export async function main() {
  // Create an Azure AI Client
  const client = new AgentsClient(projectEndpoint, new DefaultAzureCredential());

  // Upload file
  const filePath = `${import.meta.dirname}/data/sampleFileForUpload.txt`;
  const localFileStream = fs.createReadStream(filePath);
  const file = await client.files.upload(localFileStream, "assistants", {
    fileName: "sampleFileForUpload.txt",
  });
  console.log(`Uploaded file, file ID: ${file.id}`);

  // Create vector store
  const vectorStore = await client.vectorStores.create({
    fileIds: [file.id],
    name: "myVectorStore",
  });
  console.log(`Created vector store, vector store ID: ${vectorStore.id}`);

  // Initialize file search tool
  const fileSearchTool = ToolUtility.createFileSearchTool([vectorStore.id]);

  // Create agent with files
  const agent = await client.createAgent(modelDeploymentName, {
    name: "File Search Agent",
    instructions: "You are helpful agent that can help fetch data from files you know about.",
    tools: [fileSearchTool.definition],
    toolResources: fileSearchTool.resources,
  });
  console.log(`Created agent, agent ID : ${agent.id}`);

  // Create thread
  const thread = await client.threads.create();
  console.log(`Created thread, thread ID: ${thread.id}`);

  // Create message
  const message = await client.messages.create(
    thread.id,
    "user",
    "Can you give me the documented codes for 'banana' and 'orange'?",
  );
  console.log(`Created message, message ID: ${message.id}`);

  // Create and poll a run
  console.log("Creating run...");
  const run = await client.runs.createAndPoll(thread.id, agent.id, {
    pollingOptions: {
      intervalInMs: 2000,
    },
    onResponse: (response) => {
      console.log(`Received response with status: ${response.parsedBody.status}`);
    },
  });
  console.log(`Run finished with status: ${run.status}`);

  const messages = await client.messages.list(thread.id);
  for await (const threadMessage of messages) {
    console.log(
      `Thread Message Created at  - ${threadMessage.createdAt} - Role - ${threadMessage.role}`,
    );
    threadMessage.content.forEach((content) => {
      if (isOutputOfType(content, "text")) {
        console.log(`Text Message Content - ${content.text.value}`);
      } else if (isOutputOfType(content, "image_file")) {
        console.log(`Image Message Content - ${content.imageFile.fileId}`);
      }
    });
  }

  // Delete agent
  await client.deleteAgent(agent.id);
  console.log(`Deleted agent, agent ID: ${agent.id}`);
}

try {
  main();
} catch(err) {
  console.error("The sample encountered an error:", err);
}
