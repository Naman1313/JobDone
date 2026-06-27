export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <main className="flex flex-col gap-6 items-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
          Welcome to JobDone
        </h1>
        <p className="text-lg text-foreground/80">
          Your Next.js frontend is up and running. Get started by editing <code className="bg-black/10 dark:bg-white/10 px-2 py-1 rounded-md font-mono text-sm">app/page.tsx</code>.
        </p>
      </main>
    </div>
  );
}
