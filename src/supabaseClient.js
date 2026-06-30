import { createClient } from '@supabase/supabase-js'

/*
  Cliente de Supabase configurado a partir de las variables del archivo .env.
  Vite solo expone al navegador las variables que empiezan por VITE_.
*/
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Aviso temprano si falta configuración (ayuda a depurar en desarrollo)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Revisa tu archivo .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
