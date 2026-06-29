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

export const api = {
  // Tasks
  createTask: (data: { title: string; description?: string; dueAt?: string; estimatedMinutes?: number }) => 
    fetchApi<{ success: boolean; taskId: string }>('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  completeTask: (taskId: string) => fetchApi<{ success: boolean }>(`/api/v1/tasks/${taskId}/complete`, { method: 'POST' }),

  // Auth
  startGoogleOAuth: () => fetchApi<{ authUrl: string }>('/api/v1/auth/login'),

  // Settings
  updateSettings: (updates: any) => fetchApi<{ success: boolean; settings: any }>('/api/v1/settings', {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),

  // Agents
  planTask: (taskId: string) => fetchApi<{ success: boolean }>(`/api/v1/agents/plan/${taskId}`, { method: 'POST' }),
  scheduleTask: (taskId: string) => fetchApi<{ success: boolean }>(`/api/v1/agents/schedule`, { 
    method: 'POST',
    body: JSON.stringify({ taskId })
  }),
  lastMinuteTask: (taskId: string) => fetchApi<{ success: boolean }>(`/api/v1/agents/last-minute/${taskId}`, { method: 'POST' }),
  
  // Approvals
  approveAction: (approvalId: string) => fetchApi<{ success: boolean }>(`/api/v1/approvals/${approvalId}/approve`, { method: 'POST' }),
  rejectAction: (approvalId: string) => fetchApi<{ success: boolean }>(`/api/v1/approvals/${approvalId}/reject`, { method: 'POST' }),

  // Activity Feed
  undoActivity: (activityId: string) => fetchApi<{ success: boolean }>(`/api/v1/activity-feed/${activityId}/undo`, { method: 'POST' }),

  // Chat
  sendChatMessage: (message: string) => fetchApi<{ reply: string; citedTaskIds: string[] }>('/api/v1/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  }),

  // Recommendations
  getRecommendations: () => 
    fetchApi<{ recommendations: Recommendation[]; generatedAt: string | null; nextRefreshAvailable: string }>('/api/v1/recommendations'),
  refreshRecommendations: () =>
    fetchApi<{ recommendations: Recommendation[] }>('/api/v1/recommendations/refresh', { method: 'POST' }),
};
