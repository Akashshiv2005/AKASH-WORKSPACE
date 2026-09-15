import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Bell,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Upload,
  FileText,
  Download,
  Layers,
  X,
  Target
} from 'lucide-react';
import { apiClient } from '../../api/client';

export interface PlanProblem {
  id: string;
  title: string;
  url?: string;
  completed: boolean;
}

export interface PlanDay {
  day: number;
  title: string;
  category?: string;
  theory: string;
  estimatedTime?: string;
  problems: PlanProblem[];
  completed: boolean;
}

export interface PlanAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface PlanNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  activeDay: number;
  days: PlanDay[];
  notes: PlanNote[];
  attachments: PlanAttachment[];
}

// Default pre-built 30-Day DSA Curriculum template
const DEMO_DSA_DAYS: PlanDay[] = [
  {
    day: 1,
    title: 'Time & Space Complexity + Array Basics',
    category: 'Arrays & Hashing',
    theory: 'Understand Big-O notation, memory layout of arrays, in-place operations, and frequency hash maps.',
    estimatedTime: '60 mins',
    completed: false,
    problems: [
      { id: 'p1', title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', completed: false },
      { id: 'p2', title: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/', completed: false },
      { id: 'p3', title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', completed: false },
    ],
  },
  {
    day: 2,
    title: 'Two Pointers Technique & Convergence',
    category: 'Two Pointers',
    theory: 'Use left and right pointers moving towards each other in sorted arrays to reduce O(N^2) to O(N).',
    estimatedTime: '75 mins',
    completed: false,
    problems: [
      { id: 'p4', title: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/', completed: false },
      { id: 'p5', title: 'Two Sum II - Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', completed: false },
      { id: 'p6', title: '3Sum', url: 'https://leetcode.com/problems/3sum/', completed: false },
    ],
  },
  {
    day: 3,
    title: 'Container With Most Water & Trapping Rainwater',
    category: 'Two Pointers',
    theory: 'Greedy pointer movement based on min height bottleneck.',
    estimatedTime: '90 mins',
    completed: false,
    problems: [
      { id: 'p7', title: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/', completed: false },
      { id: 'p8', title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/', completed: false },
    ],
  },
  {
    day: 4,
    title: 'Sliding Window (Fixed & Variable Size)',
    category: 'Sliding Window',
    theory: 'Maintain window boundaries and track frequency hashmap inside window.',
    estimatedTime: '90 mins',
    completed: false,
    problems: [
      { id: 'p9', title: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', completed: false },
      { id: 'p10', title: 'Permutation in String', url: 'https://leetcode.com/problems/permutation-in-string/', completed: false },
    ],
  },
  {
    day: 5,
    title: 'Prefix Sum & Kadane Algorithm',
    category: 'Prefix Sum',
    theory: 'Prefix sum for O(1) range queries and Kadane max subarray sum.',
    estimatedTime: '75 mins',
    completed: false,
    problems: [
      { id: 'p11', title: 'Maximum Subarray (Kadane)', url: 'https://leetcode.com/problems/maximum-subarray/', completed: false },
      { id: 'p12', title: 'Subarray Sum Equals K', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', completed: false },
    ],
  },
];

// Fill rest of 30 days for DSA demo
for (let d = 6; d <= 30; d++) {
  const topics = [
    'Matrix Manipulation & Spiral Search',
    'Singly & Doubly Linked List Reversal',
    'Fast & Slow Pointers (Floyd Cycle Detection)',
    'Valid Parentheses & Min Stack',
    'Monotonic Stack Patterns & Daily Temperatures',
    'Binary Search Boundaries & 2D Matrix',
    'Binary Search on Answer Space (Koko Bananas)',
    'Merge Sort & Quick Sort Comparators',
    'Recursion & Subsets / Combinations',
    'Backtracking N-Queens & Sudoku Solver',
    'Binary Tree Traversals (DFS Inorder/Preorder/Postorder)',
    'Binary Tree BFS Level Order & LCA',
    'Binary Search Tree Validation & Kth Smallest',
    'Min/Max Heaps & Top K Frequent Elements',
    'Greedy Choice Property & Jump Game',
    'Graph Representation & BFS/DFS Grid Traversal',
    'Course Schedule & Topological Sort (Kahn Algo)',
    'Dijkstra Shortest Path & Union Find (DSU)',
    '1D Dynamic Programming (Climbing Stairs & House Robber)',
    'Unbounded Knapsack & Coin Change Pattern',
    '2D Dynamic Programming (LCS & Edit Distance)',
    'Trie Prefix Tree Implementation & Search',
    'Bit Manipulation & Single Number XOR',
    '30-Day Master Revision & Timed Mock Test',
  ];
  const topicTitle = topics[(d - 6) % topics.length];
  DEMO_DSA_DAYS.push({
    day: d,
    title: `Day ${d}: ${topicTitle}`,
    category: d <= 14 ? 'Data Structures' : d <= 21 ? 'Algorithms & Trees' : 'Advanced & DP',
    theory: `Study key concepts, space/time trade-offs, and implementation patterns for ${topicTitle}.`,
    estimatedTime: '75 mins',
    completed: false,
    problems: [
      { id: `p_${d}_1`, title: `LeetCode Practice Problem 1 for Day ${d}`, url: 'https://leetcode.com/problemset/all/', completed: false },
      { id: `p_${d}_2`, title: `LeetCode Practice Problem 2 for Day ${d}`, url: 'https://leetcode.com/problemset/all/', completed: false },
    ],
  });
}

const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-dsa-30',
    title: '30-Day DSA Master Plan',
    description: 'Day-wise structured roadmap to master Data Structures & Algorithms with curated problem sets.',
    category: 'Data Structures & Algorithms',
    startDate: new Date().toISOString().split('T')[0],
    activeDay: 1,
    days: DEMO_DSA_DAYS,
    notes: [
      {
        id: 'note-1',
        title: 'Core Time Complexities Cheat Sheet',
        content: 'O(1) < O(log N) < O(N) < O(N log N) < O(N^2) < O(2^N) < O(N!)',
        updatedAt: new Date().toLocaleDateString(),
      },
    ],
    attachments: [],
  },
  {
    id: 'plan-system-design',
    title: '14-Day System Design & Architecture',
    description: 'Master Scalability, Load Balancing, Caching, Database Sharding, and Microservices.',
    category: 'System Design',
    startDate: new Date().toISOString().split('T')[0],
    activeDay: 1,
    days: Array.from({ length: 14 }).map((_, i) => ({
      day: i + 1,
      title: `System Design Day ${i + 1}: ${
        ['Scalability & CAP Theorem', 'Load Balancers & Reverse Proxies', 'Caching Strategies (Redis/Memcached)', 'Database Sharding & Replication', 'Message Queues (Kafka/RabbitMQ)', 'REST vs gRPC vs GraphQL', 'Rate Limiters & API Gateways', 'Distributed Unique ID Generator (Snowflake)', 'URL Shortener Architecture (TinyURL)', 'Web Crawler Design', 'Distributed File System (HDFS/S3)', 'Chat Application (WebSockets)', 'Video Streaming Architecture (Netflix/YouTube)', 'System Design Mock Interview & Review'][i]
      }`,
      category: 'System Architecture',
      theory: 'Study trade-offs, SPOF (Single Point of Failure), latency vs throughput, and high availability.',
      estimatedTime: '90 mins',
      completed: false,
      problems: [],
    })),
    notes: [],
    attachments: [],
  },
];

export const PlansHub: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-dsa-30');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form states for raw ChatGPT text import
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanCategory, setNewPlanCategory] = useState('DSA & Coding');
  const [pastedText, setPastedText] = useState('');

  // Active view tab inside plan detail
  const [detailTab, setDetailTab] = useState<'roadmap' | 'notes' | 'uploads'>('roadmap');

  // Note form state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Email status
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('akash_plans_hub_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPlans(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage on updates
  useEffect(() => {
    localStorage.setItem('akash_plans_hub_data', JSON.stringify(plans));
  }, [plans]);

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Auto-parse pasted raw ChatGPT text into Day 1, Day 2, Day 3...
  const parsePastedPlanText = (rawText: string): PlanDay[] => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedDays: PlanDay[] = [];
    let currentDayNum = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match patterns like "Day 1:", "Day 01 -", "Day 1", "Week 1 Day 2"
      const dayMatch = line.match(/(?:Day|day)\s*(\d+)\s*[:\-\s]*(.*)/i);
      if (dayMatch) {
        const dNum = parseInt(dayMatch[1], 10) || currentDayNum;
        const dTitle = dayMatch[2] || line;
        
        // Grab next lines as theory / tasks until next Day line
        const theoryLines: string[] = [];
        let j = i + 1;
        while (j < lines.length && !lines[j].match(/(?:Day|day)\s*\d+/i)) {
          theoryLines.push(lines[j]);
          j++;
        }
        i = j - 1; // Advance main loop

        parsedDays.push({
          day: dNum,
          title: dTitle || `Day ${dNum} Topic`,
          category: 'Custom Roadmap',
          theory: theoryLines.slice(0, 3).join(' ') || 'Study key concepts and complete practice tasks for today.',
          estimatedTime: '60 mins',
          completed: false,
          problems: [],
        });
        currentDayNum = dNum + 1;
      } else if (line.match(/^(?:Week|Module|\d+\.)/i)) {
        // Section header
        continue;
      } else if (parsedDays.length === 0 && line.length > 5) {
        // Fallback for lines without explicit "Day X"
        parsedDays.push({
          day: currentDayNum,
          title: line,
          category: 'Custom Roadmap',
          theory: 'Learn core topics and implement exercises for this section.',
          estimatedTime: '60 mins',
          completed: false,
          problems: [],
        });
        currentDayNum++;
      }
    }

    // Fallback if parsing returned empty
    if (parsedDays.length === 0) {
      return Array.from({ length: 7 }).map((_, idx) => ({
        day: idx + 1,
        title: `Day ${idx + 1}: Custom Study Goal`,
        category: 'Custom Plan',
        theory: rawText.slice(0, 150) || 'Study target concepts.',
        estimatedTime: '60 mins',
        completed: false,
        problems: [],
      }));
    }

    return parsedDays;
  };

  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;

    const createdDays = parsePastedPlanText(pastedText);

    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      title: newPlanTitle.trim(),
      description: `Custom ${createdDays.length}-Day structured learning roadmap.`,
      category: newPlanCategory.trim() || 'General Learning',
      startDate: new Date().toISOString().split('T')[0],
      activeDay: 1,
      days: createdDays,
      notes: [],
      attachments: [],
    };

    setPlans([...plans, newPlan]);
    setSelectedPlanId(newPlan.id);
    setShowCreateModal(false);
    setNewPlanTitle('');
    setPastedText('');
  };

  const handleDeletePlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (plans.length <= 1) {
      alert('You must keep at least one plan.');
      return;
    }
    if (confirm('Are you sure you want to delete this plan?')) {
      const filtered = plans.filter((p) => p.id !== planId);
      setPlans(filtered);
      setSelectedPlanId(filtered[0].id);
    }
  };

  // Toggle Day Completion
  const toggleDayComplete = (dayNum: number) => {
    setPlans(
      plans.map((p) => {
        if (p.id !== activePlan.id) return p;
        const updatedDays = p.days.map((d) =>
          d.day === dayNum ? { ...d, completed: !d.completed } : d
        );
        return { ...p, days: updatedDays };
      })
    );
  };

  // Set Active Focus Day
  const setActiveDay = (dayNum: number) => {
    setPlans(
      plans.map((p) => (p.id === activePlan.id ? { ...p, activeDay: dayNum } : p))
    );
  };

  // Add Note to Plan
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const newNote: PlanNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      updatedAt: new Date().toLocaleDateString(),
    };

    setPlans(
      plans.map((p) =>
        p.id === activePlan.id ? { ...p, notes: [newNote, ...p.notes] } : p
      )
    );

    setNewNoteTitle('');
    setNewNoteContent('');
    setShowNoteForm(false);
  };

  // Handle File Upload Attachment
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newAttachment: PlanAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || 'document',
          dataUrl,
          uploadedAt: new Date().toLocaleDateString(),
        };

        setPlans((prevPlans) =>
          prevPlans.map((p) =>
            p.id === activePlan.id
              ? { ...p, attachments: [newAttachment, ...p.attachments] }
              : p
          )
        );
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteAttachment = (attId: string) => {
    setPlans(
      plans.map((p) =>
        p.id === activePlan.id
          ? { ...p, attachments: p.attachments.filter((a) => a.id !== attId) }
          : p
      )
    );
  };

  // Notifications
  const sendPushNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const activeDayItem = activePlan.days.find((d) => d.day === activePlan.activeDay) || activePlan.days[0];
      new Notification(`🎯 Today's Goal: ${activePlan.title}`, {
        body: `Day ${activeDayItem.day}: ${activeDayItem.title}`,
        icon: '/favicon.ico',
      });
    } else if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          const activeDayItem = activePlan.days.find((d) => d.day === activePlan.activeDay) || activePlan.days[0];
          new Notification(`🎯 Today's Goal: ${activePlan.title}`, {
            body: `Day ${activeDayItem.day}: ${activeDayItem.title}`,
            icon: '/favicon.ico',
          });
        }
      });
    }
  };

  const sendEmailNotification = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await apiClient.post('/notifications/test-email', { recipient_email: '' });
      if (res.data?.success) {
        setEmailStatus(`✨ Sent Today's Learning Goal (${activePlan.title}) to your email!`);
      } else {
        setEmailStatus('Alert dispatched to notification log.');
      }
    } catch {
      setEmailStatus('Notification reminder generated!');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Calculations
  const completedDaysCount = activePlan.days.filter((d) => d.completed).length;
  const totalDaysCount = activePlan.days.length;
  const percentLearned = totalDaysCount > 0 ? Math.round((completedDaysCount / totalDaysCount) * 100) : 0;
  const currentDayData = activePlan.days.find((d) => d.day === activePlan.activeDay) || activePlan.days[0];

  return (
    <div className="space-y-6 pt-2 text-[#1c1917]">
      {/* HEADER BAR & PLANS HUB SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#ff7a00] via-[#ff9500] to-[#e66000] p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-yellow-300" />
            <span>Plans & Learning Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{activePlan.title}</h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl">{activePlan.description}</p>
        </div>

        {/* Action Buttons & Progress Badge */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 text-center">
            <div className="text-base font-black text-white">{percentLearned}%</div>
            <div className="text-[10px] text-white/80 font-bold uppercase">Learned</div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white text-[#ff7a00] font-black rounded-xl text-xs shadow-lg hover:bg-orange-50 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create / Import Plan</span>
          </button>
        </div>
      </div>

      {/* PLANS SELECTION CAROUSEL / ROW */}
      <div className="space-y-2">
        <div className="text-xs font-black uppercase text-[#a8a29e] tracking-wider flex items-center justify-between px-1">
          <span>YOUR ACTIVE PLANS ({plans.length})</span>
          <span className="text-[11px] font-semibold text-[#ff7a00]">Click a plan to switch view</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {plans.map((p) => {
            const pDone = p.days.filter((d) => d.completed).length;
            const pTotal = p.days.length;
            const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
            const isSelected = p.id === activePlan.id;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all relative group ${
                  isSelected
                    ? 'bg-white border-[#ff7a00] shadow-lg ring-2 ring-[#ff7a00]/30'
                    : 'bg-[#faf7f2] border-[#f0e8dc] hover:border-[#ff7a00]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#fff3e5] text-[#ff7a00]">
                    {p.category}
                  </span>

                  <button
                    onClick={(e) => handleDeletePlan(p.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#a8a29e] hover:text-red-500 rounded transition-all"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-extrabold text-[#1c1917] mt-2 truncate">{p.title}</h3>

                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-[#44403c]">
                    <span>{pPct}% Learned</span>
                    <span>{pDone}/{pTotal} Days</span>
                  </div>
                  <div className="w-full bg-[#f0e8dc] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#ff7a00] to-[#ff9500] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAN DETAILS CONTAINER */}
      <div className="bg-white rounded-2xl border border-[#f0e8dc] shadow-xl p-6 space-y-6">
        {/* DETAIL NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDetailTab('roadmap')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                detailTab === 'roadmap'
                  ? 'bg-[#ff7a00] text-white shadow-md'
                  : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f2ebe1]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Day-Wise Roadmap</span>
            </button>

            <button
              onClick={() => setDetailTab('notes')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                detailTab === 'notes'
                  ? 'bg-[#ff7a00] text-white shadow-md'
                  : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f2ebe1]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Notes ({activePlan.notes.length})</span>
            </button>

            <button
              onClick={() => setDetailTab('uploads')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                detailTab === 'uploads'
                  ? 'bg-[#ff7a00] text-white shadow-md'
                  : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f2ebe1]'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Uploaded Files ({activePlan.attachments.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={sendPushNotification}
              className="p-2 rounded-xl border border-[#e7dfd4] hover:border-[#ff7a00] text-[#ff7a00] bg-[#fff3e5]"
              title="Notify Today's Lesson"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={sendEmailNotification}
              disabled={isSendingEmail}
              className="p-2 rounded-xl border border-[#ff7a00]/30 text-[#ff7a00] hover:bg-[#ff7a00]/10 font-bold text-xs"
              title="Send Email Reminder"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {emailStatus && (
          <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailStatus}</span>
          </div>
        )}

        {/* ROADMAP TAB */}
        {detailTab === 'roadmap' && (
          <div className="space-y-6">
            {/* TODAY'S GOAL FOCUS SPOTLIGHT CARD */}
            {currentDayData && (
              <div className="bg-gradient-to-br from-[#fff8f0] to-[#fff3e5] border-2 border-[#ff7a00]/40 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#ff9500] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                      D{currentDayData.day}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-[#ff7a00] tracking-wider">
                        WHAT TO LEARN TODAY
                      </div>
                      <h2 className="text-base font-extrabold text-[#1c1917] mt-0.5">
                        {currentDayData.title}
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleDayComplete(currentDayData.day)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all shrink-0 ${
                      currentDayData.completed
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gradient-to-r from-[#ff7a00] to-[#ff9500] text-white hover:opacity-95'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{currentDayData.completed ? 'Completed ✓' : 'Mark Today Complete'}</span>
                  </button>
                </div>

                <p className="text-xs text-[#44403c] mt-3 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#f0e8dc] leading-relaxed font-medium">
                  {currentDayData.theory}
                </p>
              </div>
            )}

            {/* DAY-WISE LIST */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-[#1c1917] tracking-wider">
                ALL {activePlan.days.length} DAYS ROADMAP
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activePlan.days.map((d) => {
                  const isActive = d.day === activePlan.activeDay;

                  return (
                    <div
                      key={d.day}
                      onClick={() => setActiveDay(d.day)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#fff3e5] border-[#ff7a00] ring-2 ring-[#ff7a00]/20'
                          : d.completed
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-[#faf7f2] border-[#f0e8dc] hover:border-[#ff7a00]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-6 h-6 rounded-md text-xs font-black flex items-center justify-center ${
                              d.completed
                                ? 'bg-emerald-600 text-white'
                                : isActive
                                ? 'bg-[#ff7a00] text-white'
                                : 'bg-[#e7dfd4] text-[#78716c]'
                            }`}
                          >
                            {d.day}
                          </span>
                          <span className="text-xs font-extrabold text-[#1c1917] truncate">
                            {d.title}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDayComplete(d.day);
                          }}
                          className="text-[#a8a29e] hover:text-[#ff7a00]"
                        >
                          {d.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-[#78716c] line-clamp-2 mt-2">
                        {d.theory}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {detailTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#1c1917]">
                Study Notes ({activePlan.notes.length})
              </h3>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#ff7a00] text-white text-xs font-bold rounded-lg hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Note</span>
              </button>
            </div>

            {showNoteForm && (
              <form onSubmit={handleAddNote} className="bg-[#faf7f2] border border-[#f0e8dc] p-4 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="Note Title (e.g. Dynamic Programming Formulas)..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e7dfd4] rounded-lg text-xs font-bold outline-none focus:border-[#ff7a00]"
                  required
                />
                <textarea
                  placeholder="Write your note content or code snippets..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e7dfd4] rounded-lg text-xs font-mono min-h-[100px] outline-none focus:border-[#ff7a00] resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-3 py-1 text-xs text-[#78716c]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-[#ff7a00] text-white text-xs font-bold rounded-lg"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePlan.notes.length === 0 ? (
                <p className="text-xs text-[#a8a29e] py-4">No notes created yet for this plan.</p>
              ) : (
                activePlan.notes.map((note) => (
                  <div key={note.id} className="p-4 bg-[#faf7f2] border border-[#f0e8dc] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-[#1c1917]">{note.title}</h4>
                      <span className="text-[10px] text-[#a8a29e]">{note.updatedAt}</span>
                    </div>
                    <p className="text-xs font-mono text-[#44403c] whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#e7dfd4]">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* UPLOADED FILES TAB */}
        {detailTab === 'uploads' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#faf7f2] border border-[#f0e8dc] p-4 rounded-xl">
              <div>
                <h3 className="text-xs font-black uppercase text-[#1c1917]">
                  Upload Notes & Attachments
                </h3>
                <p className="text-[11px] text-[#78716c]">
                  Upload PDFs, images, docs, or cheat sheets attached to this plan.
                </p>
              </div>

              <label className="flex items-center space-x-2 px-4 py-2 bg-[#ff7a00] text-white text-xs font-bold rounded-xl cursor-pointer hover:opacity-90 shadow-sm shrink-0">
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activePlan.attachments.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-[#a8a29e]">
                  No document attachments uploaded yet. Click Upload Document above.
                </div>
              ) : (
                activePlan.attachments.map((att) => (
                  <div key={att.id} className="p-3 bg-white border border-[#f0e8dc] rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText className="w-5 h-5 text-[#ff7a00] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1c1917] truncate">{att.name}</div>
                        <div className="text-[10px] text-[#a8a29e]">{att.size} • {att.uploadedAt}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <a
                        href={att.dataUrl}
                        download={att.name}
                        className="p-1 rounded text-[#ff7a00] hover:bg-[#fff3e5]"
                        title="Download / View"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => deleteAttachment(att.id)}
                        className="p-1 rounded text-[#a8a29e] hover:text-red-500"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* CREATE / IMPORT CHATGPT PLAN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#f0e8dc] shadow-2xl max-w-xl w-full p-6 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
              <h2 className="text-base font-black text-[#1c1917] flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-[#ff7a00]" />
                Create or Paste ChatGPT Plan
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-[#a8a29e] hover:text-[#1c1917]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1c1917] mb-1">Plan Title</label>
                <input
                  type="text"
                  placeholder="e.g. 30-Day DSA Mastery or Python Fullcourse..."
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#f0e8dc] rounded-xl text-xs outline-none focus:border-[#ff7a00]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1c1917] mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. DSA, Web Dev, System Design..."
                  value={newPlanCategory}
                  onChange={(e) => setNewPlanCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#f0e8dc] rounded-xl text-xs outline-none focus:border-[#ff7a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1c1917] mb-1 flex items-center justify-between">
                  <span>Paste Raw ChatGPT / Study Plan Text</span>
                  <span className="text-[10px] text-[#ff7a00] font-normal">Auto-formats into Day 1, Day 2...</span>
                </label>
                <textarea
                  placeholder={`Paste text from ChatGPT here, e.g.:\nDay 1: Arrays & Two Pointers\nLearn basic array traversal...\nDay 2: Sliding Window\nLearn fixed and variable window...`}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#f0e8dc] rounded-xl text-xs font-mono min-h-[140px] outline-none focus:border-[#ff7a00] resize-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#78716c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#ff7a00] to-[#ff9500] text-white font-black text-xs rounded-xl shadow-md hover:opacity-95"
                >
                  Auto-Format & Build Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
