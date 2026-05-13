# DkLayout — Plan Maestro de Mejoras v2.0

> Plan completo basado en análisis del código real. Cubre visual, funcional, IA, exportación, errores, base de datos y lanzamiento al mercado.
> Generado en sesión: Mayo 2026

---

## Estado actual (baseline)

| Área | Estado |
|------|--------|
| Editor Tiptap básico | ✅ Funciona (bold, italic, listas, alineación, fuente, tamaño, color) |
| Chat Duke con Groq | ✅ Funciona (insert, replace, restructure, modify) |
| API /api/chat y /api/generate | ✅ Funciona |
| Autosave IndexedDB (2s) | ✅ Funciona |
| Canvas de página (hoja blanca) | ✅ Funciona básico |
| Exportación DOCX/PDF | ❌ Botón deshabilitado |
| Imágenes en documento | ❌ Sin extensión Image en Tiptap |
| Imágenes a Duke | ❌ No implementado |
| Fuentes personalizadas/importar | ❌ Solo 4 fuentes hardcodeadas |
| Guardar diseño como plantilla | ❌ No implementado |
| Tablas en editor | ❌ Sin extensión Table en Tiptap |
| Tema claro funcional | ❌ Toggle existe, estilos no |
| Error boundary global | ❌ app/error.tsx no existe |
| Chat auto-scroll | ❌ El panel no scrollea al último mensaje |
| Toolbar refleja estado actual | ❌ Los selects no muestran fuente/tamaño activo |
| Mobile (menú hamburguesa) | ❌ Sin onClick |

---

## Prioridades de implementación

| Prioridad | Fase | Tiempo estimado | Estado |
|-----------|------|-----------------|--------|
| 🔴 1 | **H** — Bugfixes (errores identificados) | 1-2 días | ⬜ Pendiente |
| 🔴 2 | **D** — Exportación PDF y DOCX | 3-4 días | ⬜ Pendiente |
| 🔴 3 | **A1** — Toolbar completa y reactiva | 2-3 días | ⬜ Pendiente |
| 🔴 4 | **B** — Soporte de imágenes | 2-3 días | ⬜ Pendiente |
| 🟡 5 | **C** — Tablas | 1-2 días | ⬜ Pendiente |
| 🟡 6 | **A2** — Canvas tipo Canva (zoom, múltiples páginas) | 3-4 días | ⬜ Pendiente |
| 🟡 7 | **A3** — ChatPanel mejorado (autoscroll, sugerencias, preview) | 2 días | ⬜ Pendiente |
| 🟡 8 | **F** — Guardar como plantilla | 1-2 días | ⬜ Pendiente |
| 🟡 9 | **E** — Fuentes (Google Fonts + import) | 2-3 días | ⬜ Pendiente |
| 🟡 10 | **I** — Streaming de Duke | 1-2 días | ⬜ Pendiente |
| 🔵 11 | **G** — Importar DOCX como plantilla | 2 días | ⬜ Pendiente |
| 🔵 12 | **J1** — Abstraction layer de repositorio | 1 día | ⬜ Pendiente |
| 🔵 13 | **K1/K2** — Deploy y SEO | 1-2 días | ⬜ Pendiente |
| ⚫ 14 | **J2/J3** — Supabase + Auth | 1-2 semanas | ⬜ Pendiente |
| ⚫ 15 | **K3/K4** — Analytics y onboarding | 3-5 días | ⬜ Pendiente |

---

## FASE H — Bugfixes (PRIORIDAD 1)

### Errores identificados en el código actual

1. **`onEditorReady` en `EditorCanvas.tsx` (línea 43-45)** — Si la referencia de `onEditorReady` cambia, el efecto se dispara en bucle. Usar `useCallback` en el padre para estabilizar la referencia.

2. **Toolbar no refleja estado activo de fuente/tamaño** — Los selects tienen `defaultValue=""` y no se actualizan cuando el usuario mueve el cursor a texto con otra fuente. Convertirlos a `value` controlado y suscribirse a `onSelectionUpdate` del editor.

3. **Chat sin auto-scroll** — `ChatPanel.tsx` no hace scroll al último mensaje. Solución: `useRef` al contenedor de mensajes + `useEffect` con `scrollTop = scrollHeight`.

4. **`buildDocumentContext` corta en 3000 chars** — para documentos largos, Duke pierde el contexto de la segunda mitad. Enviar primeros 1500 chars + últimos 1500 chars.

5. **`extractText` en EditorScreen** — usa `.join(" ")` que puede crear dobles espacios. Afecta el contexto enviado a Duke.

6. **Tipo `Document` no incluye `pageSetup`** — `EditorScreen.tsx` accede a `document.pageSetup?.size` pero el tipo no lo declara. Actualizar `lib/types.ts`:
   ```typescript
   export type Document = {
     // ...campos existentes...
     pageSetup?: { size: PageSize }
   }
   ```

7. **`createDocument` no inicializa `pageSetup`** — El store crea documentos sin `pageSetup`, el editor lee con fallback `?? "letter"`. Inicializarlo explícitamente en `stores/documents-store.ts`.

8. **Error boundary global ausente** — Crear `app/error.tsx` para capturar errores no manejados.

9. **`HeroPrompt.tsx`** — si `/api/generate` falla, el documento se crea igualmente con contenido vacío y el usuario navega al editor sin saberlo. No navegar si la generación falla.

10. **Documento no encontrado sin salida** — Cuando `getDocument()` devuelve `undefined`, el EditorScreen muestra error pero sin botón de "Crear nuevo" o redirigir. Crear `app/editor/[id]/not-found.tsx`.

### Archivos a modificar
- `lib/types.ts` — agregar `pageSetup` a `Document`
- `stores/documents-store.ts` — inicializar `pageSetup` en `createDocument`
- `components/editor/EditorCanvas.tsx` — estabilizar `onEditorReady`
- `components/editor/EditorToolbar.tsx` — hacer selects controlados y reactivos
- `components/editor/ChatPanel.tsx` — agregar auto-scroll
- `components/editor/EditorScreen.tsx` — mejorar `buildDocumentContext`
- `components/home/HeroPrompt.tsx` — no navegar si generación falla

### Archivos a crear
- `app/error.tsx` — Error boundary global
- `app/editor/[id]/not-found.tsx` — Página cuando documento no existe

---

## FASE D — Exportación (PRIORIDAD 2)

### D1 — Exportar a PDF

**Librería:** `html2pdf.js` (ya instalada)

**Archivo a crear:** `lib/export/pdf-generator.ts`
```typescript
export async function exportToPdf(title: string, pageSize: PageSize) {
  const element = document.querySelector('.ProseMirror') as HTMLElement
  const formatMap = { letter: 'letter', a4: 'a4', legal: 'legal' }
  const opt = {
    margin: [40, 40, 40, 40],
    filename: `${title}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'pt', format: formatMap[pageSize], orientation: 'portrait' }
  }
  await html2pdf().set(opt).from(element).save()
}
```

### D2 — Exportar a DOCX

**Librería:** `docx` (ya instalada)

**Archivo a crear:** `lib/export/docx-generator.ts`

Mapeo nodo por nodo de Tiptap JSON → objetos DOCX:
- `paragraph` → `new Paragraph({ children: [...runs] })`
- `heading level 1` → `new Paragraph({ heading: HeadingLevel.HEADING_1 })`
- `heading level 2` → `HeadingLevel.HEADING_2`
- `heading level 3` → `HeadingLevel.HEADING_3`
- `text bold` → `new TextRun({ text, bold: true })`
- `text italic` → `new TextRun({ text, italics: true })`
- `text underline` → `new TextRun({ text, underline: {} })`
- `bulletList` → `new Paragraph({ bullet: { level: 0 } })`
- `orderedList` → `new Paragraph({ numbering: { reference, level: 0 } })`
- `image` → `ImageRun` (convertir base64 a buffer)
- `table` → `new Table({ rows: [...] })`

### D3 — ExportMenu UI

**Archivo a crear:** `components/shared/ExportMenu.tsx`
- Dropdown con: "Descargar PDF" y "Descargar DOCX"
- Estado loading durante exportación
- Manejo de errores con mensaje al usuario

**Modificar:** `components/editor/EditorHeader.tsx`
- Habilitar botón "Exportar" (actualmente `disabled`)
- Conectar con `ExportMenu`

---

## FASE A1 — Toolbar Completa y Reactiva (PRIORIDAD 3)

**Archivo:** `components/editor/EditorToolbar.tsx`

### Nuevos botones a agregar
- H3 (Heading level 3)
- Strikethrough / Tachado (ya en StarterKit)
- Highlight / Resaltado con color — instalar `@tiptap/extension-highlight`
- Superíndice — instalar `@tiptap/extension-superscript`
- Subíndice — instalar `@tiptap/extension-subscript`
- Blockquote / Cita (ya en StarterKit)
- Code inline (ya en StarterKit)
- CodeBlock (ya en StarterKit)
- Horizontal rule (ya en StarterKit)
- Link editor — popover con input de URL (extensión Link ya instalada)
- Insertar imagen — abre `ImageUploadModal`
- Insertar tabla — dropdown grid N×M

### Selectores reactivos
Escuchar `onSelectionUpdate` del editor para sincronizar:
- Select de fuente → leer `editor.getAttributes('textStyle').fontFamily`
- Select de tamaño → leer `editor.getAttributes('textStyle').fontSize`
- Color → leer `editor.getAttributes('textStyle').color`

### Color picker visual
Reemplazar `<select>` de color por popover con:
- Swatches de colores predefinidos
- `<input type="color">` para color personalizado
- Preview del color seleccionado

### Interlineado
Select con opciones: `1`, `1.15`, `1.5`, `2.0`
Aplicar con CSS variable o mark personalizado de Tiptap.

### Extensiones Tiptap a instalar
```bash
npm install @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-superscript @tiptap/extension-subscript @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header
```

**Modificar:** `lib/tiptap/extensions.ts` — registrar todas las extensiones nuevas

---

## FASE B — Soporte de Imágenes (PRIORIDAD 4)

### B1 — Imágenes en el documento

**Extensión:** `@tiptap/extension-image`

```typescript
Image.configure({
  inline: false,
  allowBase64: true,
})
```

**Flujo de inserción:**
1. Botón en toolbar → abre `ImageUploadModal`
2. Modal con 2 tabs:
   - **Subir archivo** → FileReader → base64 → `editor.chain().setImage({ src })`
   - **URL** → input → `editor.chain().setImage({ src })`
3. Pegar imagen desde clipboard (evento `paste`)
4. Drag & drop de imagen al canvas

**Archivos a crear:**
- `components/editor/ImageUploadModal.tsx`

### B2 — Imágenes como contexto para Duke

**Flujo:**
1. Botón paperclip en input del chat de Duke
2. Seleccionar imagen → preview miniatura en el área de escritura
3. Al enviar: imagen en base64 incluida en el mensaje
4. API usa modelo Groq Vision: `llama-3.2-11b-vision-preview`
5. Duke describe y estructura contenido a partir de la imagen

**Cambios en tipos:**
```typescript
// lib/types.ts
export type ChatMessage = {
  id: string
  role: 'user' | 'duke'
  content: string
  timestamp: number
  action?: DukeAction
  imageBase64?: string  // NUEVO
}
```

**Modificar:**
- `app/api/chat/route.ts` — detectar imagen en mensaje y usar modelo vision
- `lib/ai/groq-client.ts` — soporte mensajes multimodales
- `components/editor/ChatPanel.tsx` — botón paperclip + preview

---

## FASE C — Tablas (PRIORIDAD 5)

**Extensiones:** `@tiptap/extension-table`, `table-row`, `table-cell`, `table-header`

### Toolbar
- Botón "Insertar tabla" con dropdown de grid N×M (estilo Google Docs)
- Al hover sobre el grid, resaltar las celdas y mostrar "3×4" etc.

### Funcionalidades
- Insertar tabla N×M
- Agregar/eliminar filas y columnas (menú contextual en celda)
- Encabezados de tabla con fondo diferenciado

### Duke y tablas
Actualizar `DUKE_SYSTEM_PROMPT` en `lib/ai/prompts.ts`:
- Agregar nodo `table` a las reglas de Tiptap JSON válido
- Agregar nodos `tableRow`, `tableHeader`, `tableCell`
- Incluir ejemplo de tabla en el prompt

---

## FASE A2 — Canvas tipo Canva (PRIORIDAD 6)

**Archivos:** `components/editor/EditorCanvas.tsx` y `app/globals.css`

### Cambios a implementar

1. **Topbar dinámica** — reemplazar strings hardcodeados por valores reales:
   - Tamaño real de página (Carta 8.5×11", A4 210×297mm, etc.)
   - Zoom actual (ej: "100%")
   - Páginas estimadas

2. **Control de Zoom** — botones -/+ y slider (50% a 200%):
   ```typescript
   const [zoom, setZoom] = useState(100)
   // Aplicar: style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
   ```

3. **Regla horizontal (Ruler)** — componente CSS puro con marcas cada 1cm/0.5"

4. **Múltiples páginas reales** — en lugar de `repeating-linear-gradient`, calcular la cantidad de páginas y renderizar `N` divs `document-page-shell` separados con gap entre ellos

5. **Guías de margen** — líneas punteadas dentro de la página que muestran el área imprimible

6. **Indicador de página actual** — "Página X de Y" en la topbar, actualizado al hacer scroll

7. **Modo lectura** — botón para ocultar toolbar y ver solo el documento limpio

---

## FASE A3 — ChatPanel Mejorado (PRIORIDAD 7)

**Archivo:** `components/editor/ChatPanel.tsx`

### Cambios a implementar

1. **Auto-scroll al último mensaje:**
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])
// Al final del área de mensajes: <div ref={messagesEndRef} />
```

2. **Chips de acciones rápidas** (cuando no hay mensajes):
   - "Hazme una portada"
   - "Agrega una introducción"
   - "Estructúralo completo"
   - "Agrega tabla de contenidos"
   - "Mejora la redacción"

3. **Badge de acción en mensajes de Duke:**
   - Chip pequeño mostrando el tipo: `INSERT`, `REPLACE`, `RESTRUCTURE`, `MODIFY`
   - Color diferente según el tipo (verde=insert, ámbar=modify, rojo=replace)

4. **Botón "Deshacer acción de Duke":**
   - Aparece debajo del último mensaje de Duke que tuvo acción
   - Llama a `editor.chain().undo().run()` pasado por prop desde `EditorScreen`

5. **Preview antes de acciones destructivas:**
   - Si Duke propone `replace` o `restructure`, mostrar modal de confirmación
   - "Duke va a reemplazar todo el documento. ¿Continuar?"

6. **Resize del panel:**
   - Drag en el borde derecho del panel para cambiar su ancho
   - Guardar preferencia en localStorage

---

## FASE F — Guardar como Plantilla (PRIORIDAD 8)

**Archivo a crear:** `components/editor/SaveAsTemplateModal.tsx`

### Flujo
1. En `EditorHeader.tsx` — menú de tres puntos (⋮) con opción "Guardar como plantilla"
2. Modal con:
   - Input: nombre de la plantilla
   - Textarea: descripción
   - Select: categoría (académica, escolar, profesional, custom)
   - Selector de color de card (swatches)
3. Al guardar:
   - Leer `editor.getJSON()` como contenido de la plantilla
   - Crear objeto `Template` con `isCustom: true`
   - Guardar en IndexedDB

### Modificar IndexedDB
`lib/storage/indexed-db.ts` — agregar:
```typescript
export async function saveTemplate(template: Template): Promise<void>
export async function listCustomTemplates(): Promise<Template[]>
export async function deleteTemplate(id: string): Promise<void>
```

### Modificar TemplatesScreen
`components/templates/TemplatesScreen.tsx` — agregar sección "Mis plantillas" con:
- Grid de plantillas custom
- Botón de eliminar en cada card
- Botón "Importar .docx" (conecta con Fase G)

---

## FASE E — Fuentes Personalizadas (PRIORIDAD 9)

### E1 — Google Fonts curadas

**Archivo a crear:** `lib/fonts/google-fonts.ts`

Lista de ~20 fuentes para documentos:
```typescript
export const GOOGLE_FONTS = [
  // Sans-serif
  { name: 'Inter', family: "'Inter', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter' },
  { name: 'Roboto', family: "'Roboto', sans-serif", url: '...' },
  { name: 'Open Sans', family: "'Open Sans', sans-serif", url: '...' },
  { name: 'Lato', family: "'Lato', sans-serif", url: '...' },
  { name: 'Montserrat', family: "'Montserrat', sans-serif", url: '...' },
  // Serif
  { name: 'Merriweather', family: "'Merriweather', serif", url: '...' },
  { name: 'Playfair Display', family: "'Playfair Display', serif", url: '...' },
  { name: 'Lora', family: "'Lora', serif", url: '...' },
  { name: 'Libre Baskerville', family: "'Libre Baskerville', serif", url: '...' },
  // Mono
  { name: 'Source Code Pro', family: "'Source Code Pro', monospace", url: '...' },
]

export async function loadGoogleFont(url: string): Promise<void> {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}
```

### E2 — Importar fuente personalizada

**Archivo a crear:** `lib/fonts/custom-fonts.ts`

```typescript
export async function registerCustomFont(file: File): Promise<{ name: string; family: string }> {
  const name = file.name.replace(/\.[^/.]+$/, '') // quitar extensión
  const url = URL.createObjectURL(file)
  const font = new FontFace(name, `url(${url})`)
  await font.load()
  document.fonts.add(font)
  return { name, family: `'${name}', sans-serif` }
}
```

Botón "Importar fuente" en el selector de fuentes de la toolbar.
Persistir en IndexedDB (ArrayBuffer de la fuente para sesiones futuras).

---

## FASE I — Streaming de Duke (PRIORIDAD 10)

**Objetivo:** Respuestas de Duke aparecen en tiempo real (como ChatGPT).

### Cambios en `app/api/chat/route.ts`
```typescript
const stream = await groq.chat.completions.create({
  model: getGroqModel(),
  messages: [...],
  stream: true,
})

return new Response(
  new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    }
  }),
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
)
```

### Cambios en `EditorScreen.tsx` — `handleSendDukeMessage`
```typescript
const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({...}) })
const reader = response.body!.getReader()
const decoder = new TextDecoder()
let fullText = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  fullText += decoder.decode(value)
  // Actualizar mensaje de Duke en tiempo real con fullText
  updateLastDukeMessage(fullText)
}

// Al final, parsear [ACTION] del texto completo
const parsed = parseDukeResponse(fullText)
applyDukeAction(parsed.action)
```

---

## FASE G — Importar DOCX como Plantilla (PRIORIDAD 11)

**Librería:** `mammoth` (ya instalada)

**Archivo a crear:** `lib/import/docx-parser.ts`
```typescript
export async function parseDocxToTiptap(file: File): Promise<TiptapJSON> {
  const arrayBuffer = await file.arrayBuffer()
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer })
  // Convertir HTML → Tiptap JSON con DOMParser
  return htmlToTiptapJson(html)
}
```

**API a crear:** `app/api/parse-template/route.ts`
- Recibe `FormData` con el archivo DOCX
- Usa `mammoth.convertToHtml` en el servidor
- Convierte HTML → Tiptap JSON
- Devuelve el JSON

---

## FASE J — Base de Datos (Expandible)

### J1 — Repository Pattern (PRIORIDAD 12)

**Archivo a crear:** `lib/storage/repository.ts`

```typescript
export interface DocumentRepository {
  getDocument(id: string): Promise<Document | undefined>
  saveDocument(doc: Document): Promise<void>
  listDocuments(): Promise<Document[]>
  deleteDocument(id: string): Promise<void>
}

export interface TemplateRepository {
  saveTemplate(template: Template): Promise<void>
  listCustomTemplates(): Promise<Template[]>
  deleteTemplate(id: string): Promise<void>
}

// Fase 1: IndexedDbDocumentRepository (ya implementado en indexed-db.ts)
// Fase 2: SupabaseDocumentRepository (a crear cuando se active Supabase)
```

### J2 — Supabase (FASE 2 — Futuro)

**Cuándo activar:** Cuando el producto esté validado con usuarios reales.

**Schema SQL:**
```sql
create table documents (
  id           text primary key,
  user_id      uuid references auth.users not null,
  title        text not null,
  content      jsonb not null,
  format       text not null,
  status       text not null default 'draft',
  page_setup   jsonb,
  chat_history jsonb default '[]',
  metadata     jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table templates (
  id              text primary key,
  user_id         uuid references auth.users,
  name            text not null,
  description     text,
  structure       jsonb not null,
  category        text,
  format          text,
  is_custom       boolean default false,
  thumbnail_color text,
  created_at      timestamptz default now()
);

alter table documents enable row level security;
create policy "Users own documents"
  on documents for all using (auth.uid() = user_id);

alter table templates enable row level security;
create policy "Users own custom templates"
  on templates for all using (auth.uid() = user_id or user_id is null);
```

**Variables de entorno (agregar a `.env.example`):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Migración:** Script que lee IndexedDB del navegador y sube al cloud al crear cuenta.

### J3 — Auth (FASE 2 — Futuro)

- Login email/password + Google OAuth (Supabase Auth)
- Middleware Next.js para proteger rutas
- Reemplazar "Edwuard" hardcodeado por nombre real del perfil
- `UserAvatar.tsx` con foto de perfil real

**Planes:**
- **Free:** hasta 10 documentos, 3 exportaciones/mes
- **Premium:** ilimitado, sin marca de agua, fuentes custom, compartir documentos

---

## FASE K — Lanzamiento al Mercado

### K1 — Deploy en Vercel (PRIORIDAD 13)

1. Conectar repo GitHub → Vercel
2. Variables de entorno: `GROQ_API_KEY`
3. Dominio personalizado: `dklayout.app` o `dklayout.com`
4. Headers de seguridad en `next.config.ts`:
   ```typescript
   async headers() {
     return [{ source: '/(.*)', headers: [
       { key: 'X-Frame-Options', value: 'DENY' },
       { key: 'X-Content-Type-Options', value: 'nosniff' },
     ]}]
   }
   ```

### K2 — SEO (PRIORIDAD 13)

`app/layout.tsx` — metadata completa:
```typescript
export const metadata = {
  title: 'DkLayout — Documentos con IA',
  description: 'Crea documentos académicos y profesionales con ayuda de IA. Exporta en DOCX o PDF. Gratis.',
  openGraph: {
    title: 'DkLayout',
    description: '...',
    url: 'https://dklayout.app',
    siteName: 'DkLayout',
  },
  twitter: { card: 'summary_large_image' },
}
```

Crear `app/sitemap.ts` para SEO.
Usar `next/image` para todas las imágenes estáticas.

### K3 — Analytics y Monitoreo (PRIORIDAD 15)

- **Vercel Analytics** — activar en dashboard (cero config)
- **Sentry** — captura de errores en producción:
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- Métricas a trackear: documentos creados, mensajes a Duke, exportaciones

### K4 — Onboarding (PRIORIDAD 15)

**Flujo de primer uso:**
1. Modal de bienvenida con 3 pasos guiados
2. Documento de ejemplo precargado con instrucciones interactivas
3. Tooltips en la primera visita al editor
4. Chips de ejemplo en el chat de Duke para nuevos usuarios

---

## Archivos nuevos a crear (resumen completo)

```
components/editor/
  ImageUploadModal.tsx         ← Modal insertar imagen en documento
  SaveAsTemplateModal.tsx      ← Modal guardar documento como plantilla

components/shared/
  ExportMenu.tsx               ← Dropdown exportar PDF/DOCX

lib/export/
  pdf-generator.ts             ← Exportar a PDF con html2pdf.js
  docx-generator.ts            ← Exportar a DOCX con docx

lib/import/
  docx-parser.ts               ← Parsear .docx con mammoth

lib/fonts/
  google-fonts.ts              ← Lista curada de Google Fonts + carga dinámica
  custom-fonts.ts              ← Registro de fuentes desde archivo .ttf/.otf

lib/storage/
  repository.ts                ← Interfaz abstracta de storage (preparar para DB)

app/
  error.tsx                    ← Error boundary global de Next.js
  editor/[id]/not-found.tsx    ← Cuando el documento no existe

app/api/
  parse-template/route.ts      ← Endpoint para parsear DOCX subido
```

## Archivos a modificar (resumen completo)

```
lib/types.ts                              ← Agregar pageSetup a Document, imageBase64 a ChatMessage
lib/tiptap/extensions.ts                  ← Agregar Image, Table, Highlight, Superscript, Subscript
lib/ai/prompts.ts                         ← Soporte de tablas e imágenes en el prompt de Duke
lib/storage/indexed-db.ts                 ← Agregar saveTemplate, listCustomTemplates, deleteTemplate

components/editor/EditorToolbar.tsx       ← Toolbar completa, reactiva, con color picker visual
components/editor/EditorCanvas.tsx        ← Topbar dinámica, zoom, múltiples páginas reales, regla
components/editor/EditorHeader.tsx        ← Habilitar botón exportar, menú ⋮ con "Guardar plantilla"
components/editor/ChatPanel.tsx           ← Auto-scroll, chips sugeridos, badge de acción, paperclip
components/editor/EditorScreen.tsx        ← Sidebar funcional, errores mejorados, streaming Duke
components/home/HeroPrompt.tsx            ← No navegar si /api/generate falla
components/templates/TemplatesScreen.tsx  ← Sección "Mis plantillas" + botón importar .docx

app/api/chat/route.ts                     ← Soporte streaming + imágenes (modelo vision)
app/globals.css                           ← Estilos tabla, imagen redimensionable, resaltado, zoom
stores/documents-store.ts                 ← Inicializar pageSetup en createDocument
```

---

*Última actualización: Mayo 2026 — Continuar implementación desde Fase H (Bugfixes)*
