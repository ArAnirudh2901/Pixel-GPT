export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-12">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            AI-driven image editor
          </p>
          <h1 className="text-4xl font-semibold text-neutral-50">
            Edit images with a conversational agent
          </h1>
          <p className="max-w-2xl text-base text-neutral-300">
            Upload an image, describe your changes, and the assistant will
            translate your request into ImageKit URL transformations in real
            time.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-neutral-50">Quick start</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Upload your image and start editing with AI-powered transformations.
          </p>
          <a
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-neutral-50 px-4 text-sm font-medium text-neutral-900 transition hover:bg-white"
            href="/editor/demo"
          >
            Launch editor
          </a>
        </div>
      </main>
    </div>
  );
}
