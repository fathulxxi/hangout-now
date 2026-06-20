'use server'

import { createClient } from '@/lib/supabase/server'

export async function joinGroup(
  prevState: unknown,
  formData: FormData
): Promise<{ token: string; memberId: string; name: string } | { error: string }> {
  const name = formData.get('name')
  const groupId = formData.get('groupId')

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { error: 'Name is required.' }
  }

  if (!groupId || typeof groupId !== 'string' || groupId.trim() === '') {
    return { error: 'Group ID is required.' }
  }

  const token = crypto.randomUUID()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .insert({ group_id: groupId, name: name.trim(), token })
    .select()
    .single()

  if (error) {
    return { error: 'Something went wrong.' }
  }

  return {
    token: data.token,
    memberId: data.id,
    name: data.name,
  }
}
