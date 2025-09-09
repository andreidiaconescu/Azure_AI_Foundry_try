// Largely inspired from Microsoft code samples: https://github.com/Azure/azure-sdk-for-js/blob/%40azure/ai-agents_1.1.0/sdk/ai/ai-agents/samples/v1-beta/javascript/codeInterpreter.js

/**
 * This sample demonstrates how to use agent operations with code interpreter from the Azure Agents service.
 *
 * @summary demonstrates how to use agent operations with code interpreter.
 */

import "dotenv/config";
import fs from "node:fs";
import { AgentsClient, isOutputOfType, ToolUtility } from "@azure/ai-agents";
import { DefaultAzureCredential } from "@azure/identity";

// const projectEndpoint = "https://rs-aifoundry-1.cognitiveservices.azure.com/";
const projectEndpoint = "https://rs-aifoundry-1.services.ai.azure.com/api/projects/prj-aifoundry-1";
const modelDeploymentName = "gpt-4o-mini";

export async function main() {
  // Create an Azure AI Client
  const client = new AgentsClient(
    projectEndpoint,
    new DefaultAzureCredential()
    // {
    //   // The API version should match the version of the Azure OpenAI resource
    //   apiVersion: "2024-12-01-preview",
    // }
  );

  debugger;
  // Upload file and wait for it to be processed
  const filePath =
    `${import.meta.dirname}/data/syntheticCompanyQuarterlyResults.csv`;
  console.log('filePath', filePath);
  const localFileStream = fs.createReadStream(filePath);
  // console.log('localFileStream', localFileStream);
  const localFile = await client.files.upload(localFileStream, "assistants", {
    fileName: "localFile",
  });

  console.log(`Uploaded local file, file ID : ${localFile.id}`);

  // Create code interpreter tool
  const codeInterpreterTool = ToolUtility.createCodeInterpreterTool([
    localFile.id,
  ]);

  // Notice that CodeInterpreter must be enabled in the agent creation, otherwise the agent will not be able to see the file attachment
  const agent = await client.createAgent(modelDeploymentName, {
    name: "my-agent",
    instructions: "You are a helpful agent",
    tools: [codeInterpreterTool.definition],
    toolResources: codeInterpreterTool.resources,
  });
  console.log(`Created agent, agent ID: ${agent.id}`);

  // Create a thread
  const thread = await client.threads.create();
  console.log(`Created thread, thread ID: ${thread.id}`);

  // Create a message
  const message = await client.messages.create(
    thread.id,
    "user",
    "Could you please create a bar chart in the TRANSPORTATION  sector for the operating profit from the uploaded CSV file and provide the file to me?",
    {
      attachments: [
        {
          fileId: localFile.id,
          tools: [codeInterpreterTool.definition],
        },
      ],
    }
  );

  console.log(`Created message, message ID: ${message.id}`);

  // Create and poll a run
  console.log("Creating run...");
  const run = await client.runs.createAndPoll(thread.id, agent.id, {
    pollingOptions: {
      intervalInMs: 2000,
    },
    onResponse: (response) => {
      console.log(
        `Received response with status: ${response.parsedBody.status}`
      );
    },
  });
  console.log(`Run finished with status: ${run.status}`);

  // Delete the original file from the agent to free up space (note: this does not delete your version of the file)
  await client.files.delete(localFile.id);
  console.log(`Deleted file, file ID: ${localFile.id}`);

  // Print the messages from the agent
  const messagesIterator = client.messages.list(thread.id);
  for await (const m of messagesIterator) {
    console.log(`Role: ${m.role}, Content: ${m.content}`);
    if (m.role === "assistant") {
      const textContent = m.content.find((content) =>
        isOutputOfType(content, "text")
      );
      if (textContent) {
        console.log(`Last message: ${textContent.text.value}`);
      }
    }
  }

  // Delete the agent once done
  await client.deleteAgent(agent.id);
  console.log(`Deleted agent, agent ID: ${agent.id}`);
}

try {
  main();
} catch (err) {
  console.error("The sample encountered an error:", err);
}
