// Configuração do Supabase usando variáveis de ambiente
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://knavbvrlstlkrljlyftx.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXZidnJsc3Rsa3Jsamx5ZnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzUyMDUsImV4cCI6MjA3MzUxMTIwNX0.gCKCvWNwYZt16ld4Spm0ZnX4jl9hnJC3coSoxD-PLfE',
};
// Função para obter a chave correta baseada no ambiente
export const getSupabaseKey = () => {
  // Sempre usar a chave anon em produção
  return SUPABASE_CONFIG.anonKey;
};
