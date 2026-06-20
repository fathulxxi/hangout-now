import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold tracking-tight">Hangout Now</h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        See who&apos;s free right now.
      </p>
      <Link
        href="/create-group"
        className="mt-8 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
      >
        Create a Group
      </Link>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Create a group and share the link — no signup needed.
      </p>
    </main>
  );
}
