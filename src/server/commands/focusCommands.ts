
import { Context } from 'telegraf';

export async function handleFocusCommand(ctx: Context) {
  await ctx.reply(
    "📚 *Evidence-Based Focus Techniques* 📚\n\n" +
    "Based on neurophysiology research, here are effective strategies for improving concentration:\n\n" +
    "1️⃣ *Pomodoro Technique*: Work in focused 25-minute intervals with 5-minute breaks. This works with your brain's natural attention cycle and prevents cognitive fatigue.\n\n" +
    "2️⃣ *Environment Optimization*: Reduce visual and auditory distractions. Each distraction costs your prefrontal cortex valuable resources to inhibit.\n\n" +
    "3️⃣ *Implementation Intentions*: Create specific if-then plans like \"If I check my phone, then I will put it in another room.\" This reduces decision fatigue.\n\n" +
    "4️⃣ *Task Initiation*: Start with just 2 minutes of work to overcome activation energy barriers in the brain.\n\n" +
    "5️⃣ *Ultradian Rhythms*: Work with your natural 90-minute cognitive cycles followed by 20-minute rest periods.\n\n" +
    "Which technique would you like more details on?",
    { parse_mode: 'Markdown' }
  );
}

export async function handleBreakCommand(ctx: Context) {
  await ctx.reply(
    "🧠 *Neurologically Optimized Break Suggestions* 🧠\n\n" +
    "Taking proper breaks is essential for cognitive recovery. Here are science-backed break activities:\n\n" +
    "1️⃣ *Nature Exposure* (5-15 min): Even viewing images of nature reduces cortisol and restores directed attention. A short walk outside is ideal.\n\n" +
    "2️⃣ *Movement Break* (3-5 min): Physical movement increases BDNF (brain-derived neurotrophic factor) which supports learning and neural health.\n\n" +
    "3️⃣ *Breathing Exercise* (2-3 min): 4-7-8 breathing (inhale for 4, hold for 7, exhale for 8) activates your parasympathetic nervous system.\n\n" +
    "4️⃣ *Sensory Switch* (5 min): Engage a different sense than the one you've been using for work to allow neural recovery.\n\n" +
    "5️⃣ *Social Micro-Connection* (5 min): Brief positive social interaction boosts oxytocin and reduces stress hormones.\n\n" +
    "Remember: avoid digital screens during breaks as they don't provide the cognitive rest your brain needs!",
    { parse_mode: 'Markdown' }
  );
}

export async function handleProcrastinationCommand(ctx: Context) {
  await ctx.reply(
    "⏰ *Neuroscience of Procrastination & Solutions* ⏰\n\n" +
    "Procrastination happens when your limbic system (emotions) overrides your prefrontal cortex (planning). Here are research-backed strategies to overcome it:\n\n" +
    "1️⃣ *Task Decomposition*: Break work into tasks requiring less than 25 minutes. Smaller tasks create less limbic system resistance.\n\n" +
    "2️⃣ *Two-Minute Rule*: If it takes less than 2 minutes, do it immediately. This creates momentum and dopamine release.\n\n" +
    "3️⃣ *Temptation Bundling*: Pair unwanted tasks with something enjoyable to leverage your brain's reward system.\n\n" +
    "4️⃣ *Implementation Intentions*: Create specific when-then plans. Example: \"When I sit at my desk, then I will work on task X for 25 minutes.\"\n\n" +
    "5️⃣ *Strategic Pre-commitment*: Use apps that block distractions or make public commitments to leverage your brain's consistency bias.\n\n" +
    "Which technique would you like to try first?",
    { parse_mode: 'Markdown' }
  );
}
