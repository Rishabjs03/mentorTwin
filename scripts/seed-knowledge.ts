import 'dotenv/config';
import { supabaseAdmin } from "@/lib/supabase";
import { embedText } from "@/lib/embed";
import  mentorsData from "../data/mentors.json";


async function seed(){
    console.log("Seeding knowledge chunks...")

    for (const mentor of mentorsData){
        const {data: mentorRecord, error: mentorError} = await supabaseAdmin.from("mentors").upsert({
        slug: mentor.slug,
        name: mentor.name,
        title: mentor.title,
        company: mentor.company,
        bio: mentor.bio,
        expertise_tags: mentor.expertise_tags,
        total_mentoring_time: mentor.total_mentoring_time,
        sessions_completed: mentor.sessions_completed,
        rating: mentor.rating,
        adplist_url: mentor.adplist_url,
        twin_active: true
        },{onConflict: "slug"}).select().single();

        if (mentorError){
            console.error("Error upserting mentor:", mentorError);
            continue;
        }

        for (const chunk of mentor.knowledge_chunks){
            const embedding = await embedText(chunk.content);
            
            const {error: chunkError} = await supabaseAdmin.from("knowledge_chunks").insert({
                mentor_id: mentorRecord.id,
                content: chunk.content,
                source_label: chunk.source_label,
                source_type: chunk.source_type,
                topics: chunk.topics,
                embedding
            })
            if (chunkError){
                console.error("Error inserting knowledge chunk:", chunkError);
                continue;
            }

            await new Promise(r => setTimeout(r, 200))
        }
    
    }
    console.log('Seed complete!')
}

seed()
