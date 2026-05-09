import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-center text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold">Pagina no encontrada</h1>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
