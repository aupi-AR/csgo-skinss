# Documentación del proyecto CS:GO Skins

> Proyecto construido con **SvelteKit 2 + Svelte 5** — esto es importante porque Svelte 5 introdujo un sistema nuevo llamado **Runes** que reemplaza la reactividad de Svelte 4. No es React, pero muchos conceptos se pueden comparar.

---

## Stack / Tecnologías

| Tecnología | Rol |
|---|---|
| **SvelteKit 2** | Framework full-stack (router + SSR + servidor) |
| **Svelte 5** | Librería de UI con sistema de Runes |
| **Vite 6** | Bundler / dev server |
| **adapter-auto** | Detecta automáticamente dónde se despliega (Vercel, Node, etc.) |

No hay base de datos propia. Los datos vienen de dos APIs externas:
- **ByMykel CSGO-API** — JSON público en GitHub con todas las skins
- **Skinport API** — precios de mercado en tiempo real

---

## Estructura de archivos

```
src/
├── app.html                        ← HTML base (el <body> vacío donde SvelteKit inyecta todo)
├── lib/
│   └── prices.js                   ← Lógica de precios (cache + helper)
└── routes/
    ├── +layout.svelte              ← Layout global (navbar, estilos globales)
    ├── +page.svelte                ← Página principal (grid de skins + filtros)
    ├── +page.server.js             ← Servidor de la página principal (fetch + filtros + paginación)
    └── skin/
        └── [id]/
            ├── +page.svelte        ← Página de detalle de una skin
            └── +page.server.js     ← Servidor del detalle (busca la skin por ID)
```

El prefijo `+` es convención de SvelteKit — no es opcional, el router los busca exactamente así.

---

## Convenciones de SvelteKit (los archivos `+`)

### `+page.server.js` → Solo corre en el servidor
Exporta una función `load()`. SvelteKit la ejecuta antes de renderizar la página y le pasa el resultado como prop `data` al componente `.svelte`. El usuario nunca ve este código, no va al browser.

### `+page.svelte` → El componente de la página
Recibe `data` del server. Tiene `<script>`, HTML y `<style>` en un solo archivo.

### `+layout.svelte` → Wrapper global
Envuelve todas las páginas. Todo lo que pongas acá (navbar, footer, estilos globales) aparece en todas las rutas.

### `[id]` en el nombre de carpeta → Ruta dinámica
`/skin/[id]` equivale a React Router's `/skin/:id`. El valor de `id` llega a `load({ params })` como `params.id`.

---

## Runes de Svelte 5

Las **Runes** son la nueva API de reactividad de Svelte 5. Reemplazan el sistema implícito de Svelte 4 (`let x = ...` era reactivo automáticamente). Ahora la reactividad es explícita con funciones especiales que empiezan con `$`.

### `$props()` — Recibir props del padre

```js
// Svelte 5 (Runes)
let { data } = $props();

// Equivalente React
function Page({ data }) { ... }
// o con destructuring
const { data } = props;
```

En SvelteKit, `data` es lo que retorna `load()` del `.server.js`. SvelteKit lo inyecta automáticamente.

---

### `$derived()` — Valor computado (reactivo)

```js
// Svelte 5
let rarityColor = $derived(rarityColors[skin.rarity?.name] ?? '#aaa');

// Equivalente React
const rarityColor = useMemo(() => rarityColors[skin.rarity?.name] ?? '#aaa', [skin.rarity]);
```

Se recalcula automáticamente cuando cambia la dependencia. Sin `$derived`, sería un valor estático calculado una sola vez.

En [skin/[id]/+page.svelte](src/routes/skin/%5Bid%5D/+page.svelte) también se usa para "extraer" partes de `data`:

```js
let skin = $derived(data.skin);
let minPrice = $derived(data.minPrice);
```

Esto no es estrictamente necesario acá (podrían usarse directamente `data.skin`), pero hace el template más limpio.

---

### `{@render children()}` — Renderizar slots en el layout

```svelte
<!-- +layout.svelte -->
let { children } = $props();
{@render children()}
```

```jsx
// Equivalente React
function Layout({ children }) {
  return <>{children}</>
}
```

`children` en Svelte 5 es un **snippet** (función renderizable). `{@render children()}` lo ejecuta. En Svelte 4 era `<slot />`.

---

## Flujo de datos completo

```
Usuario navega a /?weapon=AK-47&page=2
        │
        ▼
+page.server.js → load({ url })
  ├── lee url.searchParams (page, weapon, collection)
  ├── fetch(CSGO_API) ──────────────────────────┐
  ├── getPriceMap() → fetch(Skinport) + cache   │ en paralelo con Promise.all
  ├── filtra skins                               │
  ├── pagina (slice)                             │
  └── retorna { skins, weapons, collections, ... }
        │
        ▼
+page.svelte recibe data como prop
  └── renderiza grid + filtros + paginación
```

---

## Archivo por archivo

### `src/lib/prices.js`

Dos responsabilidades:

**1. `getPriceMap()`** — Trae todos los precios de Skinport y los guarda en caché en memoria por 1 hora.

```
Skinport devuelve: [{ market_hash_name: "AK-47 | Redline (Field-Tested)", min_price: 12.5 }, ...]
getPriceMap() convierte eso en: { "AK-47 | Redline (Field-Tested)": 12.5, ... }
```

La caché es una variable de módulo (`let cache = null`). Vive mientras el servidor esté corriendo — si reinicias el servidor, se resetea.

**2. `skinPrices(name, wears, priceMap)`** — Dado el nombre de una skin y sus variantes de wear, busca en el mapa y devuelve:
- `min`: precio mínimo entre todos los wears
- `byWear`: objeto `{ "Factory New": 45.2, "Field-Tested": 12.5, ... }`

---

### `src/routes/+layout.svelte`

Navbar global y CSS de reset. Dos cosas importantes:

**`:global(...)`** — Los estilos en Svelte son scoped por defecto (solo afectan al componente). `:global()` rompe ese scope para aplicar estilos a todo el documento.

```css
/* Esto afecta a TODOS los elementos de la app */
:global(*, *::before, *::after) { box-sizing: border-box; }
:global(body) { background-color: #0f1117; }
```

Sin `:global()`, el `body` del layout no afectaría al `body` real del HTML.

---

### `src/routes/+page.server.js` — Servidor principal

**Lectura de query params:**
```js
const page = Number(url.searchParams.get('page') ?? 1);
const weaponFilter = url.searchParams.get('weapon') ?? '';
```
Equivale a `useSearchParams()` de React Router, pero en el servidor.

**Filtro de guantes:**
```js
const isGlove = (s) =>
  s.category?.name === 'Gloves' ||
  s.weapon?.name?.match(/Gloves?|Wraps?/);
```
Los guantes en la API vienen con distintos nombres de arma ("Specialist Gloves", "Hand Wraps", etc.), así que en vez de listarlos uno por uno, se agrupan bajo un solo filtro "Guantes".

**Deduplicación con `Set`:**
```js
const allWeaponNames = [...new Set(all.map((s) => s.weapon?.name).filter(Boolean))];
```
`Set` elimina duplicados. El spread `[...]` lo convierte de vuelta a array. Sin esto habría miles de "AK-47" repetidos en el dropdown.

**Relaciones en los datos:**
- **1:N** — Un arma tiene muchas skins (`weapon.name === "AK-47"`)
- **M:N** — Una skin puede estar en varias colecciones (`skin.collections` es un array)

---

### `src/routes/+page.svelte` — Página principal

**CSS custom properties dinámicas:**
```svelte
<a class="card" style="--rarity: {rarityColor(skin.rarity)}">
```
```css
.card { border-top: 3px solid var(--rarity, #4b69ff); }
```
Se pasa el color de rareza como variable CSS inline. El componente la consume con `var(--rarity)`. Más limpio que poner el color directamente en el style inline.

**Navegación por filtros sin JavaScript de estado:**
```js
onchange={(e) => {
  window.location.href = buildUrl({ weapon: e.target.value, ... });
}}
```
Al cambiar un `<select>`, redirige a la misma página con los nuevos query params. No hay estado local (`useState`) — el estado vive en la URL. SvelteKit re-ejecuta `load()` automáticamente.

**`{#each}` — Iteración en templates:**
```svelte
{#each data.skins as skin}
  <a href="/skin/{skin.id}" class="card">...</a>
{/each}
```
Equivale a `.map()` en JSX:
```jsx
{data.skins.map(skin => <a key={skin.id} href={`/skin/${skin.id}`}>...</a>)}
```

**`{#if}` — Condicional:**
```svelte
{#if data.weaponFilter || data.collectionFilter}
  <a class="clear-btn">✕ Limpiar filtros</a>
{/if}
```
Equivale a:
```jsx
{(data.weaponFilter || data.collectionFilter) && <a>✕ Limpiar filtros</a>}
```

---

### `src/routes/skin/[id]/+page.server.js` — Servidor de detalle

```js
export async function load({ params }) {
  const skin = all.find((s) => s.id === params.id);
  if (!skin) error(404, 'Skin no encontrada');
  ...
}
```

`params.id` viene del nombre de la carpeta `[id]`. Si la skin no existe, `error(404, ...)` de SvelteKit interrumpe el render y muestra la página de error.

---

### `src/routes/skin/[id]/+page.svelte` — Página de detalle

Usa `$derived` para todo porque `data` podría actualizarse si SvelteKit recarga datos (navegación del lado del cliente).

**`<svelte:head>`** — Inyecta etiquetas en el `<head>` del HTML:
```svelte
<svelte:head>
  <title>{skin.weapon?.name} | {skin.pattern?.name} — CS:GO Skins</title>
</svelte:head>
```
En React se haría con una librería como `react-helmet` o el `<Head>` de Next.js.

---

## Resumen de equivalencias React ↔ Svelte 5

| Concepto | React | Svelte 5 |
|---|---|---|
| Props | `function C({ data })` | `let { data } = $props()` |
| Estado local | `useState(val)` | `let x = $state(val)` |
| Valor computado | `useMemo(() => ..., [dep])` | `let x = $derived(...)` |
| Efectos | `useEffect(() => ..., [dep])` | `$effect(() => ...)` |
| Renderizar hijos | `{children}` | `{@render children()}` |
| Condicional en template | `{cond && <Comp />}` | `{#if cond}<Comp />{/if}` |
| Lista en template | `{arr.map(x => <El key={x.id}/>)}` | `{#each arr as x}<El />{/each}` |
| Estilos globales | CSS Modules / styled-components | `:global()` en `<style>` |
| SSR con datos | `getServerSideProps` (Next.js) | `export async function load()` en `.server.js` |
| Rutas dinámicas | `/pages/skin/[id].jsx` (Next) | `/routes/skin/[id]/+page.svelte` |
| Meta tags | `react-helmet` / `<Head>` | `<svelte:head>` |
| Variables CSS dinámicas | `style={{ '--color': val }}` | `style="--color: {val}"` |

---

## Lo que NO tiene este proyecto (posibles mejoras)

- No hay autenticación ni usuarios
- No hay base de datos propia — todo se fetchea en runtime
- El caché de precios es en memoria del proceso, se pierde al reiniciar
- No hay tests
- Las imágenes se cargan lazy pero no hay CDN propio — depende de la API externa
