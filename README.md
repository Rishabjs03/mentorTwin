# MentorTwin

A working prototype of ADPList Phase 2: mentor knowledge encoded once, available to any mentee 24/7 without the mentor being online.

## The Problem
ADPList has 500M+ minutes of mentorship sessions. That knowledge disappears after each call. Mentees lose access to proven advice, mentors can't scale their impact.

## The Solution
MentorTwin encodes a mentor's knowledge into an AI system. Mentees get personalized guidance grounded in what the mentor has actually said, not generic advice.

## How It Works
1. **Knowledge Encoding**: Session transcripts → AI chunks → embedded vectors
2. **Smart Matching**: Mentee question → finds most relevant mentor insights
3. **Grounded Responses**: GPT-4 generates answers using only real mentor knowledge
4. **Source Attribution**: Every answer shows exactly where it came from

## Key Features
- **Trust Through Transparency**: Shows sources for every answer
- **No Hallucinations**: Defers to live sessions when confidence is low
- **Always Available**: 24/7 access to mentor wisdom
- **Scalable Impact**: One mentor session helps unlimited mentees

## Codebase Overview

```
mentortwin/
├── app/                          # Next.js App Router
│   ├── api/chat/                 # Chat API endpoint
│   │   └── route.ts             # Handles chat requests with RAG
│   ├── mentor/[slug]/           # Dynamic mentor pages
│   │   └── page.tsx            # Individual mentor chat interface
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── MentorSidebar.tsx        # Mentor info sidebar
│   ├── MessageBubble.tsx        # Chat message display
│   └── TwinChat.tsx            # Main chat interface
├── lib/                         # Utility libraries
│   ├── embed.ts                 # Text embedding functions
│   ├── openai.ts                # OpenAI API client
│   ├── supabase.ts              # Database client
│   └── type.ts                  # TypeScript type definitions
├── data/                        # Static data
│   └── mentor.json              # Mentor information
├── scripts/                     # Development scripts
│   └── seed-knowledge.ts        # Database seeding
├── public/                      # Static assets
└── package.json                 # Dependencies and scripts
```

## Architecture Explanation

**Frontend (Next.js 15 + React)**
- `app/` contains the Next.js 15 App Router structure
- Dynamic routes like `/mentor/[slug]` create individual mentor pages
- Components in `components/` handle the chat interface and UI

**Backend (API Routes)**
- `app/api/chat/route.ts` is the main API endpoint
- Handles streaming chat responses with real-time AI generation
- Uses Supabase for vector search and mentor data retrieval

**AI/ML Pipeline**
- `lib/embed.ts`: Converts text to vector embeddings using OpenAI
- `lib/openai.ts`: Handles GPT-4 chat completion requests
- Knowledge chunks are stored in Supabase with pgvector for similarity search

**Data Layer (Supabase)**
- `lib/supabase.ts`: Database client with both public and admin access
- Vector embeddings stored using pgvector extension
- Mentor profiles and session transcripts in relational tables

**Key Files**
- `components/TwinChat.tsx`: Main chat component with streaming UI
- `app/api/chat/route.ts`: RAG implementation with source attribution
- `lib/supabase.ts`: Database configuration and client setup

## What's Next
- **Real Data**: Ingest actual session transcripts (with consent)
- **Mentor Control**: Dashboard to review/correct AI responses
- **Async Questions**: Queue system for mentor-recorded answers
- **Multi-Mentor Insights**: Synthesize advice from multiple experts

## Tech Stack
Next.js · Supabase (pgvector) · OpenAI · Vercel

---

*Built to preserve and amplify mentorship wisdom at scale.*
