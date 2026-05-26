export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-8">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          ELO.ME
        </p>

        <h1 className="max-w-4xl text-6xl font-black uppercase leading-none tracking-tight text-slate-950 md:text-8xl">
          Seus dados.
          <br />
          Seu controle.
        </h1>

        <p className="mt-8 max-w-xl text-lg text-slate-600">
          Protocolo de identidade, consentimento e auditoria para dados de saúde.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="/patient/dashboard"
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Acessar demo
          </a>

          <a
            href="/auth/login"
            className="rounded-md border border-blue-200 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-blue-700"
          >
            Entrar
          </a>
        </div>
      </section>
    </main>
  );
}
