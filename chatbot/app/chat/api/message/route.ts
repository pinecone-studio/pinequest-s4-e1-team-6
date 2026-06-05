import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

async function generateReply(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI shopping assistant.",
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  return completion.choices[0].message.content || "Хариу олдсонгүй";
}
