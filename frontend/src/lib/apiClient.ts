import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User is not authenticated');
  }
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Ignore JSON parse error if response is not JSON
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Typed API Endpoints
// ---------------------------------------------------------------------------

export interface Recommendation {
  id: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  body: string;
  icon: string;
  actionLabel: string | null;
  actionRoute: string | null;
  generatedAt: string;
}

export interface MemoryPattern {
  id: string;
  observation: string;
  actionableRule: string;
  generatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string | null;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  lastCompletedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueAt: string | null;
  estimatedMinutes: number | null;
  actualMinutes?: number;
  source: string;
  sourceRef?: string;
  status: 'pending' | 'in_progress' | 'done';
  riskLevel: 'on_track' | 'at_risk' | 'critical';
  steps?: { id: string; title: string; done?: boolean; scheduledAt?: string }[];
  goalId?: string;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return fetchApi<T>(`/api/v1${endpoint}`, options);
  }

  // Tasks
  async createTask(data: { title: string; description?: string; dueAt?: string; estimatedMinutes?: number }) {
    return this.request<{ success: boolean; taskId: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async completeTask(taskId: string) {
    return this.request<{ success: boolean }>(`/tasks/${taskId}/complete`, { method: 'POST' });
  }
  async updateTask(taskId: string, updates: Partial<Task>) {
    return this.request<{ success: boolean }>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // Auth
  getGoogleAuthUrl = () => fetchApi<{ authUrl: string }>('/api/v1/auth/google/login');
  disconnectGoogle = () =>
    fetchApi<{ success: boolean }>('/api/v1/auth/google/disconnect', { method: 'POST' });
  syncGmail = () =>
    fetchApi<{ success: boolean; processed: number }>('/api/v1/ingest/gmail/sync', {
      method: 'POST',
    });
  getSlackAuthUrl = () => fetchApi<{ authUrl: string }>('/api/v1/auth/slack/login');
  disconnectSlack = () =>
    fetchApi<{ success: boolean }>('/api/v1/auth/slack/disconnect', { method: 'POST' });

  // Settings
  async updateSettings(updates: any) {
    return this.request<{ success: boolean; settings: any }>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // Agents
  async planTask(taskId: string) {
    return this.request<{ success: boolean }>(`/agents/plan/${taskId}`, { method: 'POST' });
  }
  async scheduleTask(taskId: string) {
    return this.request<{ success: boolean }>(`/agents/schedule`, { 
      method: 'POST',
      body: JSON.stringify({ taskId })
    });
  }
  async lastMinuteTask(taskId: string) {
    return this.request<{ success: boolean }>(`/agents/last-minute/${taskId}`, { method: 'POST' });
  }
  
  // Approvals
  async approveAction(approvalId: string) {
    return this.request<{ success: boolean }>(`/approvals/${approvalId}/approve`, { method: 'POST' });
  }
  async rejectAction(approvalId: string) {
    return this.request<{ success: boolean }>(`/approvals/${approvalId}/reject`, { method: 'POST' });
  }

  // Activity Feed
  async undoActivity(activityId: string) {
    return this.request<{ success: boolean }>(`/activity-feed/${activityId}/undo`, { method: 'POST' });
  }

  // Chat
  async sendChatMessage(message: string) {
    return this.request<{ reply: string; citedTaskIds: string[] }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  // Recommendations & Memory
  async getRecommendations() {
    return this.request<{ recommendations: Recommendation[]; memoryPatterns: MemoryPattern[]; generatedAt: string | null; nextRefreshAvailable: string }>('/recommendations');
  }
  async refreshRecommendations() {
    return this.request<{ success: boolean; recommendations: Recommendation[]; memoryPatterns: MemoryPattern[] }>('/recommendations/refresh', { method: 'POST' });
  }
  async createRecommendation() {
    return this.request<{ success: boolean; recommendationId: string }>('/recommendations', { method: 'POST' });
  }

  // Goals
  async getGoals() {
    return this.request<{ success: boolean; goals: Goal[] }>('/goals');
  }
  async createGoal(data: { title: string; description?: string; targetDate?: string }) {
    return this.request<{ success: boolean; goalId: string }>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateGoal(goalId: string, data: Partial<Goal>) {
    return this.request<{ success: boolean }>(`/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  async completeGoal(goalId: string) {
    return this.request<{ success: boolean; goalId: string; status: string }>(`/goals/${goalId}/complete`, {
      method: 'POST',
    });
  }
  async deleteGoal(goalId: string) {
    return this.request<{ success: boolean }>(`/goals/${goalId}`, { method: 'DELETE' });
  }

  // Habits
  async getHabits() {
    return this.request<{ success: boolean; habits: Habit[] }>('/habits');
  }
  async createHabit(data: { title: string; frequency?: 'daily' | 'weekly' }) {
    return this.request<{ success: boolean; habitId: string }>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async completeHabit(habitId: string) {
    return this.request<{ success: boolean; habitId: string; newStreak: number }>(`/habits/${habitId}/complete`, {
      method: 'POST',
    });
  }
  async deleteHabit(habitId: string) {
    return this.request<{ success: boolean }>(`/habits/${habitId}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
