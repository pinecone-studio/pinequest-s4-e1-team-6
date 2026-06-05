import { supabase } from "@/lib/api/supabase";

export async function POST(req: Request) {
  const { guestId, realUserId } = await req.json();

  const { data, error } = await supabase
    .from('chat_history')
    .update({ user_id: realUserId })
    .eq('user_id', guestId);

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ message: "History synced!" });
}