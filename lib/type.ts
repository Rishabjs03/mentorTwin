export type Mentor = {
  id: string
  slug: string
  name: string
  title: string
  company: string
  avatar_url?: string
  bio: string
  expertise_tags: string[]
  total_mentoring_time: number | string | null
  sessions_completed: number | null
  rating: number
  adplist_url?: string
  twin_active: boolean
};

export type KnowledgeChunk = {
  id: string
  mentor_id: string
  content: string
  source_label: string
  source_type: string
  topics: string[]
};

export type Message = {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]  
}
