/**
 * Intervista Shared Typed Contract (Client Bundle)
 * Task 3: AI Interview Engine & Performance Analytics
 */

export const INTERVIEW_STATES = Object.freeze({
  INTERVIEWER_SPEAKING: 'INTERVIEWER_SPEAKING', // Avatar speech active / lipsync playing
  CANDIDATE_LISTENING: 'CANDIDATE_LISTENING',   // Intermission or listening window
  CANDIDATE_SPEAKING: 'CANDIDATE_SPEAKING',     // Mic active, speech recognition streaming
  AI_PROCESSING: 'AI_PROCESSING',               // LLM / heuristic response or evaluation generation
  RECONNECTING: 'RECONNECTING',                 // Network jitter / socket reconnect
  COMPLETED: 'COMPLETED',                       // Session finalized, evaluation persisted
  FAILED: 'FAILED',                             // Terminal failure or unrecoverable error
});

export const RUBRIC_CRITERIA = Object.freeze({
  correctness: {
    id: 'correctness',
    label: 'Correctness & Relevance',
    weight: 0.25,
    description: 'Factual accuracy, addressal of the core question, and domain validity.',
  },
  technicalKnowledge: {
    id: 'technicalKnowledge',
    label: 'Technical Knowledge',
    weight: 0.25,
    description: 'Depth of engineering concepts, architecture, and system trade-offs.',
  },
  completeness: {
    id: 'completeness',
    label: 'Completeness',
    weight: 0.15,
    description: 'Coverage of edge cases, scalability, lifecycle, and failure modes.',
  },
  answerStructure: {
    id: 'answerStructure',
    label: 'Answer Structure',
    weight: 0.15,
    description: 'Logical organization (e.g., STAR framework, top-down architecture).',
  },
  useOfExamples: {
    id: 'useOfExamples',
    label: 'Use of Examples',
    weight: 0.10,
    description: 'Concrete past projects, metrics, numbers, and practical trade-offs.',
  },
  clarityConciseness: {
    id: 'clarityConciseness',
    label: 'Clarity & Conciseness',
    weight: 0.10,
    description: 'Pacing, brevity, precision of vocabulary, avoiding wandering filler.',
  },
});

export const GAP_PRIORITY = Object.freeze({
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
});
