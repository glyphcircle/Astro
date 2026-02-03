
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

declare const Deno: {
  env: { get(key: string): string | undefined; };
  serve(handler: (req: Request) => Promise<Response>): void;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No Authorization header provided.");

    const payload = await req.json();
    const table = payload.target_table || payload.table;
    const updates = payload.updates;

    if (!table || !Array.isArray(updates)) {
      throw new Error("Invalid payload structure.");
    }

    // 1. Verify Admin Status via JWT RPC
    const userClient = createClient(SUPABASE_URL, authHeader.replace("Bearer ", ""), {
      auth: { persistSession: false },
    });

    const { data: isAdmin, error: authError } = await userClient.rpc("is_jwt_admin");
    
    if (authError || !isAdmin) {
      console.error("Auth Denied:", authError || "Not an admin");
      return new Response(JSON.stringify({ error: "Unauthorized access denied." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Perform Service Role Update
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Ensure we send 'fields' to the RPC
    const processedUpdates = updates.map(u => ({
      id: u.id,
      fields: u.fields || u.changes || {}
    }));

    console.info(`Processing batch for ${table}: ${processedUpdates.length} items.`);

    const { data, error: rpcError } = await adminClient.rpc("update_records_batch", {
      target_table: table,
      updates: processedUpdates
    });

    if (rpcError) {
        console.error("Database RPC Error:", rpcError);
        throw rpcError;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Critical Function Failure:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
