'use server'

import { createClient } from '@/lib/supabase/server'

export async function setAvailability(
  memberId: string,
  token: string,
  freeUntil: string
): Promise<{ success: boolean } | { error: string }> {
  if (!memberId || typeof memberId !== 'string' || memberId.trim() === '') {
    return { error: 'Member ID is required.' }
  }

  if (!token || typeof token !== 'string' || token.trim() === '') {
    return { error: 'Token is required.' }
  }

  if (!freeUntil || typeof freeUntil !== 'string' || freeUntil.trim() === '') {
    return { error: 'Free until time is required.' }
  }

  const supabase = await createClient()

  // Verify token matches member
  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('id, token')
    .eq('id', memberId)
    .single()

  if (memberError || !memberData) {
    return { error: 'Member not found.' }
  }

  if (memberData.token !== token) {
    return { error: 'Invalid token.' }
  }

  // Delete any existing availability rows for this member
  const { error: deleteError } = await supabase
    .from('availability')
    .delete()
    .eq('member_id', memberId)

  if (deleteError) {
    return { error: 'Something went wrong.' }
  }

  // Insert new availability row
  const { error: insertError } = await supabase
    .from('availability')
    .insert({ member_id: memberId, free_until: freeUntil })

  if (insertError) {
    return { error: 'Something went wrong.' }
  }

  return { success: true }
}

export async function clearAvailability(
  memberId: string,
  token: string
): Promise<{ success: boolean } | { error: string }> {
  if (!memberId || typeof memberId !== 'string' || memberId.trim() === '') {
    return { error: 'Member ID is required.' }
  }

  if (!token || typeof token !== 'string' || token.trim() === '') {
    return { error: 'Token is required.' }
  }

  const supabase = await createClient()

  // Verify token matches member
  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('id, token')
    .eq('id', memberId)
    .single()

  if (memberError || !memberData) {
    return { error: 'Member not found.' }
  }

  if (memberData.token !== token) {
    return { error: 'Invalid token.' }
  }

  // Delete availability rows for this member
  const { error: deleteError } = await supabase
    .from('availability')
    .delete()
    .eq('member_id', memberId)

  if (deleteError) {
    return { error: 'Something went wrong.' }
  }

  return { success: true }
}
