// scripts/generate-from-adplist.ts
// Usage: npx tsx scripts/generate-from-adplist.ts ronakkumar-bathani
import 'dotenv/config'
import OpenAI from 'openai'
import fs from 'fs'

const ADPLIST_TOKEN = process.env.ADPLIST_TOKEN!
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

async function fetchMentorProfile(slug: string) {
  const res = await fetch(
    `https://api.adplist.org/users/profile/mentor/${slug}`,
    { headers: { Authorization: `Token ${ADPLIST_TOKEN}` } }
  )
  const json = await res.json()
  return json.data
}

function extractMentorFields(data: any) {
  const tools = data.experiences?.tools?.map((t: any) => t.tool) || []
  const disciplines = data.experiences?.disciplines?.map((d: any) => d.discipline) || []
  const topicPacks = data.preferences?.topicPacks?.flatMap(
    (tp: any) => tp.packs.map((p: any) => p.title)
  ) || []
  const skills = data.experiences?.skills?.map((s: any) => s.skill) || []
  const expertiseAreas = data.experiences?.rankedExpertise?.map(
    (r: any) => r.expertise.expertise
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
    session_count: 0,
    mentee_count: 0,
    rating: 5.0,
    _raw: { tools, disciplines, skills, topicPacks, expertiseAreas }
  }
}

async function generateKnowledgeChunks(mentor: any) {
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

  return JSON.parse(arrayMatch[0])
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

  const { _raw, ...mentorClean } = mentor
  const finalMentor = { ...mentorClean, knowledge_chunks: chunks }

  const outputPath = './data/mentors.json'
  let existing: any[] = []
  if (fs.existsSync(outputPath)) {
    existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
    existing = existing.filter((m: any) => m.slug !== slug)
  }
  existing.push(finalMentor)
  fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2))

  console.log(`\n✅ Saved to ${outputPath}`)
  console.log(`Now run: npx tsx scripts/seed-knowledge.ts`)
}

run().catch(console.error)