import { supabase, supabaseAdmin } from '@/lib/supabase'
import { MentorSidebar } from '@/components/MentorSidebar'
import { TwinChat } from '@/components/TwinChat'
import { notFound } from 'next/navigation'

export default async function MentorPage({ params }: {params: Promise<{ slug: string }>}) {
  const {slug} = await params;
  const { data: mentor } = await supabaseAdmin
    .from('mentors')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!mentor) notFound()

  return (
    <main className="h-screen flex overflow-hidden bg-white">
      <MentorSidebar mentor={mentor} />
      <TwinChat mentorId={mentor.id} mentorName={mentor.name} />
    </main>
  )
}