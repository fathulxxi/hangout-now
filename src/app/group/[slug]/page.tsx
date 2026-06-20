export default async function GroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold">Group: {slug}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Group page placeholder
      </p>
    </main>
  );
}
