'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createGroup(
  prevState: unknown,
  formData: FormData
): Promise<{ error: string } | void> {
  const name = formData.get('name')

  // Validate name is provided
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { error: 'Group name is required.' }
  }

  // Generate URL-safe slug
  const slug = generateSlug(name.trim())

  // Validate slug length
  if (slug.length < 2) {
    return { error: 'Group name must be at least 2 characters.' }
  }

  // Create Supabase client and insert group
  const supabase = await createClient()

  const { error } = await supabase.from('groups').insert({
    slug,
  })

  if (error) {
    // Check for unique constraint violation (slug already exists)
    if (error.code === '23505' || error.message.includes('duplicate')) {
      return {
        error: 'A group with this name already exists. Try a different name.',
      }
    }

    return { error: 'Something went wrong. Please try again.' }
  }

  // Redirect after successful insert
  redirect('/group/' + slug)
}

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      // Replace spaces and special characters with hyphens
      .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric (except spaces and hyphens)
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
      // Collapse multiple hyphens
      .replace(/-+/g, '-')
      // Trim hyphens from ends
      .replace(/^-+|-+$/g, '')
      // Limit to 50 characters
      .slice(0, 50)
  )
}
