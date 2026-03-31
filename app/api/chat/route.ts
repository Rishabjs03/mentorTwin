import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { openAI } from "@/lib/openai";
import { embedText } from "@/lib/embed";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { message, mentorId, conversationHistory } = await req.json();

  const queryEmbedding = await embedText(message);

  const { data: chunks, error: chunkError } = await supabaseAdmin.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    mentor_id_filter: mentorId,
    match_threshold: 0.3,
    match_count: 4,
  });

  if (chunkError) {
    console.error("Error fetching relevant chunks:", chunkError);
    return new Response("Error fetching relevant knowledge", { status: 500 });
  }

  const { data: mentor } = await supabaseAdmin
    .from("mentors")
    .select("name, title, company, bio, expertise_tags")
    .eq("id", mentorId)
    .single();

    type Chunk = { source_label: string; content: string }
    const chunksTyped = (chunks as Chunk[]) || []

    const relevantKnowledge = chunksTyped.length > 0
      ? chunksTyped.map(c => `[${c.source_label}]:\n${c.content}`).join('\n\n')
      : null

  const systemPrompt = `You are the AI Twin of ${mentor?.name}, a ${mentor?.title} at ${mentor?.company} and mentor on ADPList.

About ${mentor?.name}: ${mentor?.bio}

Your expertise: ${mentor?.expertise_tags?.join(", ")}

${relevantKnowledge
    ? `Answer based ONLY on the following session knowledge from ${mentor?.name}'s actual mentorship sessions:\n\n${relevantKnowledge}\n\nStay faithful to their voice and perspective. Be direct, warm, and practical.`
    : `You don't have session knowledge directly relevant to this question. Say something like: "I haven't covered this in depth in my sessions yet — for this one, I'd recommend booking a live session with me so I can give you my full attention."`
  }

Keep responses to 2–3 short paragraphs. Never fabricate advice ${mentor?.name} hasn't given.`;

  const response = await openAI.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ],
    max_completion_tokens: 500,
  });

  const sources = chunksTyped.map(c => c.source_label)

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`)
      );

      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`)
          );
        }
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
