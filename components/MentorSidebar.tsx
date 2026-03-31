import { formatMentoringTime } from '@/lib/mentor-stats'
import { Mentor } from '@/lib/type'

export function MentorSidebar({ mentor }: { mentor: Mentor }) {
  return (
    <aside className="flex max-h-[36dvh] w-full flex-shrink-0 flex-col gap-4 overflow-y-auto border-b border-gray-100 bg-gray-50 px-4 py-4 sm:px-5 lg:h-screen lg:max-h-none lg:w-[320px] lg:border-b-0 lg:border-r lg:py-5">
      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-base font-medium text-white sm:h-12 sm:w-12">
          {mentor.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-sm">{mentor.name}</p>
          <p className="text-xs leading-5 text-gray-500">{mentor.title} · {mentor.company}</p>
        </div>
      </div>

      {/* Twin Status Badge */}
      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full w-fit">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Twin is active
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="col-span-2 rounded-lg border border-gray-100 bg-white p-2 text-center sm:col-span-1">
          <p className="text-sm font-medium text-gray-900">{formatMentoringTime(mentor.total_mentoring_time)}</p>
          <p className="mt-0.5 text-[10px] leading-tight text-gray-400">Mentoring time</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-2 text-center">
          <p className="text-sm font-medium text-gray-900">
            {new Intl.NumberFormat('en-US').format(mentor.sessions_completed ?? 0)}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-gray-400">Completed</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-2 text-center">
          <p className="text-sm font-medium text-gray-900">{mentor.rating}</p>
          <p className="mt-0.5 text-[10px] leading-tight text-gray-400">Rating</p>
        </div>
      </div>

      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise_tags.map(tag => (
          <span key={tag} className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-600">
            {tag}
          </span>
        ))}
      </div>

      {/* Bio */}
      <p className="border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-500">
        {mentor.bio}
      </p>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-3 lg:mt-auto">
        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          ADPList · MentorTwin Phase 2
        </p>
      </div>
    </aside>
  )
}
