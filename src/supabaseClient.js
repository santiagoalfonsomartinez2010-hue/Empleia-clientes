import { createClient } from '@supabase/supabase-js'

/*
  Cliente de Supabase configurado a partir de las variables del archivo .env
  (o de las variables de entorno del despliegue en Vercel).
  Vite solo expone al navegador las variables que empiezan por VITE_.
*/

// .trim() defiende contra espacios o saltos de línea que se cuelan al pegar
// los valores en el panel de Vercel (una causa habitual de que createClient
// lance un error y la app no arranque).
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)

/*
  Cliente "señuelo": si Supabase no se puede inicializar (faltan variables o son
  inválidas), devolvemos un objeto que lanza un error descriptivo al usarse.
  Así la app arranca igualmente y muestra un mensaje, en vez de quedarse colgada
  en "Cargando…" (el createClient fallido rompía el arranque antes de pintar).
*/
function clienteSinConfigurar(motivo) {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(motivo)
      },
    }
  )
}

let supabase

if (!supabaseConfigurado) {
  console.error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Configúralas en Vercel ' +
      '(Settings → Environment Variables) y vuelve a desplegar.'
  )
  supabase = clienteSinConfigurar(
    'La app no está configurada: faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
      'Añádelas en Vercel y vuelve a desplegar (Redeploy).'
  )
} else {
  try {
    // Envuelto en try/catch: una URL/clave malformada ya no rompe el arranque
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.error('Error al inicializar Supabase:', err)
    supabase = clienteSinConfigurar(
      'No se pudo inicializar Supabase: revisa que VITE_SUPABASE_URL y ' +
        'VITE_SUPABASE_ANON_KEY estén bien copiadas (sin espacios ni saltos de ' +
        'línea) en Vercel. Detalle: ' +
        err.message
    )
  }
}

export { supabase }
