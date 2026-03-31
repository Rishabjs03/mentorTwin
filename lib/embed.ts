import { openAI } from "./openai";

export async function embedText(text: string){
    const response = await openAI.embeddings.create({
        input: text,
        model: "text-embedding-3-small"
    })
    return response.data[0].embedding;
}