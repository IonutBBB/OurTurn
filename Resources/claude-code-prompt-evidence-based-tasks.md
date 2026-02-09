# Claude Code Prompt: Evidence-Based AI Task Suggestion Engine

## Context

The Care Plan page has an "AI Suggest" feature that generates daily task suggestions for people with early-stage dementia. Currently, it generates generic/random suggestions. We need to refactor the AI prompt and task generation logic so that **every suggestion is grounded in a specific, cited clinical evidence source** — not invented or generic wellness advice.

## Objective

Refactor the AI task suggestion system (the DeepSeek V3 prompt + task generation logic) so that all generated tasks are drawn **exclusively** from a curated evidence-based intervention library. The AI should compose and personalize tasks from this library — it should **never invent interventions from scratch**.

---

## Step 1: Create the Evidence-Based Intervention Library

Create a new file `src/data/evidence-based-interventions.ts` (or similar path matching project structure) that serves as the **single source of truth** for all task suggestions. Every intervention must have a clinical citation. Structure it as follows:

```typescript
export interface EvidenceBasedIntervention {
  id: string;
  category: TaskCategory;
  intervention: string;
  description: string;
  adaptations: string[]; // variations for personalization
  frequency: string; // e.g. "daily", "2-3x/week", "weekly"
  timeOfDay: "morning" | "midday" | "afternoon" | "evening" | "flexible";
  durationMinutes: number;
  difficultyLevel: "simple" | "moderate" | "engaging";
  targetDomains: CognitiveDomain[];
  safetyNotes?: string;
  contraindications?: string[];
  evidence: {
    source: string;
    study: string;
    level: "RCT" | "meta-analysis" | "systematic-review" | "guideline" | "expert-consensus";
    finding: string;
  };
}

type TaskCategory =
  | "physical_activity"
  | "meals_nutrition"
  | "brain_wellness"
  | "social_connection"
  | "health_check"
  | "sleep_hygiene"
  | "safety_routine"
  | "daily_structure";

type CognitiveDomain =
  | "executive_function"
  | "memory"
  | "processing_speed"
  | "language"
  | "orientation"
  | "attention"
  | "visuospatial";
```

### Populate this library with interventions from ONLY these sources:

#### 1. FINGER Trial (Ngandu et al., 2015, The Lancet)
The FINGER study proved that a multidomain intervention (diet + exercise + cognitive training + vascular monitoring) improves cognition in at-risk elderly. Extract these specific interventions:

**Physical Activity (FINGER protocol):**
- Supervised progressive strength training (1-3x/week, 10-15 reps, targeting large muscle groups)
- Aerobic exercise (2-5x/week, moderate intensity like brisk walking, cycling, aqua gym)
- Postural balance exercises (integrated into sessions)
- Home exercise program with simple stretches and walks

**Nutrition (FINGER protocol — Nordic dietary guidelines):**
- Increase fruit and vegetable consumption (target: 400g+/day)
- Choose whole grains over refined
- Limit saturated fat (use rapeseed/olive oil instead of butter)
- Eat fish 2-3x/week (omega-3 rich)
- Limit sugar intake and sugary drinks
- Moderate salt usage

**Cognitive Training (FINGER protocol):**
- Computer-based training targeting executive function, processing speed, memory, and mental flexibility
- Group-based sessions with instructor guidance
- Individual sessions 3x/week for ~15 min each
- Progressive difficulty adjustment

**Vascular/Health Monitoring (FINGER protocol):**
- Regular blood pressure monitoring
- Weight tracking
- Blood glucose awareness
- Medication adherence reminders

#### 2. U.S. POINTER Study (Alzheimer's Association, 2025 CTAD results)
Adapted FINGER for American population. Key specific interventions:

**Exercise (U.S. POINTER STR arm):**
- 30-35 min moderate-to-intense aerobic activity, 4x/week
- Strength + flexibility training 2x/week
- Activities: brisk walking, swimming, light jogging, chair exercises

**Nutrition (MIND Diet — Morris et al.):**
- Daily: leafy greens, one other vegetable, whole grains, olive oil
- 3+x/week: beans, fish, poultry
- 2+x/week: berries (especially blueberries)
- Daily: small handful of nuts
- Limit: red meat, butter/margarine, cheese, pastries/sweets, fried food
- "Add color to the plate" principle

**Cognitive Stimulation (U.S. POINTER):**
- BrainHQ-style computer training 3x/week, 30 min
- Social engagement activities alongside cognitive tasks

**Health Monitoring (U.S. POINTER — "Know Your Numbers"):**
- Blood pressure check
- Weight monitoring
- Blood glucose tracking

#### 3. Cognitive Stimulation Therapy — CST (Spector et al., "Making a Difference" manual)
NICE-recommended group intervention. Extract these specific themed activities for adaptation to individual/home use:

**CST Session Themes (adapt for home-based individual delivery):**
- Physical games (ball tossing, simple movement games, skittles)
- Sounds (identifying and discussing everyday sounds, music recognition)
- Childhood memories / My life (structured reminiscence with photos)
- Food (discussing recipes, food preparation, tasting activities)
- Current affairs (reading and discussing news together)
- Faces/scenes (recognizing and discussing famous faces, places)
- Word games (word association, categories, rhyming)
- Being creative (art, crafts, simple cooking tasks)
- Categorising objects (sorting household items by category)
- Number games (simple calculations, money-related tasks)
- Team games/quiz (trivia, general knowledge)
- Using money (counting change, discussing prices)
- Orientation (day, date, weather, season discussions)
- Household treasures (discussing meaningful objects)

**CST Key Principles to encode in task descriptions:**
- Opinions over facts (never test, always invite sharing)
- Implicit learning (activities should feel fun, not like "brain training")
- Multisensory cues (combine visual, auditory, tactile elements)
- Reminiscence as a tool for orientation (compare old vs. new)
- Stimulate language through conversation, not quiz formats
- Respect and inclusion — never put someone "on the spot"

#### 4. 2024 Lancet Commission on Dementia Prevention (Livingston et al.)
14 modifiable risk factors — generate tasks addressing these:

- **Physical inactivity** → daily movement prompts, walk reminders
- **Social isolation** → call/video chat a friend, attend community activity
- **Depression** → mood check-ins, pleasant activity scheduling, gratitude exercises
- **Hearing loss** → hearing aid check/maintenance reminders
- **Vision loss** → vision aid maintenance, good lighting reminders
- **Sleep** → consistent bedtime routine, limit caffeine after noon, reduce screen time before bed
- **Smoking cessation** → support reminders (if applicable)
- **Alcohol moderation** → hydration reminders, alcohol-free drink alternatives
- **Hypertension** → BP monitoring, salt reduction meals
- **Diabetes management** → blood glucose checks, balanced meal timing
- **Obesity** → portion awareness, daily step goals

#### 5. WHO Risk Reduction Guidelines for Cognitive Decline and Dementia (2019)
Key recommendations to encode:

- Physical activity: 150 min/week moderate aerobic, or 75 min vigorous
- Mediterranean-style diet is recommended
- Tobacco cessation interventions
- Hazardous alcohol use interventions
- Cognitive training can be offered (evidence is low but no harm)
- Social activity should be supported throughout life
- Weight management in midlife
- Hypertension management
- Diabetes management
- Dyslipidemia management with statins where indicated
- Depression management with antidepressants and/or psychological interventions
- Hearing loss management with hearing aids

#### 6. NICE Guidelines (NG97 — Dementia: assessment, management and support)
For care and daily living tasks:

- Structured daily routines with consistent timing
- Meaningful activity tailored to preferences and abilities
- Environmental safety checks (fall prevention, navigation aids)
- Medication management reminders
- Regular hydration prompts (target ~6-8 glasses/day)

#### 7. CITA GO-ON / EU-FINGERS / FINGER-NL — Additional Interventions
- Stress management techniques (brief relaxation, breathing exercises)
- Sleep counseling components (sleep hygiene education)
- Social group activities for stimulation
- Nutritional supplement awareness (where clinically appropriate)

---

## Step 2: Refactor the AI Prompt (DeepSeek V3)

Update the system prompt used when calling the DeepSeek V3 API for task suggestions. The new prompt must enforce evidence-based generation. Here is the prompt structure to implement:

```
SYSTEM PROMPT:
You are an evidence-based dementia care task generator for the OurTurn care platform.

CRITICAL RULES:
1. You must ONLY suggest tasks that are derived from the provided intervention library.
   Never invent new interventions. Your role is to SELECT and PERSONALIZE from the library.

2. Every task you generate must map to a specific intervention ID from the library.
   Include the intervention_id in your response.

3. Personalization means:
   - Adapting the LANGUAGE to be warm, simple, and encouraging (reading level ~6th grade)
   - Selecting the appropriate ADAPTATION variant based on the patient profile
   - Adjusting TIMING to fit the patient's daily routine and preferences
   - Choosing DIFFICULTY appropriate to the patient's current cognitive level
   - Incorporating the patient's PERSONAL INTERESTS (e.g., if they love gardening,
     frame the physical activity as "a gentle walk to check on your garden")

4. Task descriptions must:
   - Use direct, warm, conversational language ("Let's..." / "Time to..." / "How about...")
   - Include SPECIFIC, CONCRETE instructions (not vague advice)
   - Be 2-4 sentences maximum
   - Never use medical jargon
   - Never mention "dementia", "cognitive decline", or "brain training" explicitly
   - Frame everything as enjoyable activities, not medical interventions
   - Follow CST principle: opinions over facts, never test or quiz

5. Safety constraints:
   - Never suggest exercises requiring balance without noting "seated alternative available"
   - Never suggest cooking tasks involving sharp knives or open flames without caregiver present
   - Never suggest leaving the house alone if the patient profile indicates wandering risk
   - Always check contraindications from the intervention record
   - If patient has dietary restrictions, filter nutrition tasks accordingly

6. Daily plan structure (generate 6-8 tasks per day):
   - Morning: 1 physical activity + 1 nutrition task
   - Midday: 1 brain wellness / CST-derived activity
   - Afternoon: 1 social connection task + 1 optional creative/stimulation task
   - Evening: 1 health check + 1 sleep hygiene task
   - Spread tasks with minimum 1.5-hour gaps

7. Variety rules:
   - Never repeat the same intervention_id within a 3-day window
   - Rotate across all categories evenly over a week
   - Ensure each cognitive domain is targeted at least once per week
   - Alternate between individual and social tasks

RESPONSE FORMAT:
Return a JSON array of task objects:
{
  "tasks": [
    {
      "intervention_id": "finger_aerobic_walk_01",
      "category": "physical_activity",
      "title": "Morning Garden Stroll",
      "description": "Good morning! The fresh air is calling. Let's take a gentle 20-minute walk around your neighborhood. Notice the flowers and trees along the way — can you spot anything new today? If you'd prefer, a walk around the house works wonderfully too.",
      "scheduled_time": "08:00",
      "duration_minutes": 20,
      "evidence_source": "FINGER Trial — Aerobic exercise protocol (Ngandu et al., 2015)",
      "cognitive_domains": ["attention", "orientation"],
      "requires_caregiver": false
    }
  ]
}
```

---

## Step 3: Add Evidence Citation Display (Optional but Recommended)

In the Care Plan UI, add a small info icon or expandable section on each task card that shows:
- The evidence source (e.g., "Based on FINGER Trial protocol")
- A one-line finding summary (e.g., "2-year RCT showed 25-150% cognitive improvement vs. control")

This builds trust with caregivers and differentiates OurTurn from generic wellness apps. Implement as:

```tsx
// In the task card component, add:
{task.evidence_source && (
  <details className="mt-2 text-xs text-muted-foreground">
    <summary className="cursor-pointer flex items-center gap-1">
      <BookOpen size={12} />
      Evidence-based
    </summary>
    <p className="mt-1 pl-4">{task.evidence_source}</p>
  </details>
)}
```

---

## Step 4: Validation Layer

Create a validation function that runs BEFORE any task is displayed to the user:

```typescript
function validateTaskSuggestion(task: GeneratedTask, interventionLibrary: EvidenceBasedIntervention[]): boolean {
  // 1. Must map to a real intervention ID
  const intervention = interventionLibrary.find(i => i.id === task.intervention_id);
  if (!intervention) {
    console.error(`Task rejected: unknown intervention_id ${task.intervention_id}`);
    return false;
  }

  // 2. Category must match
  if (task.category !== intervention.category) {
    console.error(`Task rejected: category mismatch`);
    return false;
  }

  // 3. Duration must be within reasonable range of source
  if (task.duration_minutes > intervention.durationMinutes * 1.5) {
    console.error(`Task rejected: duration exceeds evidence-based recommendation`);
    return false;
  }

  // 4. Check contraindications against patient profile
  if (intervention.contraindications) {
    // Check against patient conditions...
  }

  return true;
}
```

---

## Step 5: Seed the Intervention Library

Populate the library with **at minimum** these interventions (60+ entries covering all categories):

### Physical Activity (12+ interventions)
- `finger_aerobic_walk` — Brisk walking, 20-30 min (FINGER)
- `finger_strength_upper` — Upper body strength with resistance bands (FINGER)
- `finger_strength_lower` — Chair squats, leg raises (FINGER)
- `finger_balance` — Standing balance exercises, heel-to-toe walk (FINGER)
- `pointer_aerobic_moderate` — Moderate aerobic activity, 30-35 min (U.S. POINTER)
- `pointer_flexibility` — Stretching and flexibility routine (U.S. POINTER)
- `who_150min_walk` — Daily step goal toward 150 min/week (WHO)
- `cst_physical_games` — Ball tossing, gentle movement games (CST)
- `lancet_reduce_sedentary` — Stand-up and move every 60 min (Lancet 2024)
- `nice_fall_prevention` — Home safety walk-through + balance check (NICE)
- `finger_aqua_gym` — Water-based gentle exercises (FINGER)
- `cst_gardening` — Light gardening activity (CST creative adaptation)

### Meals & Nutrition (10+ interventions)
- `mind_leafy_greens` — Include leafy greens in a meal (MIND Diet / U.S. POINTER)
- `mind_berries` — Berry-rich snack or smoothie (MIND Diet)
- `mind_nuts_daily` — Small handful of nuts as snack (MIND Diet)
- `mind_fish_meal` — Fish-based meal preparation (MIND Diet / FINGER)
- `mind_olive_oil` — Cook with olive oil instead of butter (MIND Diet)
- `finger_fruit_veg` — 400g+ fruits and vegetables target (FINGER Nordic guidelines)
- `finger_whole_grains` — Whole grain breakfast or lunch (FINGER)
- `who_hydration` — 6-8 glasses water daily with reminders (WHO / NICE)
- `lancet_limit_alcohol` — Alcohol-free drink alternative (Lancet 2024)
- `mind_colorful_plate` — "Add color to your plate" meal (U.S. POINTER)

### Brain Wellness (15+ interventions)
- `cst_current_affairs` — Read and discuss a news headline together (CST)
- `cst_sounds` — Identify and discuss everyday sounds / music (CST)
- `cst_word_games` — Word association, categories, rhyming (CST)
- `cst_categorising` — Sort household objects by category (CST)
- `cst_faces_scenes` — Discuss photos of famous people or places (CST)
- `cst_number_games` — Simple counting, money, or number tasks (CST)
- `cst_being_creative` — Simple art, craft, or cooking task (CST)
- `cst_orientation` — Discuss today's day, date, weather, season (CST)
- `cst_household_treasures` — Talk about meaningful personal objects (CST)
- `cst_using_money` — Practice with coins, discuss prices (CST)
- `finger_cognitive_computer` — Structured cognitive training app session (FINGER)
- `pointer_brainhq` — BrainHQ-style cognitive training, 15-30 min (U.S. POINTER)
- `cst_reminiscence_photos` — Photo album review with storytelling (CST)
- `lancet_cognitive_activity` — Puzzle, crossword, or sudoku (Lancet 2024)
- `cst_food_discussion` — Discuss favorite recipes, cooking memories (CST)

### Social Connection (8+ interventions)
- `lancet_social_call` — Call or video chat a friend/family member (Lancet 2024)
- `lancet_reduce_isolation` — Attend a community event or group (Lancet 2024)
- `cst_group_quiz` — Family trivia or general knowledge game (CST)
- `who_social_activity` — Engage in any social activity for 30+ min (WHO)
- `finger_group_exercise` — Exercise with a companion (FINGER social component)
- `cst_team_games` — Collaborative game with family (CST)
- `lancet_meaningful_activity` — Volunteer, help with household task, contribute (Lancet 2024)
- `nice_carer_connection` — Check-in conversation with caregiver about the day (NICE)

### Health Check (8+ interventions)
- `finger_bp_check` — Blood pressure monitoring (FINGER / U.S. POINTER)
- `pointer_weight_track` — Weekly weight tracking (U.S. POINTER)
- `pointer_glucose_check` — Blood glucose monitoring if diabetic (U.S. POINTER)
- `lancet_hearing_aid_check` — Check and clean hearing aids (Lancet 2024)
- `lancet_vision_check` — Ensure glasses are clean, lighting adequate (Lancet 2024)
- `nice_medication_reminder` — Medication adherence check (NICE)
- `nice_hydration_check` — Track daily water intake (NICE)
- `who_tobacco_check` — Smoking cessation support reminder (WHO)

### Sleep Hygiene (5+ interventions)
- `lancet_consistent_bedtime` — Go to bed at the same time each night (Lancet 2024)
- `lancet_limit_caffeine` — No caffeine after 12pm (Lancet 2024)
- `fingernl_screen_limit` — Reduce screen time 1 hour before bed (FINGER-NL sleep component)
- `fingernl_relaxation` — Brief breathing or relaxation exercise before bed (FINGER-NL)
- `who_sleep_environment` — Cool, dark, quiet bedroom check (WHO)

### Safety & Daily Structure (5+ interventions)
- `nice_daily_routine` — Review today's schedule on the board/calendar (NICE)
- `nice_fall_prevention_home` — Quick home safety scan (remove tripping hazards) (NICE)
- `nice_emergency_info` — Verify emergency contacts are accessible (NICE)
- `nice_navigation_prep` — Review familiar routes if going out today (NICE)
- `lancet_meaningful_structure` — Set one small goal for the day (Lancet 2024)

---

## Implementation Notes

1. **The AI never generates from thin air.** It selects from the intervention library and personalizes the language, timing, and framing. Think of it as a DJ mixing from a curated playlist — not composing new songs.

2. **The intervention library is the regulatory artifact.** If OurTurn ever pursues DiGA or other clinical certification, this library with its citations is the evidence trail. Keep it maintained and versioned.

3. **Personalization happens at the description layer**, not the intervention layer. The underlying intervention is always evidence-based; the wording adapts to the patient's name, interests, routine, and cognitive level.

4. **Tag each task in the database** with its `intervention_id` so that over time you can analyze which evidence-based interventions have the best adherence, which the patient prefers, and which categories need more variety.

5. **CST principle reminder for all task descriptions:** Frame everything as invitations, not instructions. "How about..." not "You must...". Opinions over facts. Never quiz or test. Make it feel like a pleasant activity, not a medical prescription.

---

## Files to Create/Modify

1. `src/data/evidence-based-interventions.ts` — The intervention library (NEW)
2. `src/services/ai-task-generator.ts` (or wherever the DeepSeek prompt lives) — Update the system prompt
3. `src/utils/task-validator.ts` — Validation layer (NEW)
4. Task card component — Add evidence citation display
5. `src/types/care-plan.ts` — Update task types to include `intervention_id` and `evidence_source`

## Testing

- Generate 7 days of suggestions and verify every single task maps to a real intervention ID
- Verify no task description contains: "dementia", "cognitive decline", "brain training", "Alzheimer's"
- Verify variety: no intervention ID repeats within 3 days
- Verify safety: tasks for users with mobility issues exclude standing balance exercises
- Verify all 7 categories appear at least once per day
