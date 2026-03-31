import { Mentor } from '@/lib/type'

export function MentorSidebar({ mentor }: { mentor: Mentor }) {
  return (
    <aside className="w-64 border-r border-gray-100 bg-gray-50 flex flex-col p-5 gap-5">
      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium text-base">
          {mentor.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{mentor.name}</p>
          <p className="text-xs text-gray-500">{mentor.title} · {mentor.company}</p>
        </div>
      </div>

      {/* Twin Status Badge */}
      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full w-fit">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Twin is active
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: mentor.session_count, label: 'Sessions' },
          { value: mentor.mentee_count, label: 'Mentees' },
          { value: mentor.rating, label: 'Rating' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-lg p-2 text-center">
            <p className="font-medium text-gray-900 text-sm">{stat.value}</p>
            <p className="text-gray-400 text-[10px] mt-0.5">{stat.label}</p>
          </div>
        ))}
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
      <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-4">
        {mentor.bio}
      </p>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-gray-200">
        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          ADPList · MentorTwin Phase 2
        </p>
      </div>
    </aside>
  )
}