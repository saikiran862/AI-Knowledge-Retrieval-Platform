/**
 * Student Authentication & User Profile Management
 * Supports registration, login, profile switching across educational tiers (10th, Inter, B.Tech, BBA),
 * and query bookmarks / history.
 */

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // simulated simple secure hash for local state
  tier: "btech" | "bba" | "intermediate" | "class10";
  tierLabel: string;
  stream: string;
  institution: string;
  avatarColor: string;
  createdAt: string;
  bookmarks: Array<{
    id: string;
    query: string;
    answerExcerpt: string;
    tier: string;
    savedAt: string;
  }>;
  stats: {
    questionsAsked: number;
    quizzesCompleted: number;
    studyStreakDays: number;
  };
}

// In-memory persistent student database with demo accounts
const users: Map<string, StudentUser> = new Map();

function initDemoUsers() {
  const demoAccounts: StudentUser[] = [
    {
      id: "usr_btech_1",
      name: "Arjun Verma",
      email: "btech.student@omni.edu",
      passwordHash: "pass123",
      tier: "btech",
      tierLabel: "B.Tech (Computer Science)",
      stream: "Computer Science & Engineering",
      institution: "National Institute of Technology",
      avatarColor: "bg-blue-600",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      bookmarks: [
        {
          id: "bm_1",
          query: "Explain Dijkstra's shortest path algorithm with time complexity",
          answerExcerpt: "Dijkstra's greedy algorithm solves SSSP in O((V + E) log V) using a min-heap...",
          tier: "btech",
          savedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ],
      stats: { questionsAsked: 42, quizzesCompleted: 8, studyStreakDays: 5 },
    },
    {
      id: "usr_bba_1",
      name: "Ananya Sharma",
      email: "bba.student@omni.edu",
      passwordHash: "pass123",
      tier: "bba",
      tierLabel: "BBA (Management & Marketing)",
      stream: "Bachelor of Business Administration",
      institution: "Apex School of Business Management",
      avatarColor: "bg-emerald-600",
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      bookmarks: [
        {
          id: "bm_2",
          query: "Explain Henri Fayol's 14 Principles of Management",
          answerExcerpt: "Henri Fayol formulated the 14 universal principles of administrative management...",
          tier: "bba",
          savedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
      ],
      stats: { questionsAsked: 28, quizzesCompleted: 6, studyStreakDays: 3 },
    },
    {
      id: "usr_inter_1",
      name: "Rohan Patel",
      email: "inter.student@omni.edu",
      passwordHash: "pass123",
      tier: "intermediate",
      tierLabel: "Intermediate (Class 12 MPC)",
      stream: "Mathematics, Physics, Chemistry (MPC)",
      institution: "Chaitanya Junior College",
      avatarColor: "bg-violet-600",
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      bookmarks: [
        {
          id: "bm_3",
          query: "Derive efficiency of Carnot heat engine",
          answerExcerpt: "Thermal efficiency eta = 1 - T2/T1 = (T1 - T2)/T1 for an ideal reversible cycle...",
          tier: "intermediate",
          savedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
      ],
      stats: { questionsAsked: 35, quizzesCompleted: 12, studyStreakDays: 7 },
    },
    {
      id: "usr_class10_1",
      name: "Pooja Reddy",
      email: "class10.student@omni.edu",
      passwordHash: "pass123",
      tier: "class10",
      tierLabel: "10th Class (Secondary CBSE)",
      stream: "Secondary Science & Mathematics",
      institution: "Delhi Public School",
      avatarColor: "bg-amber-600",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      bookmarks: [
        {
          id: "bm_4",
          query: "State Ohm's Law and calculate equivalent resistance in parallel",
          answerExcerpt: "V = I * R. In parallel, 1/Rp = 1/R1 + 1/R2 + 1/R3...",
          tier: "class10",
          savedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
      ],
      stats: { questionsAsked: 19, quizzesCompleted: 5, studyStreakDays: 4 },
    },
  ];

  for (const acc of demoAccounts) {
    users.set(acc.email.toLowerCase(), acc);
    users.set(acc.id, acc);
  }
}

initDemoUsers();

const colors = ["bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-rose-600", "bg-indigo-600"];

export function registerStudent(data: {
  name: string;
  email: string;
  password: string;
  tier: "btech" | "bba" | "intermediate" | "class10";
  stream?: string;
  institution?: string;
}): { success: boolean; user?: StudentUser; message?: string } {
  const email = data.email.trim().toLowerCase();
  if (users.has(email)) {
    return { success: false, message: "An account with this email address already exists. Please log in." };
  }

  const tierLabels: Record<string, string> = {
    btech: "B.Tech (Engineering)",
    bba: "BBA (Business Administration)",
    intermediate: "Intermediate (Class 11 & 12)",
    class10: "10th Class (Secondary Education)",
  };

  const id = `usr_${Date.now().toString(36)}`;
  const newUser: StudentUser = {
    id,
    name: data.name.trim(),
    email,
    passwordHash: data.password,
    tier: data.tier || "btech",
    tierLabel: tierLabels[data.tier] || "Academic Student",
    stream: data.stream || "General",
    institution: data.institution || "Educational Institution",
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
    createdAt: new Date().toISOString(),
    bookmarks: [],
    stats: {
      questionsAsked: 0,
      quizzesCompleted: 0,
      studyStreakDays: 1,
    },
  };

  users.set(email, newUser);
  users.set(id, newUser);

  return { success: true, user: newUser };
}

export function loginStudent(email: string, password: string): { success: boolean; user?: StudentUser; message?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.get(normalizedEmail);

  if (!user) {
    return { success: false, message: "No registered account found with this email. Please register." };
  }

  if (user.passwordHash !== password) {
    return { success: false, message: "Invalid password. Please check your credentials." };
  }

  return { success: true, user };
}

export function getStudentById(id: string): StudentUser | null {
  return users.get(id) || null;
}

export function updateStudentProfile(id: string, updates: Partial<StudentUser>): StudentUser | null {
  const user = users.get(id);
  if (!user) return null;

  Object.assign(user, updates);
  users.set(user.email.toLowerCase(), user);
  users.set(user.id, user);
  return user;
}

export function addStudentBookmark(id: string, bookmark: { query: string; answerExcerpt: string; tier: string }): StudentUser | null {
  const user = users.get(id);
  if (!user) return null;

  const bm = {
    id: `bm_${Date.now().toString(36)}`,
    ...bookmark,
    savedAt: new Date().toISOString(),
  };

  user.bookmarks.unshift(bm);
  return user;
}

export function incrementUserQuestions(id: string) {
  const user = users.get(id);
  if (user) {
    user.stats.questionsAsked += 1;
  }
}
