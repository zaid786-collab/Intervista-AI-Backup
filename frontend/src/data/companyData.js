/**
 * Intervista AI — Structured Company Interview Preparation Data
 * 
 * Source: intervista_ai_company_interview_guide.md (22 October 2026)
 * 
 * ACCURACY NOTE: No public source can reliably tell us every question a company
 * will ask. The questions below are high-priority practice prompts synthesized
 * from public interview guides, candidate reports, standard CS curricula, and
 * recurring coding patterns — not guaranteed or leaked questions.
 */

// ─── Helper to generate stable IDs ───────────────────────────────────────────
let _counter = 0;
const uid = (prefix) => `${prefix}-${++_counter}`;

// ─── Source Labels ───────────────────────────────────────────────────────────
export const SOURCE_LABELS = {
  official: 'Official — employer career/interview guide',
  candidate: 'Candidate report — anecdotal, not representative',
  community: 'Community list — LeetCode tags, GitHub repos, practice lists',
  editorial: 'Editorial synthesis — derived from multiple public sources',
};

// ─── Universal Preparation Checklist ─────────────────────────────────────────
export const UNIVERSAL_DSA_TOPICS = [
  'Arrays & Strings', 'Hash Maps & Sets', 'Linked Lists',
  'Stacks & Queues', 'Binary Search', 'Trees & BSTs',
  'Heaps', 'Graphs', 'Backtracking', 'Dynamic Programming',
  'Intervals', 'Complexity Analysis',
];

export const UNIVERSAL_CS_TOPICS = [
  'OOP', 'DBMS / SQL', 'Operating Systems',
  'Computer Networks', 'Programming Language Fundamentals',
  'Software Engineering',
];

export const BEHAVIORAL_QUESTIONS = [
  'Tell me about yourself.',
  'Walk me through a project you built. Why this architecture and stack?',
  'What was the hardest bug you fixed?',
  'Describe a disagreement or conflict and how you resolved it.',
  'Tell me about a failure, a missed deadline, or critical feedback.',
  'What trade-off did you make and what would you change now?',
  'Why this company and this role?',
  'What did you personally build versus what the team built?',
  'How did you test, secure, monitor, and deploy your project?',
];

// ─── Shared DSA Practice Set ─────────────────────────────────────────────────
export const SHARED_DSA_SET = [
  { id: uid('shared'), title: 'Two Sum', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
  { id: uid('shared'), title: 'Longest Substring Without Repeating Characters', topic: 'Sliding Window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { id: uid('shared'), title: 'Valid Parentheses', topic: 'Stack', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-parentheses/' },
  { id: uid('shared'), title: 'Binary Search', topic: 'Binary Search', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/' },
  { id: uid('shared'), title: 'Reverse Linked List', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
  { id: uid('shared'), title: 'Linked List Cycle', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
  { id: uid('shared'), title: 'Merge Intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' },
  { id: uid('shared'), title: 'Maximum Depth of Binary Tree', topic: 'Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { id: uid('shared'), title: 'Binary Tree Level Order Traversal', topic: 'Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
  { id: uid('shared'), title: 'Kth Largest Element in an Array', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  { id: uid('shared'), title: 'Number of Islands', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
  { id: uid('shared'), title: 'Course Schedule', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/' },
  { id: uid('shared'), title: 'Climbing Stairs', topic: 'Dynamic Programming', difficulty: 'Easy', url: 'https://leetcode.com/problems/climbing-stairs/' },
  { id: uid('shared'), title: 'Coin Change', topic: 'Dynamic Programming', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change/' },
  { id: uid('shared'), title: 'LRU Cache', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/' },
  { id: uid('shared'), title: 'Second Highest Salary', topic: 'SQL', difficulty: 'Medium', url: 'https://leetcode.com/problems/second-highest-salary/' },
];

// ─── Company Data ────────────────────────────────────────────────────────────

const COMPANIES = [
  // ══════════════════════════════════════════════════════════════════════════
  // 1. GOOGLE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'google',
    name: 'Google',
    shortName: 'G',
    description: 'Global technology leader in search, cloud, AI, and digital services.',
    brandColor: '#4285F4',
    preparationFocus: [
      'Algorithmic problem solving', 'Graph/tree traversal', 'Dynamic programming',
      'Binary search', 'Heaps', 'Clean implementation', 'Complexity analysis',
      'Communicating structured approach',
    ],
    interviewFocusNote: 'Google interviews may use original problems or variations; learn patterns rather than memorizing a fixed list. For experienced roles, add system design, distributed systems, and role-specific depth.',
    reportedQuestions: [
      { id: uid('gq'), title: 'Find the length of the longest substring without repeating characters', topic: 'Sliding Window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', sourceType: 'candidate' },
      { id: uid('gq'), title: 'Merge overlapping intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/', sourceType: 'candidate' },
      { id: uid('gq'), title: 'Find the K most frequent elements', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/', sourceType: 'candidate' },
      { id: uid('gq'), title: 'Find the lowest common ancestor of two nodes in a binary tree', topic: 'Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', sourceType: 'candidate' },
      { id: uid('gq'), title: 'Determine whether a graph is bipartite', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/is-graph-bipartite/', sourceType: 'candidate' },
      { id: uid('gq'), title: 'Find the shortest path in an unweighted graph or grid', topic: 'Graph', difficulty: 'Medium', sourceType: 'candidate' },
      { id: uid('gq'), title: 'Search for an element in a rotated sorted array', topic: 'Binary Search', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', sourceType: 'candidate' },
      { id: uid('gq'), title: 'Find the median of two sorted arrays', topic: 'Binary Search', difficulty: 'Hard', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', sourceType: 'candidate' },
      { id: uid('gq'), title: 'Word Ladder — shortest transformation sequence', topic: 'Graph', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-ladder/', sourceType: 'candidate' },
      { id: uid('gq'), title: 'Explain the time and space complexity of your solution; improve it if input size grows substantially', topic: 'Complexity Analysis', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('gp'), title: 'Two Sum', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { id: uid('gp'), title: 'Longest Substring Without Repeating Characters', topic: 'Sliding Window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: uid('gp'), title: 'Merge Intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' },
      { id: uid('gp'), title: 'Course Schedule', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/' },
      { id: uid('gp'), title: 'Word Ladder', topic: 'Graph', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-ladder/' },
      { id: uid('gp'), title: 'Kth Largest Element in an Array', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
    ],
    coreTopics: ['Arrays/Strings', 'Hash Maps', 'Trees', 'Graphs', 'BFS/DFS', 'Heaps', 'Binary Search', 'Dynamic Programming', 'Recursion', 'Complexity', 'Testing', 'Clear reasoning'],
    resources: [
      { title: 'Google-tagged questions on LeetCode', url: 'https://leetcode.com/company/google/', type: 'community' },
      { title: 'Google interview problems — OpenLeet tracker', url: 'https://openleet.org/', type: 'community' },
      { title: 'NeetCode 150', url: 'https://neetcode.io/practice', type: 'community' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'faang',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. MICROSOFT
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'microsoft',
    name: 'Microsoft',
    shortName: 'MS',
    description: 'Enterprise technology, cloud (Azure), productivity software, and AI leader.',
    brandColor: '#00A4EF',
    preparationFocus: [
      'Problem solving', 'Coding', 'Design', 'Testing',
      'Fundamentals', 'Explaining assumptions',
    ],
    interviewFocusNote: 'Microsoft emphasizes problem solving, coding, design, testing, fundamentals, and explaining assumptions. Behavioral answers should demonstrate collaboration, accountability, learning, and customer focus.',
    reportedQuestions: [
      { id: uid('mq'), title: 'Reverse a linked list; explain iterative and recursive approaches', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/', sourceType: 'candidate' },
      { id: uid('mq'), title: 'Detect a cycle in a linked list', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/', sourceType: 'candidate' },
      { id: uid('mq'), title: 'Find the first non-repeating character in a string', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/first-unique-character-in-a-string/', sourceType: 'candidate' },
      { id: uid('mq'), title: 'Implement a queue using stacks', topic: 'Stack', difficulty: 'Easy', url: 'https://leetcode.com/problems/implement-queue-using-stacks/', sourceType: 'candidate' },
      { id: uid('mq'), title: 'Find the maximum depth or diameter of a binary tree', topic: 'Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', sourceType: 'candidate' },
      { id: uid('mq'), title: 'Find the number of islands in a grid', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/', sourceType: 'candidate' },
      { id: uid('mq'), title: 'Find two numbers that add to a target', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/', sourceType: 'candidate' },
      { id: uid('mq'), title: 'Merge K sorted lists', topic: 'Heap', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/', sourceType: 'candidate' },
      { id: uid('mq'), title: 'Design a simple URL shortener or file storage service (experienced roles)', topic: 'System Design', sourceType: 'candidate' },
      { id: uid('mq'), title: 'Explain how you test boundary cases and make code robust', topic: 'Testing', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('mp'), title: 'Reverse Linked List', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: uid('mp'), title: 'Linked List Cycle', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: uid('mp'), title: 'First Unique Character in a String', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/first-unique-character-in-a-string/' },
      { id: uid('mp'), title: 'Implement Queue using Stacks', topic: 'Stack', difficulty: 'Easy', url: 'https://leetcode.com/problems/implement-queue-using-stacks/' },
      { id: uid('mp'), title: 'Maximum Depth of Binary Tree', topic: 'Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { id: uid('mp'), title: 'Number of Islands', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
      { id: uid('mp'), title: 'Merge k Sorted Lists', topic: 'Heap', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
    ],
    coreTopics: ['DSA Fundamentals', 'OOP', 'Debugging', 'Test Cases', 'SQL/DBMS', 'OS', 'Networking', 'API Design', 'System Design'],
    resources: [
      { title: 'Microsoft-tagged questions on LeetCode', url: 'https://leetcode.com/company/microsoft/', type: 'community' },
      { title: 'Microsoft official interview tips', url: 'https://careers.microsoft.com/v2/global/en/hiring-tips/interview-tips', type: 'official' },
      { title: 'Microsoft technical interviewing guidance', url: 'https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html', type: 'official' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'faang',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. AMAZON
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon',
    name: 'Amazon',
    shortName: 'A',
    description: 'Global e-commerce, cloud (AWS), and technology services company.',
    brandColor: '#FF9900',
    preparationFocus: [
      'DSA', 'Behavioral examples aligned to Leadership Principles',
      'Ownership', 'Customer impact', 'Learning from failure',
      'Delivering results', 'Decisions with incomplete information',
    ],
    interviewFocusNote: 'Prepare DSA plus behavioral examples aligned to Amazon\'s Leadership Principles. Experienced roles may include OO design, system design, scalability, reliability, and operational excellence.',
    reportedQuestions: [
      { id: uid('aq'), title: 'Two Sum / find a pair that adds to a target', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/', sourceType: 'candidate' },
      { id: uid('aq'), title: 'Find the longest substring without repeating characters', topic: 'Sliding Window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', sourceType: 'candidate' },
      { id: uid('aq'), title: 'Merge intervals or identify overlapping meetings', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/', sourceType: 'candidate' },
      { id: uid('aq'), title: 'Find the K most frequent elements', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/', sourceType: 'candidate' },
      { id: uid('aq'), title: 'Level-order traversal of a binary tree', topic: 'Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', sourceType: 'candidate' },
      { id: uid('aq'), title: 'Find the number of islands', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/', sourceType: 'candidate' },
      { id: uid('aq'), title: 'Find the top K frequent words', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-words/', sourceType: 'candidate' },
      { id: uid('aq'), title: 'Design an LRU cache', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/', sourceType: 'candidate' },
      { id: uid('aq'), title: 'Design a URL shortener, shopping cart, or notification service', topic: 'System Design', sourceType: 'candidate' },
      { id: uid('aq'), title: 'Describe a time you disagreed with a decision, made a mistake, took ownership, or improved a customer outcome', topic: 'Behavioral', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('ap'), title: 'Two Sum', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { id: uid('ap'), title: 'Merge Intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' },
      { id: uid('ap'), title: 'Top K Frequent Elements', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { id: uid('ap'), title: 'Binary Tree Level Order Traversal', topic: 'Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { id: uid('ap'), title: 'Number of Islands', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
      { id: uid('ap'), title: 'LRU Cache', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/' },
      { id: uid('ap'), title: 'Top K Frequent Words', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-words/' },
    ],
    coreTopics: ['Arrays', 'Hash Maps', 'Trees', 'Heaps', 'Graphs', 'BFS/DFS', 'Intervals', 'Complexity', 'OOP', 'System Design', 'Structured Behavioral Stories'],
    resources: [
      { title: 'Amazon-tagged questions on LeetCode', url: 'https://leetcode.com/company/amazon/', type: 'community' },
      { title: 'Amazon interview preparation (official)', url: 'https://www.amazon.jobs/content/en/how-we-hire/interviewing-at-amazon', type: 'official' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'faang',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. META
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'meta',
    name: 'Meta',
    shortName: 'M',
    description: 'Social technology company behind Facebook, Instagram, WhatsApp, and Reality Labs.',
    brandColor: '#0081FB',
    preparationFocus: [
      'Fast, accurate coding', 'Arrays/strings', 'Hash maps',
      'Trees/graphs', 'BFS/DFS', 'Intervals', 'Explaining complexity',
    ],
    interviewFocusNote: 'Prioritize fast, accurate coding and explaining complexity. Experienced roles may include product/system design. Practice solving under a time limit while communicating clearly.',
    reportedQuestions: [
      { id: uid('meq'), title: 'Valid palindrome / palindrome with permitted deletions', topic: 'Two Pointers', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/', sourceType: 'candidate' },
      { id: uid('meq'), title: 'Group anagrams', topic: 'Hash Map', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/', sourceType: 'candidate' },
      { id: uid('meq'), title: 'Longest substring without repeating characters', topic: 'Sliding Window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', sourceType: 'candidate' },
      { id: uid('meq'), title: 'Merge intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/', sourceType: 'candidate' },
      { id: uid('meq'), title: 'Binary tree right-side view', topic: 'Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-right-side-view/', sourceType: 'candidate' },
      { id: uid('meq'), title: 'Number of islands', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/', sourceType: 'candidate' },
      { id: uid('meq'), title: 'Clone a graph', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/clone-graph/', sourceType: 'candidate' },
      { id: uid('meq'), title: 'K closest points to the origin', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/k-closest-points-to-origin/', sourceType: 'candidate' },
      { id: uid('meq'), title: 'Randomized set with O(1)-average operations', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/insert-delete-getrandom-o1/', sourceType: 'candidate' },
      { id: uid('meq'), title: 'Design a news feed or messaging feature (design round)', topic: 'System Design', sourceType: 'candidate' },
    ],
    practiceQuestions: [
      { id: uid('mep'), title: 'Valid Palindrome', topic: 'Two Pointers', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/' },
      { id: uid('mep'), title: 'Group Anagrams', topic: 'Hash Map', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/' },
      { id: uid('mep'), title: 'Merge Intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' },
      { id: uid('mep'), title: 'Binary Tree Right Side View', topic: 'Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
      { id: uid('mep'), title: 'Clone Graph', topic: 'Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/clone-graph/' },
      { id: uid('mep'), title: 'K Closest Points to Origin', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
      { id: uid('mep'), title: 'Insert Delete GetRandom O(1)', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/insert-delete-getrandom-o1/' },
    ],
    coreTopics: ['Strings', 'Hash Maps', 'Sorting', 'Two Pointers', 'Sliding Window', 'Trees', 'Graphs', 'Heaps', 'BFS/DFS', 'Complexity'],
    resources: [
      { title: 'Meta-tagged questions on LeetCode', url: 'https://leetcode.com/company/facebook/', type: 'community' },
      { title: 'Meta engineering interview guide (official PDF)', url: 'https://d3no4ktch0fdq4.cloudfront.net/public/course/files/Meta_SWE_tech_screen_guide.pdf', type: 'official' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'faang',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. APPLE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'apple',
    name: 'Apple',
    shortName: 'A',
    description: 'Consumer electronics, software, and services company known for iOS, macOS, and hardware.',
    brandColor: '#A2AAAD',
    preparationFocus: [
      'Strong fundamentals', 'Implementation choices', 'Performance',
      'Memory management', 'Concurrency', 'Testing', 'Product quality',
    ],
    interviewFocusNote: 'Apple interviews vary substantially by team and role. Use the job description to identify the relevant stack: iOS/macOS, backend, systems, hardware-adjacent software, ML, or infrastructure.',
    reportedQuestions: [
      { id: uid('apq'), title: 'Reverse a linked list and explain the pointer changes', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/', sourceType: 'candidate' },
      { id: uid('apq'), title: 'Implement an LRU cache', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/', sourceType: 'candidate' },
      { id: uid('apq'), title: 'Find duplicates or frequency counts in an array', topic: 'Hash Map', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('apq'), title: 'Explain the difference between stack and heap memory', topic: 'OS / Memory', sourceType: 'candidate' },
      { id: uid('apq'), title: 'Explain reference counting, ARC, or memory management', topic: 'Language Specific', sourceType: 'candidate' },
      { id: uid('apq'), title: 'Discuss race conditions, locks, and thread safety', topic: 'Concurrency', sourceType: 'candidate' },
      { id: uid('apq'), title: 'Design a cache or a file-sync component', topic: 'System Design', sourceType: 'candidate' },
      { id: uid('apq'), title: 'Debug a slow or memory-heavy application', topic: 'Debugging', sourceType: 'candidate' },
      { id: uid('apq'), title: 'Describe how you would test an edge case or intermittent bug', topic: 'Testing', sourceType: 'editorial' },
      { id: uid('apq'), title: 'Explain a project in detail, including a design decision you would change', topic: 'Behavioral', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('app'), title: 'LRU Cache', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/' },
      { id: uid('app'), title: 'Merge Two Sorted Lists', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { id: uid('app'), title: 'Valid Parentheses', topic: 'Stack', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-parentheses/' },
      { id: uid('app'), title: 'Top K Frequent Elements', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
    ],
    coreTopics: ['DSA', 'Language-specific Depth', 'Memory Management', 'Concurrency', 'Testing', 'Performance Profiling', 'Debugging', 'API Design'],
    resources: [
      { title: 'Apple-tagged questions on LeetCode', url: 'https://leetcode.com/company/apple/', type: 'community' },
      { title: 'Apple Jobs — India', url: 'https://jobs.apple.com/en-in/search/?location=india-INDC', type: 'official' },
      { title: 'LeetCode interview study plans', url: 'https://leetcode.com/studyplan/', type: 'community' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'faang',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. NETFLIX
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'netflix',
    name: 'Netflix',
    shortName: 'N',
    description: 'Global streaming entertainment service with technology-driven content delivery.',
    brandColor: '#E50914',
    preparationFocus: [
      'DSA', 'Backend services', 'Distributed systems', 'Data platforms',
      'Streaming infrastructure', 'Reliability', 'Autonomy', 'Judgment',
    ],
    interviewFocusNote: 'Netflix roles are highly team-specific. Experienced interviews can emphasize autonomy, judgment, ownership, communication, and operational excellence. Practice prompts below are aligned to common backend/distributed-systems work, not claims that Netflix asks these exact questions.',
    reportedQuestions: [
      { id: uid('nq'), title: 'Implement an LRU cache and discuss eviction behavior', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/', sourceType: 'editorial' },
      { id: uid('nq'), title: 'Find the top K items from a large stream', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/', sourceType: 'editorial' },
      { id: uid('nq'), title: 'Design a rate limiter', topic: 'System Design', sourceType: 'editorial' },
      { id: uid('nq'), title: 'Design a video metadata or playback service', topic: 'System Design', sourceType: 'editorial' },
      { id: uid('nq'), title: 'Design a recommendation-serving API and discuss latency', topic: 'System Design', sourceType: 'editorial' },
      { id: uid('nq'), title: 'Explain caching, replication, retries, idempotency, and failure handling', topic: 'Distributed Systems', sourceType: 'editorial' },
      { id: uid('nq'), title: 'Find shortest paths or connected components in a graph', topic: 'Graph', difficulty: 'Medium', sourceType: 'editorial' },
      { id: uid('nq'), title: 'Debug a service with rising latency and error rates', topic: 'Debugging', sourceType: 'editorial' },
      { id: uid('nq'), title: 'Explain how you would safely roll out a service change', topic: 'Operations', sourceType: 'editorial' },
      { id: uid('nq'), title: 'Describe a decision you made with incomplete information and how you handled the result', topic: 'Behavioral', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('np'), title: 'LRU Cache', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/' },
      { id: uid('np'), title: 'Design Twitter', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-twitter/' },
      { id: uid('np'), title: 'Time Based Key-Value Store', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/time-based-key-value-store/' },
      { id: uid('np'), title: 'Number of Recent Calls', topic: 'Design', difficulty: 'Easy', url: 'https://leetcode.com/problems/number-of-recent-calls/' },
      { id: uid('np'), title: 'Top K Frequent Elements', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
    ],
    coreTopics: ['Backend Services', 'Distributed Systems', 'Caching', 'Reliability', 'Scalability', 'Graph Algorithms', 'System Design'],
    resources: [
      { title: 'Netflix-tagged questions on LeetCode', url: 'https://leetcode.com/company/netflix/', type: 'community' },
      { title: 'NeetCode 150', url: 'https://neetcode.io/practice', type: 'community' },
      { title: 'System Design Primer — GitHub', url: 'https://github.com/donnemartin/system-design-primer', type: 'community' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'faang',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ADOBE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'adobe',
    name: 'Adobe',
    shortName: 'Ad',
    description: 'Creative software, digital media, and marketing solutions leader.',
    brandColor: '#FF0000',
    preparationFocus: [
      'DSA', 'OOP', 'Core CS', 'Role-specific product engineering',
      'UI architecture', 'APIs', 'Databases', 'Testing',
    ],
    interviewFocusNote: 'Prepare DSA, OOP, core CS, and role-specific product engineering. For frontend roles, also review UI architecture, rendering/performance, and accessibility.',
    reportedQuestions: [
      { id: uid('adq'), title: 'Find the first non-repeating character in a string', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/first-unique-character-in-a-string/', sourceType: 'candidate' },
      { id: uid('adq'), title: 'Merge overlapping intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/', sourceType: 'candidate' },
      { id: uid('adq'), title: 'Find the longest substring without repeating characters', topic: 'Sliding Window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', sourceType: 'candidate' },
      { id: uid('adq'), title: 'Find the Kth largest element', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', sourceType: 'candidate' },
      { id: uid('adq'), title: 'Implement an LRU cache', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/', sourceType: 'candidate' },
      { id: uid('adq'), title: 'Explain polymorphism, abstraction, and composition with examples', topic: 'OOP', sourceType: 'candidate' },
      { id: uid('adq'), title: 'Write SQL queries using joins and aggregation', topic: 'SQL', sourceType: 'candidate' },
      { id: uid('adq'), title: 'Explain how you would improve the performance of a slow application', topic: 'Performance', sourceType: 'editorial' },
      { id: uid('adq'), title: 'Describe a project, a difficult bug, and how you tested the fix', topic: 'Behavioral', sourceType: 'editorial' },
      { id: uid('adq'), title: 'Explain a design trade-off in a feature you built', topic: 'Behavioral', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('adp'), title: 'First Unique Character in a String', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/first-unique-character-in-a-string/' },
      { id: uid('adp'), title: 'Merge Intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' },
      { id: uid('adp'), title: 'Longest Substring Without Repeating Characters', topic: 'Sliding Window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: uid('adp'), title: 'Kth Largest Element in an Array', topic: 'Heap', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { id: uid('adp'), title: 'LRU Cache', topic: 'Design', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/' },
    ],
    coreTopics: ['DSA', 'OOP', 'Core CS', 'SQL', 'Performance', 'UI Architecture', 'Testing'],
    resources: [
      { title: 'Adobe-tagged questions on LeetCode', url: 'https://leetcode.com/company/adobe/', type: 'community' },
      { title: 'SQL 50 study plan', url: 'https://leetcode.com/studyplan/top-sql-50/', type: 'community' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'product',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. SALESFORCE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'salesforce',
    name: 'Salesforce',
    shortName: 'SF',
    description: 'Cloud-based CRM platform and enterprise software services leader.',
    brandColor: '#00A1E0',
    preparationFocus: [
      'Coding fundamentals', 'OOP', 'Databases/SQL', 'API design',
      'Testing', 'System design',
    ],
    interviewFocusNote: 'Prioritize coding fundamentals, OOP, databases/SQL, API design, testing, and system design. For Salesforce platform roles, add Apex, governor limits, SOQL, LWC, and platform architecture as required.',
    reportedQuestions: [
      { id: uid('sfq'), title: 'Find two numbers in an array that sum to a target', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/', sourceType: 'candidate' },
      { id: uid('sfq'), title: 'Group anagrams or count character frequencies', topic: 'Hash Map', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/', sourceType: 'candidate' },
      { id: uid('sfq'), title: 'Merge intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/', sourceType: 'candidate' },
      { id: uid('sfq'), title: 'Find the lowest common ancestor in a tree', topic: 'Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', sourceType: 'candidate' },
      { id: uid('sfq'), title: 'Explain SQL joins, indexes, and transaction properties', topic: 'SQL', sourceType: 'candidate' },
      { id: uid('sfq'), title: 'Design a REST API for customer/contact records', topic: 'API Design', sourceType: 'editorial' },
      { id: uid('sfq'), title: 'Explain authentication vs authorization and how to protect an API', topic: 'Security', sourceType: 'editorial' },
      { id: uid('sfq'), title: 'Discuss test doubles, unit tests, and integration tests', topic: 'Testing', sourceType: 'editorial' },
      { id: uid('sfq'), title: 'For platform roles: explain bulkification, governor limits, triggers, and SOQL', topic: 'Salesforce Platform', sourceType: 'editorial' },
      { id: uid('sfq'), title: 'Describe how you would prevent duplicate or inconsistent records during integration', topic: 'Data Integrity', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('sfp'), title: 'Two Sum', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { id: uid('sfp'), title: 'Group Anagrams', topic: 'Hash Map', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/' },
      { id: uid('sfp'), title: 'Merge Intervals', topic: 'Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' },
    ],
    coreTopics: ['Coding Fundamentals', 'OOP', 'SQL/DBMS', 'API Design', 'Testing', 'System Design'],
    resources: [
      { title: 'Salesforce-tagged questions on LeetCode', url: 'https://leetcode.com/company/salesforce/', type: 'community' },
      { title: 'SQL 50 study plan', url: 'https://leetcode.com/studyplan/top-sql-50/', type: 'community' },
      { title: 'HackerRank SQL practice', url: 'https://www.hackerrank.com/domains/sql', type: 'community' },
      { title: 'Salesforce developer documentation', url: 'https://developer.salesforce.com/docs', type: 'official' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'product',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 9. IBM
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'ibm',
    name: 'IBM',
    shortName: 'IBM',
    description: 'Enterprise technology, consulting, cloud, AI, and infrastructure services company.',
    brandColor: '#0530AD',
    preparationFocus: [
      'Coding', 'OOP', 'SQL', 'OS', 'Networking', 'Projects', 'Communication',
    ],
    interviewFocusNote: 'The interview depends on the role: consulting, software engineering, infrastructure, cloud, data, or AI. For graduate/entry roles, prepare coding, OOP, SQL, OS, networking, projects, and communication.',
    reportedQuestions: [
      { id: uid('ibq'), title: 'Reverse a string or check whether a string is a palindrome', topic: 'Strings', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-string/', sourceType: 'candidate' },
      { id: uid('ibq'), title: 'Find the second-largest element in an array', topic: 'Arrays', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('ibq'), title: 'Count the frequency of each character using a map', topic: 'Hash Map', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('ibq'), title: 'Explain inheritance, polymorphism, abstraction, and encapsulation', topic: 'OOP', sourceType: 'candidate' },
      { id: uid('ibq'), title: 'Write SQL queries with joins, GROUP BY, and aggregate functions', topic: 'SQL', sourceType: 'candidate' },
      { id: uid('ibq'), title: 'Explain process vs thread and deadlock', topic: 'OS', sourceType: 'candidate' },
      { id: uid('ibq'), title: 'Explain TCP vs UDP and HTTP vs HTTPS', topic: 'Networking', sourceType: 'candidate' },
      { id: uid('ibq'), title: 'Walk through your strongest project and a bug you solved', topic: 'Behavioral', sourceType: 'editorial' },
      { id: uid('ibq'), title: 'Explain how you would test invalid input and boundary cases', topic: 'Testing', sourceType: 'editorial' },
      { id: uid('ibq'), title: 'For cloud/consulting: describe a technical solution to a customer problem and its trade-offs', topic: 'Consulting', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('ibp'), title: 'Reverse String', topic: 'Strings', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-string/' },
      { id: uid('ibp'), title: 'Valid Anagram', topic: 'Hash Map', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-anagram/' },
      { id: uid('ibp'), title: 'Second Highest Salary', topic: 'SQL', difficulty: 'Medium', url: 'https://leetcode.com/problems/second-highest-salary/' },
    ],
    coreTopics: ['Coding', 'OOP', 'SQL/DBMS', 'OS', 'Networking', 'Communication', 'Projects'],
    resources: [
      { title: 'IBM-tagged questions on LeetCode', url: 'https://leetcode.com/company/ibm/', type: 'community' },
      { title: 'HackerRank Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', type: 'community' },
      { title: 'HackerRank SQL', url: 'https://www.hackerrank.com/domains/sql', type: 'community' },
      { title: 'IndiaBix aptitude practice', url: 'https://www.indiabix.com/', type: 'community' },
    ],
    hasAptitude: true,
    aptitudeTopics: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
    tier: 'enterprise',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 10. ORACLE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'oracle',
    name: 'Oracle',
    shortName: 'O',
    description: 'Enterprise database, cloud infrastructure, and enterprise software company.',
    brandColor: '#F80000',
    preparationFocus: [
      'DSA', 'Core CS', 'Databases', 'SQL', 'Transactions',
      'Indexing', 'Query plans', 'Concurrency',
    ],
    interviewFocusNote: 'Prepare DSA and core CS alongside databases and SQL. For database, cloud, and backend roles, review transactions, indexing, query plans, concurrency, distributed systems, and reliability.',
    reportedQuestions: [
      { id: uid('oq'), title: 'Find duplicates and frequency counts in an array', topic: 'Hash Map', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('oq'), title: 'Reverse a linked list', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/', sourceType: 'candidate' },
      { id: uid('oq'), title: 'Search a sorted array using binary search', topic: 'Binary Search', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/', sourceType: 'candidate' },
      { id: uid('oq'), title: 'Find the longest substring without repeating characters', topic: 'Sliding Window', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', sourceType: 'candidate' },
      { id: uid('oq'), title: 'Explain inner, left, right, and full joins', topic: 'SQL', sourceType: 'candidate' },
      { id: uid('oq'), title: 'Explain normalization and when denormalization is useful', topic: 'DBMS', sourceType: 'candidate' },
      { id: uid('oq'), title: 'What is an index? How can it speed up or slow down queries?', topic: 'DBMS', sourceType: 'candidate' },
      { id: uid('oq'), title: 'Explain ACID properties and transaction isolation', topic: 'DBMS', sourceType: 'candidate' },
      { id: uid('oq'), title: 'Write a query to find the second-highest salary', topic: 'SQL', difficulty: 'Medium', url: 'https://leetcode.com/problems/second-highest-salary/', sourceType: 'candidate' },
      { id: uid('oq'), title: 'Diagnose a slow SQL query and explain how you would investigate it', topic: 'Performance', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('op'), title: 'Second Highest Salary', topic: 'SQL', difficulty: 'Medium', url: 'https://leetcode.com/problems/second-highest-salary/' },
      { id: uid('op'), title: 'Duplicate Emails', topic: 'SQL', difficulty: 'Easy', url: 'https://leetcode.com/problems/duplicate-emails/' },
      { id: uid('op'), title: 'Combine Two Tables', topic: 'SQL', difficulty: 'Easy', url: 'https://leetcode.com/problems/combine-two-tables/' },
      { id: uid('op'), title: 'Binary Search', topic: 'Binary Search', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/' },
    ],
    coreTopics: ['DSA', 'Core CS', 'SQL/DBMS', 'Transactions', 'Indexing', 'Concurrency', 'Distributed Systems'],
    resources: [
      { title: 'Oracle-tagged questions on LeetCode', url: 'https://leetcode.com/company/oracle/', type: 'community' },
      { title: 'SQL 50 study plan', url: 'https://leetcode.com/studyplan/top-sql-50/', type: 'community' },
      { title: 'HackerRank SQL', url: 'https://www.hackerrank.com/domains/sql', type: 'community' },
      { title: 'HackerRank Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', type: 'community' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'enterprise',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 11. NVIDIA
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'nvidia',
    name: 'NVIDIA',
    shortName: 'NV',
    description: 'GPU computing, AI accelerators, and visual computing technology leader.',
    brandColor: '#76B900',
    preparationFocus: [
      'DSA', 'C/C++ fundamentals', 'Debugging', 'Concurrency',
      'Systems', 'Parallel programming', 'Memory hierarchy',
    ],
    interviewFocusNote: 'NVIDIA interviews are strongly role-dependent. For GPU, CUDA, compiler, graphics, AI, or performance roles, prepare the specific math, architecture, parallel programming, memory hierarchy, profiling, and framework knowledge listed in the job description.',
    reportedQuestions: [
      { id: uid('nvq'), title: 'Explain pointers, references, RAII, and object lifetime in C++', topic: 'C/C++', sourceType: 'editorial' },
      { id: uid('nvq'), title: 'Find a cycle in a linked list or graph', topic: 'Linked List / Graph', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/', sourceType: 'editorial' },
      { id: uid('nvq'), title: 'Implement a thread-safe queue or explain producer-consumer synchronization', topic: 'Concurrency', sourceType: 'editorial' },
      { id: uid('nvq'), title: 'Explain race conditions, mutexes, atomics, and deadlocks', topic: 'Concurrency', sourceType: 'editorial' },
      { id: uid('nvq'), title: 'Analyze time and space complexity and identify performance bottlenecks', topic: 'Complexity', sourceType: 'editorial' },
      { id: uid('nvq'), title: 'Explain cache locality, memory bandwidth, and latency', topic: 'Systems', sourceType: 'editorial' },
      { id: uid('nvq'), title: 'For CUDA roles: explain thread blocks, warps, memory coalescing, and shared vs global memory', topic: 'CUDA', sourceType: 'editorial' },
      { id: uid('nvq'), title: 'For GPU roles: reason about parallelizing a reduction or matrix operation', topic: 'GPU Computing', sourceType: 'editorial' },
      { id: uid('nvq'), title: 'Explain how you would profile and optimize a slow kernel or service', topic: 'Performance', sourceType: 'editorial' },
      { id: uid('nvq'), title: 'Discuss a difficult low-level bug and how you isolated it', topic: 'Debugging', sourceType: 'editorial' },
    ],
    practiceQuestions: [
      { id: uid('nvp'), title: 'Linked List Cycle', topic: 'Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
    ],
    coreTopics: ['DSA', 'C/C++', 'Concurrency', 'Systems Programming', 'Memory Hierarchy', 'Debugging', 'Parallel Programming'],
    resources: [
      { title: 'NVIDIA-tagged questions on LeetCode', url: 'https://leetcode.com/company/nvidia/', type: 'community' },
      { title: 'LeetCode C++ study plans', url: 'https://leetcode.com/studyplan/', type: 'community' },
      { title: 'HackerRank C++ practice', url: 'https://www.hackerrank.com/domains/cpp', type: 'community' },
      { title: 'HackerRank Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', type: 'community' },
      { title: 'CUDA C++ Programming Guide', url: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/', type: 'official' },
      { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'community' },
    ],
    hasAptitude: false,
    aptitudeTopics: [],
    tier: 'product',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 12. INFOSYS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'infosys',
    name: 'Infosys',
    shortName: 'IN',
    description: 'Indian multinational IT services, consulting, and digital transformation company.',
    brandColor: '#007CC3',
    preparationFocus: [
      'Aptitude', 'Logical reasoning', 'Verbal ability',
      'Programming fundamentals', 'Coding', 'OOP', 'DBMS/SQL',
      'OS/Networking basics', 'Projects', 'HR communication',
    ],
    interviewFocusNote: 'For Indian fresher/campus hiring, prepare aptitude, logical reasoning, verbal ability, programming fundamentals, coding, OOP, DBMS/SQL, OS/networking basics, projects, and HR communication. Higher-tier specialist tracks may require harder DSA.',
    reportedQuestions: [
      { id: uid('inq'), title: 'Tell me about yourself and explain your strongest project', topic: 'Behavioral', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Reverse a string or number without relying on a built-in reverse function', topic: 'Strings', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Check whether a number is prime, an integer is a palindrome, or a string is an anagram', topic: 'Programming Logic', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Print Fibonacci numbers iteratively and recursively; compare complexity', topic: 'Recursion', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Find the second-largest element in an array', topic: 'Arrays', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Count character frequencies in a string', topic: 'Hash Map', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Explain OOP pillars with real examples', topic: 'OOP', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Write SQL queries using joins, GROUP BY, and aggregate functions', topic: 'SQL', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Explain normalization, primary/foreign keys, and ACID properties', topic: 'DBMS', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Explain process vs thread, deadlock, and basic networking concepts', topic: 'OS / Networking', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Explain your project architecture, database, role, and biggest challenge', topic: 'Behavioral', sourceType: 'candidate' },
      { id: uid('inq'), title: 'Why Infosys? What did you learn recently?', topic: 'HR', sourceType: 'candidate' },
    ],
    practiceQuestions: [],
    coreTopics: ['Programming Fundamentals', 'OOP', 'SQL/DBMS', 'OS', 'Networking', 'Projects', 'Communication'],
    resources: [
      { title: 'Infosys-tagged questions on LeetCode', url: 'https://leetcode.com/company/infosys/', type: 'community' },
      { title: 'IndiaBix aptitude', url: 'https://www.indiabix.com/', type: 'community' },
      { title: 'IndiaBix logical reasoning', url: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/', type: 'community' },
      { title: 'HackerRank Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', type: 'community' },
      { title: 'HackerRank SQL', url: 'https://www.hackerrank.com/domains/sql', type: 'community' },
      { title: 'CodeChef Practice', url: 'https://www.codechef.com/practice', type: 'community' },
      { title: 'GeeksforGeeks interview experiences', url: 'https://www.geeksforgeeks.org/interview-experiences/', type: 'community' },
    ],
    hasAptitude: true,
    aptitudeTopics: [
      'Percentages', 'Ratios', 'Averages', 'Profit/Loss',
      'Time and Work', 'Speed/Distance', 'Probability',
      'Permutations/Combinations', 'Number Series',
      'Seating Arrangements', 'Syllogisms', 'Coding-Decoding',
      'Reading Comprehension', 'Grammar',
    ],
    tier: 'services',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 13. TCS
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'tcs',
    name: 'TCS',
    shortName: 'TCS',
    description: 'Tata Consultancy Services — India\'s largest IT services and consulting company.',
    brandColor: '#0072C6',
    preparationFocus: [
      'Aptitude', 'Verbal and logical reasoning', 'Programming logic',
      'Coding', 'OOP', 'DBMS/SQL', 'OS', 'Networking', 'Projects',
    ],
    interviewFocusNote: 'TCS fresher hiring can include online assessment followed by technical, managerial, and/or HR discussions depending on the program. Higher-tier tracks may require stronger DSA.',
    reportedQuestions: [
      { id: uid('tq'), title: 'Write a program to reverse a string or check a palindrome', topic: 'Strings', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Find the largest and second-largest elements in an array', topic: 'Arrays', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Check prime numbers and generate Fibonacci numbers', topic: 'Programming Logic', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Count vowels, words, or character frequencies in a string', topic: 'Strings', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Remove duplicate elements from an array', topic: 'Arrays', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Explain arrays vs linked lists and stack vs queue', topic: 'Data Structures', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Explain OOP concepts and give code examples', topic: 'OOP', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Write a SQL query using joins and grouping', topic: 'SQL', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Explain DBMS normalization, keys, and transactions', topic: 'DBMS', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Explain your project and why you chose its tools', topic: 'Behavioral', sourceType: 'candidate' },
      { id: uid('tq'), title: 'Why TCS, and what do you know about the role?', topic: 'HR', sourceType: 'candidate' },
    ],
    practiceQuestions: [],
    coreTopics: ['Programming Fundamentals', 'OOP', 'SQL/DBMS', 'OS', 'Networking', 'Projects'],
    resources: [
      { title: 'TCS-tagged questions on LeetCode', url: 'https://leetcode.com/company/tcs/', type: 'community' },
      { title: 'IndiaBix aptitude', url: 'https://www.indiabix.com/', type: 'community' },
      { title: 'CodeChef Practice', url: 'https://www.codechef.com/practice', type: 'community' },
      { title: 'HackerRank Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', type: 'community' },
      { title: 'GeeksforGeeks interview experiences', url: 'https://www.geeksforgeeks.org/interview-experiences/', type: 'community' },
      { title: 'PrepInsta — placement preparation', url: 'https://prepinsta.com/', type: 'community' },
    ],
    hasAptitude: true,
    aptitudeTopics: [
      'Numerical Ability', 'Ratios', 'Percentages', 'Averages',
      'Time/Work', 'Speed/Distance', 'Number Series',
      'Logical Reasoning', 'Visual Reasoning',
      'Verbal Ability', 'Pseudocode/Programming Logic',
    ],
    tier: 'services',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 14. WIPRO
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'wipro',
    name: 'Wipro',
    shortName: 'W',
    description: 'Indian IT services, consulting, and business process services company.',
    brandColor: '#441E8E',
    preparationFocus: [
      'Aptitude', 'Logical reasoning', 'Verbal ability', 'Coding basics',
      'OOP', 'DBMS', 'OS', 'Networking', 'Project discussion',
    ],
    interviewFocusNote: 'For campus/fresher roles, prepare aptitude, logical reasoning, verbal ability, coding basics, OOP, DBMS, OS, networking, resume/project discussion, and HR questions. Role and hiring-track formats vary.',
    reportedQuestions: [
      { id: uid('wq'), title: 'Reverse a string and check whether it is a palindrome', topic: 'Strings', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('wq'), title: 'Find the largest/second-largest element in an array', topic: 'Arrays', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('wq'), title: 'Generate Fibonacci numbers and check prime numbers', topic: 'Programming Logic', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('wq'), title: 'Count occurrences of each character', topic: 'Hash Map', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('wq'), title: 'Explain arrays, linked lists, stacks, and queues', topic: 'Data Structures', sourceType: 'candidate' },
      { id: uid('wq'), title: 'Explain OOP pillars with practical examples', topic: 'OOP', sourceType: 'candidate' },
      { id: uid('wq'), title: 'Explain primary key vs foreign key and SQL joins', topic: 'SQL', sourceType: 'candidate' },
      { id: uid('wq'), title: 'Explain process vs thread and deadlock', topic: 'OS', sourceType: 'candidate' },
      { id: uid('wq'), title: 'Describe your project, your contribution, and one limitation', topic: 'Behavioral', sourceType: 'candidate' },
      { id: uid('wq'), title: 'Why Wipro? Describe a time you learned something quickly or worked with others', topic: 'HR', sourceType: 'candidate' },
    ],
    practiceQuestions: [],
    coreTopics: ['Programming Fundamentals', 'OOP', 'SQL/DBMS', 'OS', 'Networking', 'Projects'],
    resources: [
      { title: 'Wipro-tagged questions on LeetCode', url: 'https://leetcode.com/company/wipro/', type: 'community' },
      { title: 'IndiaBix quantitative aptitude', url: 'https://www.indiabix.com/quantitative-aptitude/questions-and-answers/', type: 'community' },
      { title: 'IndiaBix logical reasoning', url: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/', type: 'community' },
      { title: 'CodeChef Practice', url: 'https://www.codechef.com/practice', type: 'community' },
      { title: 'HackerRank Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', type: 'community' },
      { title: 'GeeksforGeeks interview experiences', url: 'https://www.geeksforgeeks.org/interview-experiences/', type: 'community' },
    ],
    hasAptitude: true,
    aptitudeTopics: [
      'Percentages', 'Ratios', 'Averages', 'Time and Work',
      'Speed and Distance', 'Probability Basics', 'Series', 'Puzzles',
      'Syllogisms', 'Seating Arrangements', 'Grammar', 'Reading Comprehension',
    ],
    tier: 'services',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 15. ACCENTURE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'accenture',
    name: 'Accenture',
    shortName: 'Acc',
    description: 'Global professional services and consulting company in technology, strategy, and operations.',
    brandColor: '#A100FF',
    preparationFocus: [
      'Logical and numerical reasoning', 'Verbal/communication skills',
      'Pseudocode', 'Coding fundamentals', 'OOP', 'DBMS/SQL',
      'OS/Networking basics', 'Projects',
    ],
    interviewFocusNote: 'Entry-level processes may include online assessment(s), communication or aptitude components, coding for relevant roles, and technical/HR discussions. The exact sequence differs by country, role, and hiring drive.',
    reportedQuestions: [
      { id: uid('acq'), title: 'Write a program to check a palindrome or reverse a string', topic: 'Strings', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('acq'), title: 'Find the second-largest element in an array', topic: 'Arrays', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('acq'), title: 'Count character frequencies or remove duplicate characters', topic: 'Hash Map', difficulty: 'Easy', sourceType: 'candidate' },
      { id: uid('acq'), title: 'Explain the difference between a compiler and an interpreter', topic: 'Programming Fundamentals', sourceType: 'candidate' },
      { id: uid('acq'), title: 'Explain OOP pillars and give an example of polymorphism', topic: 'OOP', sourceType: 'candidate' },
      { id: uid('acq'), title: 'Write a basic SQL query using joins or GROUP BY', topic: 'SQL', sourceType: 'candidate' },
      { id: uid('acq'), title: 'Explain process vs thread, deadlock, and basic networking', topic: 'OS / Networking', sourceType: 'candidate' },
      { id: uid('acq'), title: 'Walk through a project and describe your individual contribution', topic: 'Behavioral', sourceType: 'candidate' },
      { id: uid('acq'), title: 'Describe how you would debug a program that gives the wrong output', topic: 'Debugging', sourceType: 'candidate' },
      { id: uid('acq'), title: 'Why Accenture, and how do you approach learning a new technology?', topic: 'HR', sourceType: 'candidate' },
    ],
    practiceQuestions: [],
    coreTopics: ['Programming Fundamentals', 'OOP', 'SQL/DBMS', 'OS', 'Networking', 'Communication', 'Pseudocode'],
    resources: [
      { title: 'Accenture-tagged questions on LeetCode', url: 'https://leetcode.com/company/accenture/', type: 'community' },
      { title: 'IndiaBix aptitude', url: 'https://www.indiabix.com/', type: 'community' },
      { title: 'HackerRank Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', type: 'community' },
      { title: 'CodeChef Practice', url: 'https://www.codechef.com/practice', type: 'community' },
      { title: 'GeeksforGeeks interview experiences', url: 'https://www.geeksforgeeks.org/interview-experiences/', type: 'community' },
      { title: 'PrepInsta placement preparation', url: 'https://prepinsta.com/', type: 'community' },
    ],
    hasAptitude: true,
    aptitudeTopics: [
      'Numerical Reasoning', 'Logical Reasoning', 'Verbal Ability',
      'Pseudocode', 'Flowcharts', 'Pattern Recognition', 'Communication',
    ],
    tier: 'services',
  },
];

export default COMPANIES;

// ─── Additional curated practice resources ──────────────────────────────────
export const GENERAL_RESOURCES = [
  { title: 'NeetCode 150', url: 'https://neetcode.io/practice', type: 'community' },
  { title: 'Blind 75 — LeetCode list', url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions', type: 'community' },
  { title: 'LeetCode Top Interview 150', url: 'https://leetcode.com/studyplan/top-interview-150/', type: 'community' },
  { title: 'LeetCode SQL 50', url: 'https://leetcode.com/studyplan/top-sql-50/', type: 'community' },
  { title: 'HackerRank Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', type: 'community' },
  { title: 'CodeChef Practice', url: 'https://www.codechef.com/practice', type: 'community' },
  { title: 'GeeksforGeeks interview experiences', url: 'https://www.geeksforgeeks.org/interview-experiences/', type: 'community' },
  { title: 'IndiaBix aptitude and reasoning', url: 'https://www.indiabix.com/', type: 'community' },
];

// ─── Preparation roadmap phases ─────────────────────────────────────────────
export const PREPARATION_PHASES = [
  { phase: 1, title: 'Understand the Format', description: 'Research the interview format, role requirements, and official preparation guidance for your target company.' },
  { phase: 2, title: 'Review Core CS', description: 'Strengthen OOP, DBMS/SQL, OS, networking, and programming language fundamentals.' },
  { phase: 3, title: 'Practice Foundational DSA', description: 'Work through key data structures and algorithmic patterns using the shared practice set.' },
  { phase: 4, title: 'Company-Specific Practice', description: 'Complete the company\'s reported and recommended questions. Focus on patterns that align with the role.' },
  { phase: 5, title: 'Prepare Projects & Behavioral', description: 'Structure your project explanations and behavioral answers using the STAR-R method.' },
  { phase: 6, title: 'Mock Interviews & Timed Practice', description: 'Conduct timed practice sessions and mock interviews to build confidence and speed.' },
];
