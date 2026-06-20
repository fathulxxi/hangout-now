import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import GroupPage from './group-page';

export default async function GroupRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('groups')
    .select('id, slug')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <GroupPage group={data} />
    </main>
  );
}
