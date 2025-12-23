import { streamText } from "ai";

export async function migrateCode(code: string) {
  return streamText({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a cloud migration refactoring agent.
Convert AWS Lambda (Python) to GCP Cloud Functions.
Return JSON:
{
  converted: [],
  manual: [],
  unsupported: []
}
`
      },
      {
        role: "user",
        content: code
      }
    ]
  });
}
