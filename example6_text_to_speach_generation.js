import 'dotenv/config';
import fs from 'fs';
import { inspect } from 'util';
import { parse } from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

export async function main() {
  const projectEndpoint =
    'https://andre-mfcm7k2f-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2025-03-01-preview';
  const modelDeploymentName = 'gpt-4o-mini-tts';
  const apiKey = process.env.AZURE_AI_FOUNDRY_GPT_4O_MINI_TTS_API_KEY;

  const postData = {
    model: modelDeploymentName,
    input: 'The nice house is surrounded by a large fence and the forest can be seen in the distance',
    voice: 'alloy'
  };

  const fetchResponse = await fetch(projectEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(postData)
  });

  let date = new Date();
  let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  let hour = new Intl.DateTimeFormat('en', { hour: '2-digit' }).format(date);
  let minute = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(date);
  let second = new Intl.DateTimeFormat('en', { second: '2-digit' }).format(date);
  const baseFileName = `generated_audio_${day}_${month}_${year}_${hour}.${minute}.${second}.mp3`;

  const audioWebReadableStream = await fetchResponse.body;
  const destination = `${import.meta.dirname}/downloads/${baseFileName}`;
  console.log(`Saving file ${destination}`);
  const outFileStream = fs.createWriteStream(destination, { flags: 'wx' });
  await finished(Readable.fromWeb(audioWebReadableStream).pipe(outFileStream));
}

try {
  main();
} catch (err) {
  console.error('The sample encountered an error:', err);
}
