// scripts/generate-from-adplist.ts
// Usage: npx tsx scripts/generate-from-adplist.ts ronakkumar-bathani
import 'dotenv/config'
import OpenAI from 'openai'
import fs from 'fs'

const ADPLIST_TOKEN = process.env.ADPLIST_TOKEN!
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

type AdplistMentorProfile = {
  fullName: string
  bio: string
  profile: {
    slug: string
    title: string
    organization: string
    image: string
  }
  experiences?: {
    tools?: Array<{ tool: string }>
    disciplines?: Array<{ discipline: string }>
    skills?: Array<{ skill: string }>
    rankedExpertise?: Array<{ expertise: { expertise: string } }>
  }
  preferences?: {
    topicPacks?: Array<{ packs: Array<{ title: string }> }>
  }
}

type GeneratedKnowledgeChunk = {
  source_label: string
  source_type: string
  topics: string[]
  content: string
}

type GeneratedMentor = {
  slug: string
  name: string
  title: string
  company: string
  bio: string
  avatar_url: string
  adplist_url: string
  expertise_tags: string[]
  total_mentoring_time: number
  sessions_completed: number
  rating: number
  _raw: {
    tools: string[]
    disciplines: string[]
    skills: string[]
    topicPacks: string[]
    expertiseAreas: string[]
  }
}

type MentorSeedRecord = Omit<GeneratedMentor, '_raw'> & {
  knowledge_chunks: GeneratedKnowledgeChunk[]
}

async function fetchMentorProfile(slug: string): Promise<AdplistMentorProfile> {
  const res = await fetch(
    `https://api.adplist.org/users/profile/mentor/${slug}`,
    { headers: { Authorization: `Token ${ADPLIST_TOKEN}` } }
  )
  const json = await res.json() as { data: AdplistMentorProfile }
  return json.data
}

function extractMentorFields(data: AdplistMentorProfile): GeneratedMentor {
  const tools = data.experiences?.tools?.map(t => t.tool) || []
  const disciplines = data.experiences?.disciplines?.map(d => d.discipline) || []
  const topicPacks = data.preferences?.topicPacks?.flatMap(
    topicPack => topicPack.packs.map(pack => pack.title)
  ) || []
  const skills = data.experiences?.skills?.map(skill => skill.skill) || []
  const expertiseAreas = data.experiences?.rankedExpertise?.map(
    ranked => ranked.expertise.expertise
  ) || []
  const expertise_tags = [...disciplines, ...tools].slice(0, 6)

  return {
    slug: data.profile.slug,
    name: data.fullName,
    title: data.profile.title,
    company: data.profile.organization,
    bio: data.bio,
    avatar_url: data.profile.image,
    adplist_url: `https://adplist.org/mentors/${data.profile.slug}`,
    expertise_tags,
    total_mentoring_time: 0,
    sessions_completed: 0,
    rating: 5.0,
    _raw: { tools, disciplines, skills, topicPacks, expertiseAreas }
  }
}

async function generateKnowledgeChunks(mentor: GeneratedMentor): Promise<GeneratedKnowledgeChunk[]> {
  const { _raw } = mentor

  const prompt = `You are generating realistic mentorship knowledge chunks for a RAG-based AI mentor twin system.

Mentor: ${mentor.name}
Title: ${mentor.title} at ${mentor.company}

Bio:
${mentor.bio}

Disciplines: ${_raw.disciplines.join(', ')}
Tools they teach: ${_raw.tools.join(', ')}
Skills: ${_raw.skills.join(', ')}
Session topics they offer: ${_raw.topicPacks.slice(0, 12).join(', ')}

Generate 8 knowledge chunks — realistic, specific advice this mentor would give in a 1:1 session. Each chunk should:
- Sound like their actual voice based on the bio
- Be concrete and actionable, not generic platitudes
- Be 3-5 sentences
- Focus on their actual expertise areas

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "source_label": "Session transcript · [realistic month/year between Jan 2023 - Mar 2025]",
    "source_type": "session_transcript",
    "topics": ["2-3 lowercase keywords"],
    "content": "The actual advice..."
  }
]`

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  })

  const raw = res.choices[0].message.content!.trim()
  console.log('GPT RAW OUTPUT (first 300 chars):', raw.slice(0, 300))

  // Strip markdown fences if present
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  // Extract JSON array even if there's surrounding text
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
  if (!arrayMatch) {
    throw new Error(`No JSON array found in GPT response. Raw: ${raw.slice(0, 500)}`)
  }

  return JSON.parse(arrayMatch[0]) as GeneratedKnowledgeChunk[]
}

async function run() {
  const slug = process.argv[2]
  if (!slug) {
    console.error('Usage: npx tsx scripts/generate-from-adplist.ts <slug>')
    process.exit(1)
  }

  console.log(`\nFetching: ${slug}`)
  const data = await fetchMentorProfile(slug)
  const mentor = extractMentorFields(data)
  console.log(`Got profile: ${mentor.name} · ${mentor.title}`)

  console.log('Generating knowledge chunks...')
  const chunks = await generateKnowledgeChunks(mentor)
  console.log(`Generated ${chunks.length} chunks`)

  const finalMentor: MentorSeedRecord = {
    slug: mentor.slug,
    name: mentor.name,
    title: mentor.title,
    company: mentor.company,
    bio: mentor.bio,
    avatar_url: mentor.avatar_url,
    adplist_url: mentor.adplist_url,
    expertise_tags: mentor.expertise_tags,
    total_mentoring_time: mentor.total_mentoring_time,
    sessions_completed: mentor.sessions_completed,
    rating: mentor.rating,
    knowledge_chunks: chunks,
  }

  const outputPath = './data/mentors.json'
  let existing: MentorSeedRecord[] = []
  if (fs.existsSync(outputPath)) {
    existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8')) as MentorSeedRecord[]
    existing = existing.filter(mentorRecord => mentorRecord.slug !== slug)
  }
  existing.push(finalMentor)
  fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2))

  console.log(`\n✅ Saved to ${outputPath}`)
  console.log(`Now run: npx tsx scripts/seed-knowledge.ts`)
}

run().catch(console.error)
