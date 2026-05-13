# DkLayout — Handoff de Sesion

Fecha: 2026-05-08

## Estado general

El proyecto avanzo de una base de Sprint 1 hacia Sprint 2/Sprint 3 inicial. Ya existe home funcional, documentos locales, plantillas, editor Tiptap real, Duke conectado con Groq, generacion inicial desde Home y una interfaz de trabajo mucho mas estable.

## Stack real actual

- Next.js 16.2.6 App Router
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- Zustand
- IndexedDB con `idb-keyval`
- Tiptap v3
- Groq SDK

## Funcionalidad implementada

- Home funcional con prompt principal.
- Creacion de documento en blanco.
- Creacion desde plantillas.
- Documentos recientes desde IndexedDB.
- Pagina `/documents`.
- Pagina `/templates`.
- Editor real en `/editor/[id]`.
- Carga de documento desde IndexedDB.
- Autoguardado local cada 2 segundos.
- Titulo editable.
- Toolbar con opciones basicas y avanzadas.
- Duke en panel lateral.
- Duke colapsable como boton flotante con mensaje “En que te ayudo?”.
- Endpoint `POST /api/chat` para hablar con Duke.
- Endpoint `POST /api/generate` para crear documento inicial con IA.
- Fallback local si falla la generacion IA.
- Configuracion de `GROQ_API_KEY` en `.env.local` funcionando.
- Tamaño de hoja por documento: Carta, A4, Legal.
- Preview/documento con scroll interno.
- Chat con scroll interno.
- Layout del editor sin scroll global.

## Archivos importantes creados/modificados

- `app/api/chat/route.ts`
- `app/api/generate/route.ts`
- `app/editor/[id]/page.tsx`
- `app/globals.css`
- `components/editor/ChatPanel.tsx`
- `components/editor/EditorCanvas.tsx`
- `components/editor/EditorHeader.tsx`
- `components/editor/EditorScreen.tsx`
- `components/editor/EditorStatusBar.tsx`
- `components/editor/EditorToolbar.tsx`
- `components/home/HeroPrompt.tsx`
- `lib/ai/groq-client.ts`
- `lib/ai/parsers.ts`
- `lib/ai/prompts.ts`
- `lib/tiptap/extensions.ts`
- `lib/tiptap/font-size.ts`
- `lib/types.ts`
- `stores/documents-store.ts`
- `docs/duke-setup.md`

## Dependencias agregadas

- `@tiptap/extension-color`
- `@tiptap/extension-font-family`
- `@tiptap/extension-text-style`

## Verificaciones realizadas

Ultimas verificaciones exitosas:

```bash
npm run lint
npm run build
```

Ambas pasaron correctamente.

## Configuracion local requerida

Existe `.env.local` local con:

```env
GROQ_API_KEY=...
```

No se debe subir esa key a GitHub.

## Decisiones tomadas

- Supabase ya existe del lado del usuario, pero aun no se implemento.
- Recomendacion actual: no migrar a Supabase hasta estabilizar editor, Duke y exportacion.
- La paginacion actual es visual/aproximada, no paginacion real tipo Word.
- Para paginacion exacta se evaluara durante exportacion DOCX/PDF o con un motor/plugin mas avanzado.
- Duke usa Groq, no xAI/Grok.
- Duke puede insertar, reemplazar, modificar o reestructurar contenido mediante acciones Tiptap JSON.

## Pendientes inmediatos recomendados

1. Probar manualmente `/api/generate` corriendo `npm run dev`.
2. Probar desde Home: crear documento con IA y revisar estructura generada.
3. Probar Duke en editor con acciones como:
   - “Agrega una introduccion profesional sobre este tema.”
   - “Reestructura todo el documento con secciones claras.”
   - “Borra todo el contenido del documento.”
   - “Modifica el documento para que sea mas academico.”
4. Ajustar prompt/parser si Duke devuelve JSON invalido o acciones muy agresivas.
5. Siguiente feature fuerte recomendada: exportacion DOCX basica.

## Riesgos actuales

- Los documentos creados antes de `pageSetup` pueden no tener `pageSetup`; el editor ya usa fallback `letter`.
- Duke depende de que Groq devuelva JSON Tiptap valido.
- Las acciones `replace`, `modify` y `restructure` reemplazan el documento completo si Duke las devuelve asi.
- El toolbar de fuente/color funciona con marcas Tiptap, pero exportacion DOCX todavia no existe, asi que esos estilos aun no salen a Word.
- Hay vulnerabilidades moderadas reportadas por npm audit; no se ejecuto `npm audit fix --force` para evitar cambios destructivos.

## Proximo paso sugerido

Implementar exportacion DOCX basica desde Tiptap JSON:

- Crear `lib/export/docx-generator.ts`.
- Crear boton/accion real en el editor.
- Mapear nodos iniciales: heading, paragraph, bulletList, orderedList.
- Descargar `.docx` en navegador.
- Despues ampliar estilos: bold, italic, underline, color, fontSize, fontFamily.
