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

  const { data: members } = await supabase
    .from('members')
    .select('id, name, availability(*)')
    .eq('group_id', data.id);

  // Normalize availability to always be an array (Supabase may return a
  // single object depending on the generated relationship types).
  const normalizedMembers = (members ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    availability: Array.isArray(m.availability)
      ? m.availability
      : m.availability
        ? [m.availability]
        : [],
  }));

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <GroupPage group={data} members={normalizedMembers} />
    </main>
  );
}
