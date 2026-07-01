import { createClient } from '@supabase/supabase-js'

/*
  Cliente de Supabase configurado a partir de las variables del archivo .env
  (o de las variables de entorno del despliegue en Vercel).
  Vite solo expone al navegador las variables que empiezan por VITE_.
*/
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigurado) {
  console.error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Configúralas en el .env ' +
      '(local) o en las variables de entorno de Vercel y vuelve a desplegar.'
  )
}

/*
  Si faltan las variables, devolvemos un cliente "señuelo" que lanza un error
  descriptivo la primera vez que se usa. Así evitamos que createClient() rompa
  el arranque de toda la app (que se vería como una pantalla en negro): en su
  lugar, la interfaz muestra un mensaje explicando qué configurar.
*/
function clienteSinConfigurar() {
  const mensaje =
    'La app no está configurada: faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY ' +
    'en el despliegue. Añádelas en Vercel (Settings → Environment Variables) y vuelve ' +
    'a desplegar con Redeploy.'
  return new Proxy(
    {},
    {
      get() {
        throw new Error(mensaje)
      },
    }
  )
}

export const supabase = supabaseConfigurado
  ? createClient(supabaseUrl, supabaseAnonKey)
  : clienteSinConfigurar()
