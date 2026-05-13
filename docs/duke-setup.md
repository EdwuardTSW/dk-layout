# Duke — Configuracion de IA

## 1. Crear `.env.local`

En la raiz del proyecto, crea un archivo `.env.local` con:

```env
GROQ_API_KEY=gsk_tu_api_key_real
```

Opcionalmente puedes fijar el modelo:

```env
GROQ_MODEL=llama-3.3-70b-versatile
```

## 2. Reiniciar el servidor

Despues de cambiar variables de entorno, reinicia:

```bash
npm run dev
```

## 3. Probar Duke

Abre un documento en `/editor/[id]` y escribe algo como:

```text
Agrega una introduccion profesional sobre inteligencia artificial en educacion.
```

Duke puede responder con una accion `[ACTION]` que el editor aplicara al documento.

## Notas

- La API key solo debe vivir en `.env.local`; no debe exponerse en componentes cliente.
- El endpoint activo es `POST /api/chat`.
- Supabase no es necesario todavia para Duke. Primero conviene estabilizar IA + editor local; despues migramos documentos y chat a Supabase.
