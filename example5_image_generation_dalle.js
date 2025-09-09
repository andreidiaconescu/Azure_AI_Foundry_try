import 'dotenv/config';
import fs from 'fs';
import { inspect } from 'util';
import {parse} from 'path';
import {Readable} from 'stream';
import {finished} from 'stream/promises'

export async function main() {
  const projectEndpoint = 'https://rs-aifoundry-1.cognitiveservices.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2024-02-01';
  const modelDeploymentName = 'dall-e-3';
  const apiKey = process.env.AZURE_AI_FOUNDRY_DALLE_API_KEY;

  const postData = {
    model: modelDeploymentName,
    prompt:
      'A photograph of a concrete house on a hill near a forest on a bright day. The roof is not straight, but is sharp like in traditional houses. The roof is covered ceramic tiles. There is a garder of 20 meters wide around the house with grass but no other vegetation. This garden is surounded by a wooden fance. There is a well in garden of the house.',
    size: '1024x1024',
    style: 'vivid',
    quality: 'standard',
    n: 1
  };

  const fetchResponse = await fetch(projectEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(postData)
  });

  const fetchResult = await fetchResponse.json();
  console.log(`${import.meta.filename} fetchResult`, inspect(fetchResult, { depth: 20 }));

  const generatedImageUrl = fetchResult?.data?.[0]?.url;

  console.log('Trying to download generated image', generatedImageUrl);
  if (!generatedImageUrl) {
    console.error('Image url not valid');
    return;
  }
  const urlGenImage = new URL(generatedImageUrl);
  // console.log('urlGenImage', urlGenImage);

  const baseFileName = parse(urlGenImage.pathname).base;

  const imageFetchResponse = await fetch(generatedImageUrl);
  const imageWebReadableStream = await imageFetchResponse.body;
  const destination = `${import.meta.dirname}/downloads/${baseFileName}`;
  console.log(`Saving file ${destination}`);
  const outFileStream = fs.createWriteStream(destination, { flags: 'wx' });
  await finished(Readable.fromWeb(imageWebReadableStream).pipe(outFileStream));
}

try {
  main();
} catch (err) {
  console.error('The sample encountered an error:', err);
}
