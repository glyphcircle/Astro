
import { createClient } from "npm:@supabase/supabase-js@2.33.0";

// Fix: Declaring Deno as a global variable to fix compilation errors in non-Deno-aware TypeScript environments.
declare const Deno: any;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "admin-exports";
const EXPIRY = 86400; // 24 hours

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) throw new Error("user_id is required");

    // 2. Auth Check: Use the caller's token to verify they are an admin
    const userClient = createClient(SUPABASE_URL, authHeader.replace("Bearer ", ""), { auth: { persistSession: false } });
    const { data: isAdmin } = await userClient.rpc("check_is_admin");
    
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized: Admin only" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    // 3. Service Role Client: Bypass RLS for data gathering
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    // 4. Gather Data
    const tables = ["mood_entries", "feedback", "readings", "user_subscriptions", "profiles"];
    const exportData: Record<string, any> = { exported_at: new Date().toISOString(), user_id };

    for (const table of tables) {
      const { data } = await adminClient.from(table).select("*").eq(table === "profiles" ? "id" : "user_id", user_id);
      exportData[table] = data || [];
    }

    // 5. Upload to Storage
    const fileName = `export-${user_id}-${Date.now()}.json`;
    const filePath = `${user_id}/${fileName}`;
    
    const { error: uploadError } = await adminClient.storage.from(BUCKET).upload(filePath, JSON.stringify(exportData, null, 2), {
      contentType: "application/json",
      upsert: true
    });

    if (uploadError) throw uploadError;

    // 6. Generate Signed URL
    const { data: urlData, error: urlError } = await adminClient.storage.from(BUCKET).createSignedUrl(filePath, EXPIRY);
    if (urlError) throw urlError;

    return new Response(JSON.stringify({ fileKey: filePath, signedUrl: urlData.signedUrl, expiresIn: EXPIRY }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 500
    });
  }
});
