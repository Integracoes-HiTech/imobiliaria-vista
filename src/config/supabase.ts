// Configuração do Supabase
export const SUPABASE_CONFIG = {
  url: 'https://knavbvrlstlkrljlyftx.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXZidnJsc3Rsa3Jsamx5ZnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzUyMDUsImV4cCI6MjA3MzUxMTIwNX0.example_key_here',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXZidnJsc3Rsa3Jsamx5ZnR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkzNTIwNSwiZXhwIjoyMDczNTExMjA1fQ.LbSbTHCfs4uLnLTkU5bnZG5fTy_j5o_Bh_lYjGXWxgs'
};

// Função para obter a chave correta baseada no ambiente
export const getSupabaseKey = () => {
  // Em produção, use a chave anon
  // Em desenvolvimento, podemos usar a service key para testes
  return import.meta.env.DEV 
    ? SUPABASE_CONFIG.serviceKey 
    : SUPABASE_CONFIG.anonKey;
};
