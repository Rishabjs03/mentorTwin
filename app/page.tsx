import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function HomePage() {
  const { data: mentors } = await supabaseAdmin
    .from('mentors')
    .select('*')
    .eq('twin_active', true)
    .order('session_count', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            ADPList Phase 2 · MentorTwin
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Get mentorship without scheduling a meeting
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Every mentor's knowledge is encoded from their real sessions. 
            Ask anything, get guidance grounded in what they've actually taught.
          </p>
        </div>

        {/* Mentor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors?.map(mentor => (
            <Link
              key={mentor.id}
              href={`/mentor/${mentor.slug}`}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {mentor.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{mentor.name}</p>
                  <p className="text-sm text-gray-500">{mentor.title} · {mentor.company}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Twin active
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {mentor.expertise_tags?.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5 text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-50 pt-3">
                <span>{mentor.session_count} sessions</span>
                <span>{mentor.mentee_count} mentees</span>
                <span>⭐ {mentor.rating}</span>
                <span className="ml-auto text-emerald-600 text-sm font-medium group-hover:underline">
                  Ask their Twin →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}