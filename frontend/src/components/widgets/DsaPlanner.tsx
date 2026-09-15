import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Bell,
  BellOff,
  ChevronRight,
  Sparkles,
  Code2,
  Search,
  Send,
  Zap
} from 'lucide-react';
import { apiClient } from '../../api/client';

export interface DsaProblem {
  id: string;
  title: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface DsaDayItem {
  day: number;
  week: number;
  category: string;
  title: string;
  theory: string;
  estimatedTime: string;
  problems: DsaProblem[];
  tips: string;
}

const DSA_30_DAYS_CURRICULUM: DsaDayItem[] = [
  // WEEK 1: Arrays, Strings, Two Pointers & Sliding Window
  {
    day: 1,
    week: 1,
    category: 'Arrays & Hashing',
    title: 'Time & Space Complexity + Array Basics',
    theory: 'Understand Big-O notation (O(1), O(N), O(N log N)), memory layout of arrays, in-place operations, and frequency hash maps.',
    estimatedTime: '60 mins',
    tips: 'Always check constraints before coding to decide if O(N^2) or O(N log N) solution is required.',
    problems: [
      { id: 'p1', title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy' },
      { id: 'p2', title: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/', difficulty: 'Easy' },
      { id: 'p3', title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', difficulty: 'Easy' },
    ],
  },
  {
    day: 2,
    week: 1,
    category: 'Two Pointers',
    title: 'Two Pointers Technique & Convergence',
    theory: 'Use left and right pointers moving towards each other in sorted arrays to reduce O(N^2) search down to O(N).',
    estimatedTime: '75 mins',
    tips: 'Ensure the array is sorted before applying left/right two-pointer technique.',
    problems: [
      { id: 'p4', title: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/', difficulty: 'Easy' },
      { id: 'p5', title: 'Two Sum II - Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', difficulty: 'Medium' },
      { id: 'p6', title: '3Sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium' },
    ],
  },
  {
    day: 3,
    week: 1,
    category: 'Two Pointers',
    title: 'Container With Most Water & Trapping Rainwater',
    theory: 'Shrinking boundaries with greedy pointer movement. Move the pointer pointing to the smaller height.',
    estimatedTime: '90 mins',
    tips: 'For water capacity, the bottleneck is always min(height[left], height[right]).',
    problems: [
      { id: 'p7', title: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/', difficulty: 'Medium' },
      { id: 'p8', title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/', difficulty: 'Hard' },
    ],
  },
  {
    day: 4,
    week: 1,
    category: 'Sliding Window',
    title: 'Fixed Size Sliding Window',
    theory: 'Maintain a window of size K as it slides across an array. Add incoming element and remove outgoing element in O(1).',
    estimatedTime: '60 mins',
    tips: 'Use variable sum = sum + next - prev instead of recalculating window sum.',
    problems: [
      { id: 'p9', title: 'Maximum Average Subarray I', url: 'https://leetcode.com/problems/maximum-average-subarray-i/', difficulty: 'Easy' },
      { id: 'p10', title: 'Permutation in String', url: 'https://leetcode.com/problems/permutation-in-string/', difficulty: 'Medium' },
    ],
  },
  {
    day: 5,
    week: 1,
    category: 'Sliding Window',
    title: 'Variable Size Sliding Window',
    theory: 'Expand window right boundary until condition breaks, then shrink left boundary until condition is satisfied.',
    estimatedTime: '90 mins',
    tips: 'Keep track of character frequencies using a hashmap or int[26] array inside the window.',
    problems: [
      { id: 'p11', title: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', difficulty: 'Medium' },
      { id: 'p12', title: 'Longest Repeating Character Replacement', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/', difficulty: 'Medium' },
      { id: 'p13', title: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/', difficulty: 'Hard' },
    ],
  },
  {
    day: 6,
    week: 1,
    category: 'Prefix Sum & Kadane',
    title: "Prefix Sum Array & Kadane's Algorithm",
    theory: "Prefix sums allow O(1) range sum queries. Kadane's algorithm finds maximum subarray sum in O(N) time and O(1) space.",
    estimatedTime: '75 mins',
    tips: 'Reset running sum to 0 whenever current sum becomes negative in Kadane algorithm.',
    problems: [
      { id: 'p14', title: 'Maximum Subarray (Kadane)', url: 'https://leetcode.com/problems/maximum-subarray/', difficulty: 'Medium' },
      { id: 'p15', title: 'Subarray Sum Equals K', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', difficulty: 'Medium' },
      { id: 'p16', title: 'Product of Array Except Self', url: 'https://leetcode.com/problems/product-of-array-except-self/', difficulty: 'Medium' },
    ],
  },
  {
    day: 7,
    week: 1,
    category: 'Matrix Manipulation',
    title: '2D Arrays, Matrix Spiral & Rotation',
    theory: 'Traversal of 2D matrices, in-place matrix rotation by 90 degrees, set matrix zeroes, and diagonal patterns.',
    estimatedTime: '75 mins',
    tips: 'To rotate a matrix 90 deg clockwise: Transpose the matrix first, then reverse each row.',
    problems: [
      { id: 'p17', title: 'Rotate Image', url: 'https://leetcode.com/problems/rotate-image/', difficulty: 'Medium' },
      { id: 'p18', title: 'Spiral Matrix', url: 'https://leetcode.com/problems/spiral-matrix/', difficulty: 'Medium' },
      { id: 'p19', title: 'Set Matrix Zeroes', url: 'https://leetcode.com/problems/set-matrix-zeroes/', difficulty: 'Medium' },
    ],
  },

  // WEEK 2: Linked Lists, Stacks, Queues & Binary Search
  {
    day: 8,
    week: 2,
    category: 'Linked Lists',
    title: 'Singly Linked List Manipulation & Reversal',
    theory: 'Pointers, dummy nodes, reversing a linked list iteratively and recursively in O(N) time.',
    estimatedTime: '75 mins',
    tips: 'Using a dummy head node simplifies boundary edge cases when inserting or deleting head.',
    problems: [
      { id: 'p20', title: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/', difficulty: 'Easy' },
      { id: 'p21', title: 'Merge Two Sorted Lists', url: 'https://leetcode.com/problems/merge-two-sorted-lists/', difficulty: 'Easy' },
      { id: 'p22', title: 'Reorder List', url: 'https://leetcode.com/problems/reorder-list/', difficulty: 'Medium' },
    ],
  },
  {
    day: 9,
    week: 2,
    category: 'Linked Lists',
    title: "Fast & Slow Pointers (Floyd's Cycle Detection)",
    theory: 'Detect cycle in linked list, find cycle start node, find middle node using slow (1 step) and fast (2 steps) pointers.',
    estimatedTime: '60 mins',
    tips: 'If fast or fast.next becomes null, there is no cycle in the linked list.',
    problems: [
      { id: 'p23', title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/', difficulty: 'Easy' },
      { id: 'p24', title: 'Remove Nth Node From End of List', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', difficulty: 'Medium' },
      { id: 'p25', title: 'Find the Duplicate Number', url: 'https://leetcode.com/problems/find-the-duplicate-number/', difficulty: 'Medium' },
    ],
  },
  {
    day: 10,
    week: 2,
    category: 'Stack & Queue',
    title: 'Valid Parentheses & Min Stack',
    theory: 'LIFO evaluation of expression strings, matching brackets using stack, and designing O(1) Min Stack.',
    estimatedTime: '60 mins',
    tips: 'Push corresponding closing bracket onto stack when encountering an opening bracket.',
    problems: [
      { id: 'p26', title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'Easy' },
      { id: 'p27', title: 'Min Stack', url: 'https://leetcode.com/problems/min-stack/', difficulty: 'Medium' },
      { id: 'p28', title: 'Evaluate Reverse Polish Notation', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', difficulty: 'Medium' },
    ],
  },
  {
    day: 11,
    week: 2,
    category: 'Stack',
    title: 'Monotonic Stack Patterns',
    theory: 'Maintain stack in strictly increasing or decreasing order to solve Next Greater Element in O(N).',
    estimatedTime: '90 mins',
    tips: 'Pop elements from stack while top element is smaller than current element to find next greater element.',
    problems: [
      { id: 'p29', title: 'Daily Temperatures', url: 'https://leetcode.com/problems/daily-temperatures/', difficulty: 'Medium' },
      { id: 'p30', title: 'Online Stock Span', url: 'https://leetcode.com/problems/online-stock-span/', difficulty: 'Medium' },
      { id: 'p31', title: 'Largest Rectangle in Histogram', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', difficulty: 'Hard' },
    ],
  },
  {
    day: 12,
    week: 2,
    category: 'Binary Search',
    title: 'Binary Search Fundamentals & Boundaries',
    theory: 'Divide & conquer searching in O(log N). Mid calculation avoid overflow `mid = low + (high - low) / 2`.',
    estimatedTime: '60 mins',
    tips: 'Pay attention to loop condition `low <= high` vs `low < high` based on search boundary.',
    problems: [
      { id: 'p32', title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/', difficulty: 'Easy' },
      { id: 'p33', title: 'Search a 2D Matrix', url: 'https://leetcode.com/problems/search-a-2d-matrix/', difficulty: 'Medium' },
      { id: 'p34', title: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', difficulty: 'Medium' },
    ],
  },
  {
    day: 13,
    week: 2,
    category: 'Binary Search',
    title: 'Binary Search on Search Space (Answer Space)',
    theory: 'Apply binary search when searching for a minimum/maximum valid answer in a range [min_possible, max_possible].',
    estimatedTime: '90 mins',
    tips: 'Define a helper function `isPossible(mid)` that checks if value mid satisfies problem criteria.',
    problems: [
      { id: 'p35', title: 'Koko Eating Bananas', url: 'https://leetcode.com/problems/koko-eating-bananas/', difficulty: 'Medium' },
      { id: 'p36', title: 'Find Minimum in Rotated Sorted Array', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', difficulty: 'Medium' },
      { id: 'p37', title: 'Capacity To Ship Packages Within D Days', url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', difficulty: 'Medium' },
    ],
  },
  {
    day: 14,
    week: 2,
    category: 'Sorting Algorithms',
    title: 'Merge Sort, Quick Sort & Custom Comparators',
    theory: 'Understand O(N log N) divide-and-conquer sorting, pivot partitioning in QuickSort, and custom comparator functions.',
    estimatedTime: '75 mins',
    tips: 'Merge Sort is stable and guaranteed O(N log N), while QuickSort is in-place but worst case O(N^2).',
    problems: [
      { id: 'p38', title: 'Sort an Array (Merge Sort)', url: 'https://leetcode.com/problems/sort-an-array/', difficulty: 'Medium' },
      { id: 'p39', title: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/', difficulty: 'Medium' },
      { id: 'p40', title: 'Non-overlapping Intervals', url: 'https://leetcode.com/problems/non-overlapping-intervals/', difficulty: 'Medium' },
    ],
  },

  // WEEK 3: Trees, Backtracking, Heaps & Greedy Algorithms
  {
    day: 15,
    week: 3,
    category: 'Recursion & Backtracking',
    title: 'Subsets & Combinations Generation',
    theory: 'Recursion tree, base cases, state choice-choose-explore-unchoose pattern for subsets and combinations.',
    estimatedTime: '75 mins',
    tips: 'Always remember to pass copy of current list when adding to global result list.',
    problems: [
      { id: 'p41', title: 'Subsets', url: 'https://leetcode.com/problems/subsets/', difficulty: 'Medium' },
      { id: 'p42', title: 'Combination Sum', url: 'https://leetcode.com/problems/combination-sum/', difficulty: 'Medium' },
      { id: 'p43', title: 'Permutations', url: 'https://leetcode.com/problems/permutations/', difficulty: 'Medium' },
    ],
  },
  {
    day: 16,
    week: 3,
    category: 'Recursion & Backtracking',
    title: 'Advanced Backtracking (N-Queens & Sudoku)',
    theory: 'Pruning invalid recursion branches early using constraint checks to reduce search space drastically.',
    estimatedTime: '90 mins',
    tips: 'Use sets or boolean arrays to track occupied columns and diagonals in O(1).',
    problems: [
      { id: 'p44', title: 'Word Search', url: 'https://leetcode.com/problems/word-search/', difficulty: 'Medium' },
      { id: 'p45', title: 'N-Queens', url: 'https://leetcode.com/problems/n-queens/', difficulty: 'Hard' },
    ],
  },
  {
    day: 17,
    week: 3,
    category: 'Binary Trees',
    title: 'Binary Tree Traversals (DFS: Inorder, Preorder, Postorder)',
    theory: 'Recursive and iterative tree traversals. Understanding depth of tree, tree diameter, and balanced tree check.',
    estimatedTime: '75 mins',
    tips: 'Inorder traversal of Binary Search Tree (BST) always yields elements in strictly sorted order.',
    problems: [
      { id: 'p46', title: 'Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/', difficulty: 'Easy' },
      { id: 'p47', title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'Easy' },
      { id: 'p48', title: 'Diameter of Binary Tree', url: 'https://leetcode.com/problems/diameter-of-binary-tree/', difficulty: 'Easy' },
    ],
  },
  {
    day: 18,
    week: 3,
    category: 'Binary Trees',
    title: 'Level Order Traversal (BFS) & Lowest Common Ancestor',
    theory: 'Queue-based Breadth-First Search on trees level by level. Lowest Common Ancestor (LCA) in BT and BST.',
    estimatedTime: '75 mins',
    tips: 'For level order traversal, record `levelSize = queue.length` before processing each level.',
    problems: [
      { id: 'p49', title: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', difficulty: 'Medium' },
      { id: 'p50', title: 'Lowest Common Ancestor of a Binary Search Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', difficulty: 'Medium' },
      { id: 'p51', title: 'Binary Tree Right Side View', url: 'https://leetcode.com/problems/binary-tree-right-side-view/', difficulty: 'Medium' },
    ],
  },
  {
    day: 19,
    week: 3,
    category: 'Binary Search Trees',
    title: 'BST Validation, Insertion, Deletion & Kth Smallest',
    theory: 'BST invariant: Left child < Node < Right child. Validating BST using range boundaries (min, max).',
    estimatedTime: '75 mins',
    tips: 'Pass `-Infinity` and `+Infinity` as initial range boundaries for BST validation.',
    problems: [
      { id: 'p52', title: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree/', difficulty: 'Medium' },
      { id: 'p53', title: 'Kth Smallest Element in a BST', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', difficulty: 'Medium' },
    ],
  },
  {
    day: 20,
    week: 3,
    category: 'Heaps & Priority Queue',
    title: 'Min Heap, Max Heap & Top K Elements',
    theory: 'Complete binary tree represented in array. Heapify O(N), insertion/deletion O(log N). Top K elements using Heap.',
    estimatedTime: '80 mins',
    tips: 'To find K largest elements, maintain a Min-Heap of size K.',
    problems: [
      { id: 'p54', title: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', difficulty: 'Medium' },
      { id: 'p55', title: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/', difficulty: 'Medium' },
      { id: 'p56', title: 'Find Median from Data Stream', url: 'https://leetcode.com/problems/find-median-from-data-stream/', difficulty: 'Hard' },
    ],
  },
  {
    day: 21,
    week: 3,
    category: 'Greedy Algorithms',
    title: 'Greedy Choice Property & Interval Scheduling',
    theory: 'Making locally optimal choice at each step to arrive at global optimum. Jump Game & Gas Station.',
    estimatedTime: '75 mins',
    tips: 'Greedy algorithms usually require sorting by end time or greedy max reach maintenance.',
    problems: [
      { id: 'p57', title: 'Jump Game', url: 'https://leetcode.com/problems/jump-game/', difficulty: 'Medium' },
      { id: 'p58', title: 'Jump Game II', url: 'https://leetcode.com/problems/jump-game-ii/', difficulty: 'Medium' },
      { id: 'p59', title: 'Gas Station', url: 'https://leetcode.com/problems/gas-station/', difficulty: 'Medium' },
    ],
  },

  // WEEK 4: Graphs, Dynamic Programming & Advanced Topics
  {
    day: 22,
    week: 4,
    category: 'Graphs',
    title: 'Graph Representation (Adjacency List/Matrix), BFS & DFS',
    theory: 'Representing directed/undirected graphs. Matrix grid traversal (Number of Islands) with visited matrix.',
    estimatedTime: '80 mins',
    tips: 'Mutating grid cell to `0` or `#` directly saves extra visited boolean array memory.',
    problems: [
      { id: 'p60', title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'Medium' },
      { id: 'p61', title: 'Max Area of Island', url: 'https://leetcode.com/problems/max-area-of-island/', difficulty: 'Medium' },
      { id: 'p62', title: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph/', difficulty: 'Medium' },
    ],
  },
  {
    day: 23,
    week: 4,
    category: 'Graphs',
    title: 'Cycle Detection & Topological Sort (Kahn Algorithm)',
    theory: 'Detecting cycles in directed graphs using indegree array and BFS queue (Kahn algorithm) for dependency resolution.',
    estimatedTime: '90 mins',
    tips: 'If count of processed nodes in topological sort is less than total nodes, graph contains a cycle.',
    problems: [
      { id: 'p63', title: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/', difficulty: 'Medium' },
      { id: 'p64', title: 'Course Schedule II', url: 'https://leetcode.com/problems/course-schedule-ii/', difficulty: 'Medium' },
      { id: 'p65', title: 'Rotting Oranges', url: 'https://leetcode.com/problems/rotting-oranges/', difficulty: 'Medium' },
    ],
  },
  {
    day: 24,
    week: 4,
    category: 'Graphs',
    title: "Shortest Path (Dijkstra's Algorithm) & Union Find (DSU)",
    theory: "Dijkstra algorithm using PriorityQueue for non-negative weighted graphs. Disjoint Set Union with Path Compression.",
    estimatedTime: '90 mins',
    tips: 'Path compression in DSU yields near O(1) amortized find operations `parent[x] = find(parent[x])`.',
    problems: [
      { id: 'p66', title: 'Network Delay Time (Dijkstra)', url: 'https://leetcode.com/problems/network-delay-time/', difficulty: 'Medium' },
      { id: 'p67', title: 'Redundant Connection (DSU)', url: 'https://leetcode.com/problems/redundant-connection/', difficulty: 'Medium' },
    ],
  },
  {
    day: 25,
    week: 4,
    category: 'Dynamic Programming',
    title: '1D DP - Memoization vs Bottom-Up Tabulation',
    theory: 'Identifying overlapping subproblems and optimal substructure. Climbing Stairs and House Robber patterns.',
    estimatedTime: '75 mins',
    tips: 'Start with top-down recursive solution with memoization map, then convert to 1D DP table.',
    problems: [
      { id: 'p68', title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'Easy' },
      { id: 'p69', title: 'House Robber', url: 'https://leetcode.com/problems/house-robber/', difficulty: 'Medium' },
      { id: 'p70', title: 'House Robber II', url: 'https://leetcode.com/problems/house-robber-ii/', difficulty: 'Medium' },
    ],
  },
  {
    day: 26,
    week: 4,
    category: 'Dynamic Programming',
    title: 'Unbounded Knapsack & Coin Change Pattern',
    theory: 'DP state transitions where elements can be reused infinitely. Coin Change minimum coins vs total ways.',
    estimatedTime: '90 mins',
    tips: 'Initialize DP table with Infinity when finding minimum required coins.',
    problems: [
      { id: 'p71', title: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/', difficulty: 'Medium' },
      { id: 'p72', title: 'Word Break', url: 'https://leetcode.com/problems/word-break/', difficulty: 'Medium' },
      { id: 'p73', title: 'Combination Sum IV', url: 'https://leetcode.com/problems/combination-sum-iv/', difficulty: 'Medium' },
    ],
  },
  {
    day: 27,
    week: 4,
    category: 'Dynamic Programming',
    title: '2D DP - Longest Common Subsequence & Edit Distance',
    theory: 'String matching DP grid `dp[i][j]`. If char matches: `dp[i-1][j-1] + 1`, else `max(dp[i-1][j], dp[i][j-1])`.',
    estimatedTime: '90 mins',
    tips: 'Draw the 2D grid matrix on paper before writing nested loops.',
    problems: [
      { id: 'p74', title: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/', difficulty: 'Medium' },
      { id: 'p75', title: 'Edit Distance', url: 'https://leetcode.com/problems/edit-distance/', difficulty: 'Hard' },
    ],
  },
  {
    day: 28,
    week: 4,
    category: 'Advanced Data Structures',
    title: 'Trie (Prefix Tree) Construction & Autocomplete',
    theory: 'Tree structure where nodes store characters of keys. Fast O(K) word insertion and prefix search.',
    estimatedTime: '75 mins',
    tips: 'Each TrieNode has an array `children[26]` or Hashmap and boolean `isEndOfWord`.',
    problems: [
      { id: 'p76', title: 'Implement Trie (Prefix Tree)', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/', difficulty: 'Medium' },
      { id: 'p77', title: 'Design Add and Search Words Data Structure', url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', difficulty: 'Medium' },
    ],
  },
  {
    day: 29,
    week: 4,
    category: 'Bit Manipulation',
    title: 'Bitwise Operators (AND, OR, XOR, Shifts)',
    theory: 'XOR property `x ^ x = 0` and `x ^ 0 = x`. Clearing lowest set bit `n & (n - 1)`. Bitmasking.',
    estimatedTime: '60 mins',
    tips: 'Use `1 << i` to check or set the i-th bit.',
    problems: [
      { id: 'p78', title: 'Single Number', url: 'https://leetcode.com/problems/single-number/', difficulty: 'Easy' },
      { id: 'p79', title: 'Number of 1 Bits', url: 'https://leetcode.com/problems/number-of-1-bits/', difficulty: 'Easy' },
      { id: 'p80', title: 'Counting Bits', url: 'https://leetcode.com/problems/counting-bits/', difficulty: 'Easy' },
    ],
  },
  {
    day: 30,
    week: 4,
    category: 'Master Assessment',
    title: '30-Day Master Revision & Mock Technical Interview',
    theory: 'Review all 30 days of data structures and algorithms. Solve 2 random Medium/Hard problems under timed 45-min conditions.',
    estimatedTime: '120 mins',
    tips: 'Always state your approach, time complexity, and space complexity before writing code in real interviews.',
    problems: [
      { id: 'p81', title: 'LRU Cache', url: 'https://leetcode.com/problems/lru-cache/', difficulty: 'Medium' },
      { id: 'p82', title: 'Serialize and Deserialize Binary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', difficulty: 'Hard' },
    ],
  },
];

export const DsaPlanner: React.FC = () => {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [dayNotes, setDayNotes] = useState<Record<number, string>>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'w1' | 'w2' | 'w3' | 'w4' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('akash_dsa_planner_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.completedDays) setCompletedDays(parsed.completedDays);
        if (parsed.solvedProblems) setSolvedProblems(parsed.solvedProblems);
        if (parsed.activeDay) setActiveDay(parsed.activeDay);
        if (parsed.dayNotes) setDayNotes(parsed.dayNotes);
        if (parsed.startDate) setStartDate(parsed.startDate);
      }
    } catch {
      // ignore
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Save state on updates
  useEffect(() => {
    const dataToSave = {
      completedDays,
      solvedProblems,
      activeDay,
      dayNotes,
      startDate,
    };
    localStorage.setItem('akash_dsa_planner_state', JSON.stringify(dataToSave));
  }, [completedDays, solvedProblems, activeDay, dayNotes, startDate]);

  const activeDayData = DSA_30_DAYS_CURRICULUM.find((d) => d.day === activeDay) || DSA_30_DAYS_CURRICULUM[0];

  const toggleDayCompletion = (dayNum: number) => {
    if (completedDays.includes(dayNum)) {
      setCompletedDays(completedDays.filter((d) => d !== dayNum));
    } else {
      setCompletedDays([...completedDays, dayNum]);
      // Advance to next day if completing current active day
      if (dayNum === activeDay && activeDay < 30) {
        setActiveDay(activeDay + 1);
      }
    }
  };

  const toggleProblemSolved = (probId: string) => {
    if (solvedProblems.includes(probId)) {
      setSolvedProblems(solvedProblems.filter((id) => id !== probId));
    } else {
      setSolvedProblems([...solvedProblems, probId]);
    }
  };

  const handleNoteChange = (dayNum: number, noteText: string) => {
    setDayNotes({ ...dayNotes, [dayNum]: noteText });
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      sendPushNotification(activeDayData);
    } else {
      setNotificationsEnabled(false);
      alert('Notification permission was denied.');
    }
  };

  const sendPushNotification = (dayData: DsaDayItem) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🎓 DSA Today (Day ${dayData.day}/30)`, {
        body: `Today's Topic: ${dayData.title}\nEstimated: ${dayData.estimatedTime}`,
        icon: '/favicon.ico',
      });
    }
  };

  const sendEmailNotification = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await apiClient.post('/notifications/test-email', {
        recipient_email: '',
      });
      if (res.data?.success) {
        setEmailStatus(`✨ Sent Today's DSA Plan (Day ${activeDay}) to your email!`);
      } else {
        setEmailStatus(`Note: ${res.data?.message || 'Email sent or saved in logs'}`);
      }
    } catch {
      setEmailStatus('Reminder alert generated! Check browser notifications.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Calculations
  const progressPercent = Math.round((completedDays.length / 30) * 100);
  const totalProblemsCount = DSA_30_DAYS_CURRICULUM.reduce((acc, curr) => acc + curr.problems.length, 0);
  const solvedProblemsCount = solvedProblems.length;

  const filteredCurriculum = DSA_30_DAYS_CURRICULUM.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.theory.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'w1') return item.week === 1;
    if (activeTab === 'w2') return item.week === 2;
    if (activeTab === 'w3') return item.week === 3;
    if (activeTab === 'w4') return item.week === 4;
    if (activeTab === 'completed') return completedDays.includes(item.day);
    return true;
  });

  return (
    <div className="space-y-6 pt-4 text-[#1c1917]">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#ff7a00] via-[#ff9500] to-[#e66000] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
          <Code2 className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>30-Day Masterclass Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              DSA 30-Day Mastery Plan
            </h1>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl">
              Day-by-day structured algorithm curriculum. Master Arrays, Trees, Dynamic Programming & Graphs with curated LeetCode problems and daily notifications.
            </p>
          </div>

          {/* Quick Notification & Progress Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center min-w-[210px]">
            <div className="text-3xl font-black text-white">{progressPercent}%</div>
            <div className="text-xs text-white/80 font-medium mt-0.5">
              {completedDays.length} of 30 Days ({solvedProblemsCount}/{totalProblemsCount} Problems)
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-yellow-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S FOCUSED LEARNING CARD */}
      <div className="bg-white rounded-2xl border-2 border-[#ff7a00]/30 shadow-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#f0e8dc] pb-4 mb-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff7a00] to-[#ff9500] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
              D{activeDayData.day}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-[#fff3e5] text-[#ff7a00] rounded-md">
                  {activeDayData.category}
                </span>
                <span className="text-xs font-semibold text-[#78716c] flex items-center">
                  <Clock className="w-3 h-3 inline mr-1 text-[#ff7a00]" />
                  {activeDayData.estimatedTime}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-[#1c1917] mt-0.5">
                Today's Goal: {activeDayData.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Notification Button */}
            <button
              onClick={
                notificationsEnabled
                  ? () => sendPushNotification(activeDayData)
                  : requestNotificationPermission
              }
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                notificationsEnabled
                  ? 'bg-amber-50 text-[#ff7a00] border-[#ff7a00]/40 hover:bg-amber-100'
                  : 'bg-[#faf7f2] text-[#78716c] border-[#e7dfd4] hover:border-[#ff7a00]'
              }`}
              title="Notify Today's Lesson"
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4 text-[#ff7a00] fill-[#ff7a00]/20" />
              ) : (
                <BellOff className="w-4 h-4 text-[#a8a29e]" />
              )}
              <span>{notificationsEnabled ? 'Notify Lesson' : 'Enable Alert'}</span>
            </button>

            {/* Email Digest Trigger */}
            <button
              onClick={sendEmailNotification}
              disabled={isSendingEmail}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#ff7a00]/10 text-[#ff7a00] hover:bg-[#ff7a00]/20 border border-[#ff7a00]/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingEmail ? 'Sending...' : 'Email Daily Plan'}</span>
            </button>

            {/* Complete Day Button */}
            <button
              onClick={() => toggleDayCompletion(activeDayData.day)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all ${
                completedDays.includes(activeDayData.day)
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gradient-to-r from-[#ff7a00] to-[#ff9500] text-white hover:opacity-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {completedDays.includes(activeDayData.day)
                  ? 'Completed ✓'
                  : 'Mark Today Complete'}
              </span>
            </button>
          </div>
        </div>

        {emailStatus && (
          <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailStatus}</span>
          </div>
        )}

        {/* Theory & Concept Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-[#faf7f2] border border-[#f0e8dc] rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#ff7a00] flex items-center space-x-1">
                <BookOpen className="w-4 h-4 mr-1" />
                Key Concept & Theory Breakdown
              </h3>
              <p className="text-xs text-[#44403c] leading-relaxed font-medium">
                {activeDayData.theory}
              </p>
            </div>

            {/* Pro Tip Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5">
              <Zap className="w-4 h-4 text-[#ff7a00] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-[#ff7a00] uppercase tracking-wider block">
                  Interview Pro-Tip
                </span>
                <span className="text-xs text-[#78350f] font-medium">
                  {activeDayData.tips}
                </span>
              </div>
            </div>

            {/* Recommended Problems */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1c1917]">
                Today's Practice Problems ({activeDayData.problems.length})
              </h3>
              <div className="space-y-2">
                {activeDayData.problems.map((prob) => {
                  const isSolved = solvedProblems.includes(prob.id);
                  return (
                    <div
                      key={prob.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isSolved
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-white border-[#f0e8dc] hover:border-[#ff7a00]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <button
                          onClick={() => toggleProblemSolved(prob.id)}
                          className="text-[#a8a29e] hover:text-[#ff7a00] transition-colors"
                        >
                          {isSolved ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <span
                          className={`text-xs font-bold truncate ${
                            isSolved ? 'line-through text-[#78716c]' : 'text-[#1c1917]'
                          }`}
                        >
                          {prob.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            prob.difficulty === 'Easy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-[#ff7a00] hover:bg-[#fff3e5] transition-colors"
                          title="Open LeetCode Problem"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily Notes Scratchpad */}
          <div className="space-y-2 bg-[#faf7f2] border border-[#f0e8dc] rounded-xl p-4 flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1c1917] flex items-center">
              <Code2 className="w-4 h-4 mr-1 text-[#ff7a00]" />
              Day {activeDay} Scratchpad & Notes
            </h3>
            <textarea
              value={dayNotes[activeDay] || ''}
              onChange={(e) => handleNoteChange(activeDay, e.target.value)}
              placeholder="Type key code patterns, space/time complexities, or code snippets for today..."
              className="flex-1 w-full min-h-[160px] p-3 text-xs bg-white border border-[#e7dfd4] rounded-lg focus:outline-none focus:border-[#ff7a00] text-[#1c1917] font-mono resize-none"
            />
            <div className="text-[10px] text-[#a8a29e] text-right font-medium">
              Auto-saved locally
            </div>
          </div>
        </div>
      </div>

      {/* CURRICULUM NAVIGATION & DAY SELECTOR */}
      <div className="space-y-4">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-[#f0e8dc] rounded-xl shadow-xs">
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#ff7a00] text-white shadow-xs'
                  : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f2ebe1]'
              }`}
            >
              All 30 Days
            </button>
            <button
              onClick={() => setActiveTab('w1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'w1'
                  ? 'bg-[#ff7a00] text-white shadow-xs'
                  : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f2ebe1]'
              }`}
            >
              Week 1
            </button>
            <button
              onClick={() => setActiveTab('w2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'w2'
                  ? 'bg-[#ff7a00] text-white shadow-xs'
                  : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f2ebe1]'
              }`}
            >
              Week 2
            </button>
            <button
              onClick={() => setActiveTab('w3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'w3'
                  ? 'bg-[#ff7a00] text-white shadow-xs'
                  : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f2ebe1]'
              }`}
            >
              Week 3
            </button>
            <button
              onClick={() => setActiveTab('w4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'w4'
                  ? 'bg-[#ff7a00] text-white shadow-xs'
                  : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f2ebe1]'
              }`}
            >
              Week 4
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f2ebe1]'
              }`}
            >
              Completed ({completedDays.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#a8a29e]" />
            <input
              type="text"
              placeholder="Search topics or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#faf7f2] border border-[#f0e8dc] rounded-lg outline-none focus:border-[#ff7a00]"
            />
          </div>
        </div>

        {/* 30 Days Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCurriculum.map((item) => {
            const isDone = completedDays.includes(item.day);
            const isActive = item.day === activeDay;

            return (
              <div
                key={item.day}
                onClick={() => setActiveDay(item.day)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#fff3e5] border-[#ff7a00] shadow-md ring-2 ring-[#ff7a00]/30'
                    : isDone
                    ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                    : 'bg-white border-[#f0e8dc] hover:border-[#ff7a00]/40 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isActive
                          ? 'bg-[#ff7a00] text-white'
                          : 'bg-[#f0e8dc] text-[#78716c]'
                      }`}
                    >
                      {item.day}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold text-[#78716c]">
                      Week {item.week} • {item.category}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDayCompletion(item.day);
                    }}
                    className="text-[#a8a29e] hover:text-[#ff7a00]"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <h4 className="text-xs font-extrabold text-[#1c1917] mt-2 line-clamp-1">
                  {item.title}
                </h4>

                <p className="text-[11px] text-[#78716c] line-clamp-2 mt-1">
                  {item.theory}
                </p>

                <div className="mt-3 pt-2 border-t border-[#f0e8dc] flex items-center justify-between text-[10px] text-[#78716c]">
                  <span>{item.problems.length} Problems</span>
                  <span className="font-semibold text-[#ff7a00] flex items-center">
                    View Lesson <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
