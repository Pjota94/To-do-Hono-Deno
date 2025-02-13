import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xeoqsvidfwsudiwiliev.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlb3FzdmlkZndzdWRpd2lsaWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMTkzODIsImV4cCI6MjA1NDc5NTM4Mn0.UWLVcHtVoQJ50AdtAa2eeGfSE-Avf47Z5VKXeesr_5w";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    const { data, error } = await supabase.from("todos").select("id, title");

  if (error) {
    console.error("❌ Erro ao conectar ao Supabase:", error);
  } else {
    console.log("✅ Conexão bem-sucedida! Dados obtidos:", JSON.stringify(data, null, 2));
  }
}



testConnection();
