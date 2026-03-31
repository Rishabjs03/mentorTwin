export type Mentor = {
  id: string
  slug: string
  name: string
  title: string
  company: string
  avatar_url?: string
  bio: string
  expertise_tags: string[]
  session_count: number
  mentee_count: number
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