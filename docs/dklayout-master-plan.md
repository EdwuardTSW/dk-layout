# DkLayout — Plan Maestro del Proyecto
> Documento de referencia técnica y de producto. Versión inicial — Fase 1.

---

## 1. Visión del producto

**DkLayout** es una aplicación web que permite crear documentos profesionales (DOCX y PDF) con la ayuda de un asistente de IA llamado **Duke**. El usuario describe lo que quiere y Duke estructura, formatea y construye el documento en tiempo real, mientras el usuario puede editarlo manualmente en cualquier momento.

### Diferenciadores
- Editor WYSIWYG en tiempo real (estilo Word)
- Asistente de IA que estructura información en formatos profesionales
- Plantillas predefinidas + plantillas que el usuario sube
- Exportación nativa a DOCX y PDF
- Interfaz moderna con modo oscuro/claro

---

## 2. Stack técnico definitivo

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Framework | **Next.js 14 (App Router)** | Frontend + API en uno, deploy en Vercel |
| Lenguaje | **TypeScript** | Tipado fuerte, menos bugs |
| UI | **Tailwind CSS** | Velocidad de desarrollo |
| Editor | **Tiptap** | El mejor RTE para React, extensiones listas |
| IA | **Groq (LLaMA 3.3 70B)** | Rápido y gratis |
| Exportar DOCX | **docx** (npm) | Genera Word real con estilos |
| Exportar PDF | **html2pdf.js** + **jsPDF** | PDF desde el navegador |
| Importar DOCX | **mammoth.js** | Parsea plantillas Word del usuario |
| Estado global | **Zustand** | Más simple que Redux, perfecto para esto |
| Persistencia local (Fase 1) | **localStorage + IndexedDB (idb-keyval)** | Sin backend, sin DB |
| Persistencia nube (Fase 2) | **Supabase** | PostgreSQL + Auth + Storage gratis |
| Iconos | **lucide-react** | Modernos y consistentes |
| Deploy | **Vercel** | CI/CD desde GitHub |

---

## 3. Estructura del proyecto

```
dk-layout/
├── app/
│   ├── layout.tsx                    # Layout raíz (fuentes, metadata, providers)
│   ├── page.tsx                      # Página de inicio (home)
│   ├── globals.css                   # Estilos globales + Tailwind
│   │
│   ├── editor/
│   │   └── [id]/
│   │       └── page.tsx              # Editor de documento (id = documento)
│   │
│   ├── documents/
│   │   └── page.tsx                  # Lista de todos los documentos
│   │
│   ├── templates/
│   │   └── page.tsx                  # Galería de plantillas
│   │
│   └── api/
│       ├── chat/
│       │   └── route.ts              # Duke conversa con el usuario
│       ├── generate/
│       │   └── route.ts              # Generación inicial desde prompt
│       └── parse-template/
│           └── route.ts              # Importa DOCX como plantilla
│
├── components/
│   ├── home/
│   │   ├── Sidebar.tsx               # Barra lateral del home
│   │   ├── HeroPrompt.tsx            # Caja "¿Qué quieres crear hoy?"
│   │   ├── TemplateCard.tsx          # Card de plantilla
│   │   ├── RecentDocuments.tsx       # Lista de documentos recientes
│   │   └── BlankDocument.tsx         # Card "Empieza desde cero"
│   │
│   ├── editor/
│   │   ├── EditorToolbar.tsx         # Toolbar tipo Word (negrita, listas, etc.)
│   │   ├── EditorCanvas.tsx          # El editor Tiptap renderizado
│   │   ├── EditorStatusBar.tsx       # Barra inferior (página, palabras, idioma)
│   │   ├── EditorHeader.tsx          # Header con título + exportar
│   │   ├── ChatPanel.tsx             # Panel de Duke
│   │   ├── ChatMessage.tsx           # Burbuja de mensaje
│   │   ├── ChatInput.tsx             # Input para hablar con Duke
│   │   └── ToolSidebar.tsx           # Barra de herramientas izquierda
│   │
│   ├── shared/
│   │   ├── ThemeToggle.tsx           # Toggle modo oscuro/claro
│   │   ├── UserAvatar.tsx            # Avatar usuario
│   │   └── ExportMenu.tsx            # Menú de exportación
│   │
│   └── ui/                           # Componentes UI base (botones, inputs)
│
├── lib/
│   ├── tiptap/
│   │   ├── extensions.ts             # Configuración de extensiones Tiptap
│   │   └── config.ts                 # Configuración base del editor
│   │
│   ├── ai/
│   │   ├── groq-client.ts            # Cliente de Groq
│   │   ├── prompts.ts                # System prompts (Duke, generación inicial)
│   │   └── parsers.ts                # Parsea respuestas de Duke
│   │
│   ├── export/
│   │   ├── docx-generator.ts         # Genera .docx desde Tiptap JSON
│   │   └── pdf-generator.ts          # Genera .pdf desde el editor
│   │
│   ├── import/
│   │   └── docx-parser.ts            # Parsea .docx con mammoth
│   │
│   ├── storage/
│   │   ├── local-storage.ts          # Wrapper de localStorage
│   │   └── indexed-db.ts             # Wrapper de IndexedDB para documentos
│   │
│   ├── templates/
│   │   ├── definitions.ts            # Plantillas predefinidas
│   │   └── manager.ts                # Lógica de plantillas
│   │
│   └── types.ts                      # Tipos compartidos
│
├── stores/
│   ├── document-store.ts             # Estado del documento actual (Zustand)
│   ├── chat-store.ts                 # Estado del chat con Duke
│   ├── documents-store.ts            # Lista de todos los documentos
│   └── ui-store.ts                   # Tema, sidebar abierto, etc.
│
├── hooks/
│   ├── useEditor.ts                  # Hook para el editor Tiptap
│   ├── useDuke.ts                    # Hook para hablar con Duke
│   ├── useAutoSave.ts                # Auto-guardado del documento
│   └── useExport.ts                  # Lógica de exportación
│
├── public/
│   └── templates/                    # Archivos .docx de plantillas predefinidas
│
├── .env.local                        # GROQ_API_KEY
├── .env.example
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 4. Modelo de datos

### Tipos principales

```typescript
// lib/types.ts

export type DocumentFormat = 'docx' | 'pdf' | 'report' | 'presentation';
export type DocumentStatus = 'draft' | 'completed' | 'trashed';

export type Document = {
  id: string;
  title: string;
  content: TiptapJSON;          // El contenido del editor
  format: DocumentFormat;
  templateId?: string;          // Si fue creado desde una plantilla
  status: DocumentStatus;
  createdAt: number;            // timestamp
  updatedAt: number;
  metadata: {
    wordCount: number;
    pageCount: number;
    language: string;
  };
  chatHistory: ChatMessage[];   // Conversación con Duke
};

export type Template = {
  id: string;
  name: string;
  description: string;
  icon: string;                 // emoji o nombre de icono
  format: DocumentFormat;
  category: 'academic' | 'business' | 'school' | 'professional' | 'custom';
  isCustom: boolean;            // true si la subió el usuario
  isComingSoon: boolean;        // para Informe / Presentación
  structure: TiptapJSON;        // Estructura base del documento
  thumbnailColor: string;       // color del icono en la card
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'duke';
  content: string;
  timestamp: number;
  action?: DukeAction;          // Acción que Duke ejecuta sobre el documento
};

export type DukeAction = {
  type: 'insert' | 'replace' | 'modify' | 'restructure';
  target?: string;              // ID del nodo a modificar
  content?: TiptapJSON;
};

export type TiptapJSON = {
  type: string;
  content?: TiptapJSON[];
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

export type User = {
  id: string;
  name: string;
  email?: string;               // null en Fase 1
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: 'es' | 'en';
  };
};
```

---

## 5. Plantillas predefinidas (Fase 1)

```typescript
// lib/templates/definitions.ts

export const PREDEFINED_TEMPLATES: Template[] = [
  {
    id: 'academic-report',
    name: 'Informe académico',
    description: 'Estructura profesional para trabajos académicos',
    icon: '📘',
    format: 'docx',
    category: 'academic',
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: '#3b82f6',
    structure: { /* portada + introducción + desarrollo + conclusión + referencias */ }
  },
  {
    id: 'school-work',
    name: 'Trabajo escolar',
    description: 'Ideal para tareas y trabajos escolares',
    icon: '🎓',
    format: 'docx',
    category: 'school',
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: '#10b981',
    structure: { /* portada + objetivos + contenido + conclusiones */ }
  },
  {
    id: 'essay',
    name: 'Ensayo',
    description: 'Formato limpio para ensayos y análisis',
    icon: '✍️',
    format: 'docx',
    category: 'academic',
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: '#a855f7',
    structure: { /* introducción + argumentos + conclusión */ }
  },
  {
    id: 'lab-report',
    name: 'Informe de laboratorio',
    description: 'Perfecto para resultados y análisis',
    icon: '🧪',
    format: 'docx',
    category: 'academic',
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: '#eab308',
    structure: { /* objetivo + materiales + procedimiento + resultados + conclusión */ }
  },
  {
    id: 'professional-report',
    name: 'Reporte profesional',
    description: 'Informes ejecutivos y empresariales',
    icon: '📊',
    format: 'pdf',
    category: 'professional',
    isCustom: false,
    isComingSoon: false,
    thumbnailColor: '#ef4444',
    structure: { /* resumen ejecutivo + análisis + recomendaciones */ }
  },
  // BETA — próximamente
  {
    id: 'report-beta',
    name: 'Informe',
    description: 'Próximamente',
    icon: '📑',
    format: 'report',
    category: 'professional',
    isCustom: false,
    isComingSoon: true,
    thumbnailColor: '#22c55e',
    structure: {}
  },
  {
    id: 'presentation-beta',
    name: 'Presentación',
    description: 'Próximamente',
    icon: '📽️',
    format: 'presentation',
    category: 'professional',
    isCustom: false,
    isComingSoon: true,
    thumbnailColor: '#f97316',
    structure: {}
  },
];
```

---

## 6. Duke — El asistente de IA

### Comportamiento
Duke no genera el documento de golpe. **Estructura información que el usuario le da en tiempo real.**

Ejemplo de flujo:
```
Usuario: "Hazme una portada con el título 'Análisis de mercado 2026', autor Edwuard Chay, materia Economía"
Duke: [inserta una portada formateada con esos datos en el documento]

Usuario: "Agrega una sección de introducción con esto: [texto largo]"
Duke: [inserta la sección con el texto formateado correctamente]

Usuario: "Hazme una tabla con estos datos: producto A: $100, producto B: $250..."
Duke: [genera y inserta una tabla formateada]
```

### System prompt (resumen)
```
Eres Duke, el asistente de DkLayout. Tu trabajo es estructurar la información que el usuario te da en formato profesional dentro de un documento. NO inventas información que el usuario no te dio. Solo organizas, formateas y embelleces.

Cuando el usuario te pide algo, respondes con una acción JSON que el sistema aplicará al documento:
[ACTION]
{
  "type": "insert" | "replace" | "modify",
  "position": "cursor" | "end" | "start" | nodeId,
  "content": { ...TiptapJSON... }
}
[/ACTION]

Tipos de acciones:
- insert: agregar contenido nuevo
- replace: reemplazar una sección existente
- modify: modificar formato/estilo de un nodo

Si el usuario solo conversa o pide ayuda, responde texto normal sin ACTION.
Si el usuario te da datos para un formato específico (portada, tabla, lista, sección), genera el JSON Tiptap correspondiente.
```

### Endpoint `/api/chat`
```
POST /api/chat
Body: {
  messages: ChatMessage[],
  documentContext: string,   // resumen del documento actual
  cursorPosition?: number
}
Response: {
  text: string,              // mensaje de Duke
  action?: DukeAction        // acción a aplicar al documento
}
```

---

## 7. Funcionalidades por interfaz

### 7.1 Pantalla de inicio (Home)

**Sidebar izquierdo:**
- Logo DkLayout
- Inicio (activo)
- Documentos
- Plantillas
- Proyectos *(Fase 2)*
- Historial *(Fase 2)*
- Papelera *(Fase 2)*
- Separador "FORMATOS"
  - Documento (DOCX)
  - PDF
  - Informe *(badge "Próximamente")*
  - Presentación *(badge "Próximamente")*
- Footer: Plan Free + botón actualizar

**Área principal:**
- Header: "¡Hola, Usuario! 👋" + subtítulo
- Card "¿Qué quieres crear hoy?"
  - Input de prompt
  - Selector de formato (DOCX/PDF)
  - Botón "Crear con IA" → genera y abre el editor
- Card "Plantillas destacadas" (carrusel horizontal con 5 plantillas)
- Card "Documentos recientes" (lista de últimos 3-5 documentos)
- Card "Empieza desde cero" → Documento en blanco

**Top right:**
- Toggle modo oscuro/claro
- Avatar de usuario

### 7.2 Pantalla del editor

**Sidebar izquierda (estrecha, solo iconos):**
- Home
- Documento actual
- Subir archivo / imagen
- Eliminar
- Ajustes
- Footer: avatar usuario

**Panel chat (segunda barra):**
- Header: "Duke" + estado "En línea"
- Área de mensajes
- Input + botón enviar
- Footer: "Duke puede cometer errores. Verifica la información."

**Área del editor:**
- Header del documento:
  - Título editable
  - Botón "Exportar" + dropdown (DOCX / PDF)
  - Menú de tres puntos (renombrar, duplicar, eliminar)
- Toolbar tipo Word:
  - Deshacer / Rehacer
  - Estilo de párrafo (encabezado, párrafo)
  - Fuente, tamaño
  - Negrita, cursiva, subrayado
  - Alineación (izq, centro, der, justificado)
  - Listas (numerada, viñetas)
  - Enlace
- **Canvas del editor** (Tiptap)
- Status bar inferior:
  - Página X de Y
  - Conteo de palabras
  - Idioma
  - Vista (página, lectura)
  - Zoom (50% – 200%)

---

## 8. Fases de desarrollo

### 🟢 FASE 1 — Núcleo funcional (sin login, todo local)

**Objetivo:** App completamente funcional sin autenticación. Documentos guardados en IndexedDB del navegador.

#### Sprint 1 — Setup y home (3-4 días)
- [ ] Configurar Tailwind theme (colores, fuentes)
- [ ] Crear store global con Zustand
- [ ] Implementar sidebar del home
- [ ] Implementar área principal del home
- [ ] Card "¿Qué quieres crear hoy?" funcional
- [ ] Cards de plantillas destacadas (con datos hardcodeados)
- [ ] Card de documentos recientes (lee de IndexedDB)
- [ ] Toggle de tema oscuro/claro

#### Sprint 2 — Editor base (4-5 días)
- [ ] Instalar y configurar Tiptap
- [ ] Crear ruta `/editor/[id]`
- [ ] Implementar toolbar completa (todas las opciones del diseño)
- [ ] Status bar con conteo de palabras + página + idioma + zoom
- [ ] Sidebar izquierda del editor (iconos)
- [ ] Auto-guardado en IndexedDB cada 2 segundos
- [ ] Edición de título del documento

#### Sprint 3 — Duke + IA (4-5 días)
- [ ] Configurar Groq SDK
- [ ] Crear endpoint `/api/chat`
- [ ] Diseñar y probar el system prompt
- [ ] Implementar panel de chat en el editor
- [ ] Parser de acciones JSON de Duke
- [ ] Aplicar acciones al editor Tiptap (insert, replace, modify)
- [ ] Estado de carga / errores

#### Sprint 4 — Plantillas (3 días)
- [ ] Definir las 5 plantillas predefinidas con su estructura Tiptap
- [ ] Página `/templates` con la galería completa
- [ ] Subir plantilla custom (.docx) → parsear con mammoth.js
- [ ] Guardar plantillas custom en IndexedDB
- [ ] Crear documento desde plantilla

#### Sprint 5 — Exportación (3 días)
- [ ] Generar DOCX desde Tiptap JSON con la librería `docx`
- [ ] Generar PDF con html2pdf.js
- [ ] Menú de exportación en el editor
- [ ] Botón "Crear con IA" desde home → abre editor con contenido inicial

#### Sprint 6 — Pulido (2-3 días)
- [ ] Manejo de errores en toda la app
- [ ] Estados vacíos (no documentos, no plantillas)
- [ ] Loading states elegantes
- [ ] Responsive (mobile no es prioridad pero que no rompa)
- [ ] Deploy a Vercel

**Tiempo total estimado Fase 1: 3-4 semanas**

### 🟡 FASE 2 — Persistencia en la nube
- Auth con Supabase (email/password + Google OAuth)
- Migrar IndexedDB → PostgreSQL en Supabase
- Sincronización de documentos entre dispositivos
- Perfil de usuario funcional
- Plan Free vs Premium (límites de documentos)

### 🔵 FASE 3 — Features avanzados
- Sistema de carpetas/proyectos
- Papelera con restauración
- Historial de cambios del documento
- Compartir documento por link
- Comentarios y colaboración en tiempo real
- Implementar formatos beta (Informe, Presentación)
- Plantillas marketplace (compartir entre usuarios)

---

## 9. Variables de entorno

```env
# .env.local

# IA — Fase 1
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxx

# Supabase — Fase 2 (no necesarias todavía)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
```

---

## 10. Dependencias a instalar

```bash
# Core
npm install zustand idb-keyval clsx lucide-react nanoid

# Tiptap (editor)
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install @tiptap/extension-text-align @tiptap/extension-link
npm install @tiptap/extension-image @tiptap/extension-table
npm install @tiptap/extension-table-row @tiptap/extension-table-cell
npm install @tiptap/extension-table-header @tiptap/extension-character-count
npm install @tiptap/extension-placeholder @tiptap/extension-underline

# IA
npm install groq-sdk

# Exportación / importación
npm install docx html2pdf.js mammoth

# Tipos
npm install -D @types/html2pdf.js
```

---

## 11. Decisiones arquitectónicas clave

### Por qué localStorage + IndexedDB en Fase 1
- localStorage: para preferencias (tema, idioma)
- IndexedDB: para documentos (puede manejar MB de contenido)
- Sin DB ni servidor → deploy instantáneo, cero costos

### Por qué Zustand y no Context API
- Para un proyecto con varios stores (documento, chat, UI), Context se vuelve verboso
- Zustand es 1KB, sin boilerplate, perfecto para esto

### Por qué Tiptap y no construir desde cero
- ContentEditable es un infierno de bugs
- Tiptap maneja Android, iOS, copy-paste, deshacer/rehacer
- Te ahorra ~6 meses de trabajo

### Por qué Groq y no OpenAI
- Gratis con tier generoso
- 10x más rápido que OpenAI en respuestas
- LLaMA 3.3 70B es suficiente para estructurar contenido

### Por qué separar `/api/chat` de `/api/generate`
- `/chat`: conversación durante la edición (con contexto del documento)
- `/generate`: generación inicial desde el prompt del home
- Diferentes prompts, diferentes parámetros, mejor mantenimiento

---

## 12. Riesgos y consideraciones

| Riesgo | Mitigación |
|--------|-----------|
| Tiptap → DOCX puede perder formato | Usar mapeo manual nodo por nodo, probar exhaustivamente |
| Duke genera JSON inválido | Validar schema antes de aplicar al editor |
| IndexedDB no soportado en navegadores viejos | Fallback a localStorage con compresión |
| Documentos muy grandes ralentizan | Limitar a 50,000 palabras en Fase 1 |
| Groq tiene rate limits | Cachear respuestas + manejo de errores con retry |

---

## 13. Métricas de éxito de Fase 1

Cuando estos puntos se cumplan, la Fase 1 está completa:

- [ ] Usuario puede crear documento desde prompt en home
- [ ] Usuario puede abrir cualquier plantilla y editarla
- [ ] Usuario puede subir un .docx como plantilla custom
- [ ] Usuario puede chatear con Duke y ver cambios en tiempo real
- [ ] Usuario puede formatear texto con la toolbar
- [ ] Usuario puede exportar a DOCX y abrir en Word sin errores
- [ ] Usuario puede exportar a PDF
- [ ] Documentos persisten al cerrar y abrir el navegador
- [ ] App funciona en Vercel sin errores en producción

---

## 14. Próximos pasos inmediatos

1. **Confirmar el plan** con Edwuard
2. **Instalar dependencias** (sección 10)
3. **Configurar Tailwind theme** con la paleta del diseño
4. **Empezar Sprint 1** — Setup y home

---

*Documento generado como base de construcción. Se irá actualizando conforme avance el proyecto.*
*Última actualización: Mayo 2026*
