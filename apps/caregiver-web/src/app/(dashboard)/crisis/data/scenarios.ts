import type { CrisisScenario } from '../types';

export const CRISIS_SCENARIOS: CrisisScenario[] = [
  // ── 6 from the spec ─────────────────────────────────────────
  {
    id: 'agitated',
    behaviourType: 'agitation',
    emoji: '😤',
    label: 'Agitated / Upset',
    urgency: 'high',
    stepCountDescription: '5 steps \u00b7 Take it slow',
    steps: [
      {
        type: 'breathe',
        title: 'You first',
        instruction:
          "Take one slow breath before you do anything. You can't calm someone if you're not calm.",
        action: 'breathing',
      },
      {
        type: 'assess',
        title: 'Quick check \u2014 could something physical be wrong?',
        instruction:
          'Pain, hunger, needing the bathroom, or an infection can all cause agitation. These need to be ruled out first.',
        checklist: [
          'Pain or discomfort?',
          'Hungry or thirsty?',
          'Needs the bathroom?',
          'Recent medication change?',
          'Fever or illness signs?',
        ],
      },
      {
        type: 'do',
        title: 'Lower the temperature',
        instruction:
          "Speak slowly and softly. Don't argue, correct, or explain. Match their emotional tone \u2014 validate what they're feeling, not the facts.",
        tips: [
          '"I can see you\'re upset. I\'m here."',
          'Reduce noise \u2014 turn off TV, close windows',
          "Give them physical space, don't crowd",
          'Offer a familiar comfort object',
        ],
      },
      {
        type: 'do',
        title: "Redirect, don't reason",
        instruction:
          "If validation doesn't work, gently change the subject or environment. Don't try to logic them out of it.",
        tips: [
          'Suggest a walk or move to another room',
          'Put on music they love',
          'Offer a snack or warm drink',
          'Look at photos together',
        ],
      },
      {
        type: 'escalate',
        title: 'When to get help',
        instruction:
          "If agitation lasts more than 30 minutes, if they're at risk of hurting themselves or you, or if this is a sudden new behavior \u2014 call their doctor or emergency services.",
        action: 'call_emergency',
        actionLabel: 'Call Emergency Services',
      },
    ],
  },

  {
    id: 'wandering',
    behaviourType: 'wandering',
    emoji: '🚶',
    label: 'Wandering / Missing',
    urgency: 'critical',
    stepCountDescription: '4 steps \u00b7 Act fast',
    steps: [
      {
        type: 'do',
        title: 'Check the usual places first',
        instruction:
          "Most people with dementia go to familiar places \u2014 a former workplace, a childhood home, a neighbor's house, a favorite shop.",
        tips: [
          'Check the garden, garage, nearby streets',
          "Ask neighbors if they've seen them",
          'Check places they used to go regularly',
        ],
      },
      {
        type: 'do',
        title: 'Use their location',
        instruction:
          'If location tracking is set up, check their current position now.',
        actionLabel: 'Open Location',
      },
      {
        type: 'do',
        title: 'Alert the family',
        instruction:
          'Let everyone know immediately. More eyes searching is better.',
        actionLabel: 'Alert All Family Members',
      },
      {
        type: 'escalate',
        title: 'Call police if not found within 15 minutes',
        instruction:
          "Don't wait. People with dementia are at high risk of injury. Call emergency services and tell them the person has dementia. Have a recent photo ready.",
        action: 'call_emergency',
        actionLabel: 'Call Emergency Services',
      },
    ],
  },

  {
    id: 'refusing',
    behaviourType: 'refusing_care',
    emoji: '🚫',
    label: 'Refusing Care',
    urgency: 'moderate',
    stepCountDescription: '4 steps \u00b7 Take it slow',
    steps: [
      {
        type: 'breathe',
        title: "Pause \u2014 this isn't defiance",
        instruction:
          "Refusal is almost always fear, confusion, or discomfort. They may not understand what you're asking, or the task may feel threatening.",
        action: 'breathing',
      },
      {
        type: 'do',
        title: 'Step back and try differently',
        instruction:
          "Don't push. Come back in 15\u201320 minutes and approach as if it's the first time.",
        tips: [
          'Change who\'s asking \u2014 a different person may get a different response',
          'Change the environment \u2014 bathroom too cold? Lighting too harsh?',
          'Break the task into smaller steps',
          'Offer choices: "Bath or shower?" not "Time for your bath"',
        ],
      },
      {
        type: 'do',
        title: 'Make it feel safe',
        instruction:
          'Explain each step before you do it. Move slowly. Keep them warm and covered.',
        tips: [
          'Warn before touching: "I\'m going to help with your sleeve"',
          'Use a calm, warm tone \u2014 not a parenting tone',
          'Play their favorite music during the task',
          'Keep the routine consistent \u2014 same time, same order',
        ],
      },
      {
        type: 'assess',
        title: 'Is this a pattern?',
        instruction:
          'If they consistently refuse the same task, log it. There may be an underlying issue \u2014 pain during movement, fear of water, sensitivity to touch. Discuss with their doctor.',
      },
    ],
  },

  {
    id: 'hallucinations',
    behaviourType: 'hallucinations',
    emoji: '👁️',
    label: 'Seeing / Hearing Things',
    urgency: 'moderate',
    stepCountDescription: '4 steps \u00b7 Take it slow',
    steps: [
      {
        type: 'do',
        title: "Don't argue \u2014 it's real to them",
        instruction:
          "Telling someone their hallucination isn't real causes more distress. Acknowledge what they're experiencing without confirming it's true.",
        tips: [
          '"That sounds frightening. I\'m here with you."',
          '"Tell me what you\'re seeing."',
          'Don\'t say "there\'s nothing there"',
        ],
      },
      {
        type: 'assess',
        title: 'Check the environment',
        instruction:
          'Shadows, reflections, TV sounds, and clutter can trigger visual or auditory misinterpretation in dementia.',
        checklist: [
          'Shadows from windows or lamps?',
          'TV or radio on in background?',
          'Mirror reflections?',
          'Clutter that could look like figures?',
          'Poor lighting?',
        ],
      },
      {
        type: 'do',
        title: 'Redirect gently',
        instruction:
          "Once you've acknowledged their experience, try to shift their attention to something concrete and comforting.",
        tips: [
          'Move to a well-lit room',
          'Offer a hands-on activity',
          'Go for a short walk together',
          'Make a cup of tea together',
        ],
      },
      {
        type: 'escalate',
        title: 'When to call the doctor',
        instruction:
          'If hallucinations are new, frequent, or causing extreme distress. Sudden onset can indicate infection (especially UTI), medication side effects, or delirium \u2014 all of which need medical attention.',
        action: 'call_emergency',
        actionLabel: 'Call Emergency Services',
      },
    ],
  },

  {
    id: 'sundowning',
    behaviourType: 'sundowning',
    emoji: '🌅',
    label: 'Sundowning / Evening Anxiety',
    urgency: 'moderate',
    stepCountDescription: '4 steps \u00b7 Take it slow',
    steps: [
      {
        type: 'do',
        title: 'Recognize the pattern',
        instruction:
          'Sundowning typically starts late afternoon. Anxiety builds as daylight fades. This is extremely common and not something they can control.',
      },
      {
        type: 'do',
        title: 'Adjust the environment now',
        instruction:
          'Your goal is to reduce all stimulation and create safety signals.',
        tips: [
          'Turn on warm lights before it gets dark',
          'Close curtains to reduce shadows',
          'Turn off or lower the TV volume',
          'Reduce the number of people in the room',
        ],
      },
      {
        type: 'do',
        title: 'Offer calming activities',
        instruction:
          'Gentle, repetitive, familiar activities work best during sundowning.',
        tips: [
          'Gentle hand massage with lotion',
          'Soft, familiar music',
          'Folding towels or sorting objects',
          'Looking through a photo album together',
        ],
      },
      {
        type: 'assess',
        title: 'Prevent it tomorrow',
        instruction:
          'Log the episode with timing details. Over time, patterns emerge that help you prevent or reduce sundowning through schedule adjustments \u2014 more morning activity, less afternoon caffeine, consistent evening routine.',
      },
    ],
  },

  {
    id: 'fall',
    behaviourType: 'fall',
    emoji: '🆘',
    label: 'Fall / Physical Emergency',
    urgency: 'critical',
    stepCountDescription: '4 steps \u00b7 Act fast',
    steps: [
      {
        type: 'do',
        title: "Don't move them",
        instruction:
          "Unless they're in immediate danger (fire, water), don't try to lift or move them. You could worsen an injury.",
        tips: [
          'Get down to their level \u2014 kneel beside them',
          'Reassure them: "I\'m here, you\'re safe"',
          'Check for visible injury \u2014 bleeding, swelling, odd limb position',
        ],
      },
      {
        type: 'assess',
        title: 'Can they get up?',
        instruction:
          "If there's no obvious injury and they want to try getting up, help them do it slowly in stages \u2014 roll to side, get to hands and knees, use a sturdy chair.",
        checklist: [
          'Are they alert and responsive?',
          'Any obvious injury or pain?',
          'Can they move all limbs?',
          'Did they hit their head?',
        ],
      },
      {
        type: 'escalate',
        title: 'Call for help if...',
        instruction:
          "Head injury, can't get up, severe pain, confusion worse than usual, or bleeding that won't stop. Don't hesitate \u2014 falls in older adults are medical emergencies.",
        action: 'call_emergency',
        actionLabel: 'Call Emergency Services',
      },
      {
        type: 'do',
        title: 'After the fall',
        instruction:
          'Even if they seem fine, log this event and mention it to their doctor. Repeated falls can indicate medication issues, vision problems, or progression of the disease.',
      },
    ],
  },

  // ── 4 from existing DB ──────────────────────────────────────
  {
    id: 'repetitive_questions',
    behaviourType: 'repetitive_questions',
    emoji: '🔄',
    label: 'Repetitive Questions',
    urgency: 'moderate',
    stepCountDescription: '4 steps \u00b7 Take it slow',
    steps: [
      {
        type: 'breathe',
        title: 'Breathe \u2014 this is the disease, not them',
        instruction:
          "Repetitive questioning is one of the most common \u2014 and most exhausting \u2014 dementia behaviors. They genuinely don't remember asking. Your frustration is valid, but showing it makes them more anxious.",
        action: 'breathing',
      },
      {
        type: 'assess',
        title: 'What are they really asking?',
        instruction:
          'The question on the surface is rarely the real question. "What time is dinner?" might mean "I\'m hungry." "When are we going?" might mean "I feel anxious." Try to identify the underlying need.',
        checklist: [
          'Are they anxious about something?',
          'Could they be hungry, thirsty, or bored?',
          'Is there an upcoming event causing worry?',
          'Did something in the environment change?',
        ],
      },
      {
        type: 'do',
        title: 'Respond to the feeling, not the question',
        instruction:
          'Answer the emotion behind the question rather than the literal words. Then redirect to an engaging activity.',
        tips: [
          'Write the answer on a visible whiteboard or note card',
          'Provide a simple, reassuring answer each time \u2014 same words',
          'Redirect to a hands-on activity after answering',
          'Use visual schedules to reduce uncertainty',
        ],
      },
      {
        type: 'do',
        title: 'Protect your own wellbeing',
        instruction:
          'Repetitive questioning can be deeply draining. Tag out with another caregiver if possible. Use noise-canceling headphones with gentle music when you need a mental break. This is not selfish \u2014 it is necessary.',
      },
    ],
  },

  {
    id: 'sleep_disruption',
    behaviourType: 'sleep_disruption',
    emoji: '😴',
    label: 'Sleep Disruption',
    urgency: 'moderate',
    stepCountDescription: '4 steps \u00b7 Take it slow',
    steps: [
      {
        type: 'do',
        title: 'Keep the environment safe',
        instruction:
          "If they're awake and moving around at night, your first priority is safety \u2014 not getting them back to bed.",
        tips: [
          'Turn on low nightlights so they can see',
          'Clear the path of trip hazards',
          'Lock exterior doors if wandering is a concern',
          "Speak softly: \"It's nighttime, everything is safe\"",
        ],
      },
      {
        type: 'assess',
        title: 'What woke them?',
        instruction:
          'Night waking in dementia can be caused by pain, needing the bathroom, medication timing, hunger, or confusion about time of day.',
        checklist: [
          'Do they need the bathroom?',
          'Are they in pain or uncomfortable?',
          'Did a noise or light wake them?',
          'Are they hungry or thirsty?',
          'Could medication timing be a factor?',
        ],
      },
      {
        type: 'do',
        title: 'Guide them back gently',
        instruction:
          "Don't argue about what time it is. Gently redirect them back to bed with calming cues.",
        tips: [
          'Offer a warm, caffeine-free drink',
          'Use a calm, quiet voice',
          'Put on soft, familiar music',
          'Sit with them until they settle',
        ],
      },
      {
        type: 'do',
        title: 'Improve tomorrow night',
        instruction:
          'Good sleep starts during the day. Log this episode with timing details to build a picture over time.',
        tips: [
          'More physical activity and daylight exposure during the day',
          'No caffeine after noon',
          'Consistent bedtime routine \u2014 same steps, same order',
          'Limit daytime naps to 30 minutes maximum',
        ],
      },
    ],
  },

  {
    id: 'aggression',
    behaviourType: 'aggression',
    emoji: '⚠️',
    label: 'Aggression',
    urgency: 'high',
    stepCountDescription: '5 steps \u00b7 Your safety first',
    steps: [
      {
        type: 'do',
        title: 'Your safety comes first',
        instruction:
          "If you feel physically unsafe, step back immediately. Move out of arm's reach. Do not try to restrain them unless someone is in immediate danger.",
        tips: [
          "Position yourself near an exit \u2014 don't let yourself get cornered",
          'Remove dangerous objects from reach',
          'Keep your voice low and calm \u2014 do not shout',
          'Do not make sudden movements',
        ],
      },
      {
        type: 'breathe',
        title: 'Ground yourself',
        instruction:
          "Aggression triggers a fight-or-flight response in you too. Take one moment to breathe. You need to think clearly, and that's hard when your adrenaline is surging.",
        action: 'breathing',
      },
      {
        type: 'assess',
        title: 'What triggered this?',
        instruction:
          'Aggression in dementia is almost always a reaction to something \u2014 pain, fear, frustration, feeling trapped, or sensory overload. The behavior is communication.',
        checklist: [
          'Were they being asked to do something?',
          'Were they in pain or physically uncomfortable?',
          'Was the environment noisy or chaotic?',
          'Did they feel cornered or restrained?',
          'Did a stranger or unfamiliar person approach?',
        ],
      },
      {
        type: 'do',
        title: 'Give space and time',
        instruction:
          'Back off. Give them room. Stop whatever activity triggered the aggression. Come back in 15\u201320 minutes as if nothing happened \u2014 they likely won\'t remember.',
        tips: [
          'Leave the room if safe to do so',
          'Remove the trigger if you can identify it',
          "Don't take it personally \u2014 this is the disease",
          'When returning, approach slowly with a warm, calm tone',
        ],
      },
      {
        type: 'escalate',
        title: 'When this is an emergency',
        instruction:
          "If they have a weapon, if someone is injured, if the aggression doesn't subside, or if this is a new and severe change in behavior \u2014 call emergency services. Tell them the person has dementia.",
        action: 'call_emergency',
        actionLabel: 'Call Emergency Services',
      },
    ],
  },

  {
    id: 'shadowing',
    behaviourType: 'shadowing',
    emoji: '👤',
    label: 'Shadowing',
    urgency: 'moderate',
    stepCountDescription: '4 steps \u00b7 Take it slow',
    steps: [
      {
        type: 'breathe',
        title: 'Acknowledge your own frustration',
        instruction:
          "Being followed everywhere is exhausting and claustrophobic. Those feelings are completely valid. Take a breath \u2014 you're not a bad person for needing space.",
        action: 'breathing',
      },
      {
        type: 'assess',
        title: 'Why are they following you?',
        instruction:
          'Shadowing is driven by anxiety and fear of abandonment. They may not remember that you\'ll come back, so being near you is their only source of safety.',
        checklist: [
          'Has there been a recent routine change?',
          'Are they in an unfamiliar environment?',
          'Have you been away recently?',
          'Are they feeling unwell or anxious?',
        ],
      },
      {
        type: 'do',
        title: 'Reduce their anxiety',
        instruction:
          'The goal is to help them feel secure without you being physically present every moment.',
        tips: [
          'Give them a "job" near where you are \u2014 folding laundry, sorting buttons',
          'Leave a personal item with them (your scarf, a photo) as a comfort anchor',
          'Use calm verbal reassurance: "I\'m just in the kitchen, I\'ll be right back"',
          'Try a familiar TV show or music as a companion when you step away',
        ],
      },
      {
        type: 'do',
        title: 'Build in breaks for yourself',
        instruction:
          "Shadowing can be relentless. You need moments of separation for your own mental health. Ask a family member or friend to sit with them while you take 20 minutes for yourself.",
        tips: [
          'Even 10 minutes alone helps \u2014 don\'t wait until you\'re depleted',
          'If they follow you to the bathroom, it\'s okay to gently close the door and talk through it',
          'Consider a support group \u2014 other caregivers understand this exact experience',
          'This behavior often reduces as they settle into a stable routine',
        ],
      },
    ],
  },
];

/** Map scenario IDs to the corresponding BehaviourType for DB logging */
export const SCENARIO_TO_BEHAVIOUR_TYPE: Record<string, string> = {
  agitated: 'agitation',
  wandering: 'wandering',
  refusing: 'refusing_care',
  hallucinations: 'hallucinations',
  sundowning: 'sundowning',
  fall: 'fall',
  repetitive_questions: 'repetitive_questions',
  sleep_disruption: 'sleep_disruption',
  aggression: 'aggression',
  shadowing: 'shadowing',
};
