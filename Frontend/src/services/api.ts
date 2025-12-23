
export interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  default_branch: string;
  owner: {
    login: string;
    avatarUrl?: string;
  };
}

export interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  } | null;
  url: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('whatidid_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    let details: unknown;

    try {
      const errorBody = await response.json();
      details = errorBody;
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {

    }

    // Se não autorizado, redireciona para login
    if (response.status === 401) {
      localStorage.removeItem('whatidid_token');
      localStorage.removeItem('whatidid_user');
      window.location.href = '/login';
    }

    throw new ApiError(errorMessage, response.status, details);
  }

  return response.json();
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  return handleResponse<T>(response);
}

export interface ReportMeta {
  date_context: string;
  primary_language: string;
  effort_level: string;
}

export interface ReportSummary {
  title: string;
  executive_overview: string;
  technical_highlights: string[];
}

export interface ReportGroupItem {
  description: string;
  impact: string;
  original_commits_count: number;
}

export interface ReportGroup {
  category: string;
  icon: string;
  items: ReportGroupItem[];
}

export interface Report {
  meta: ReportMeta;
  summary: ReportSummary;
  groups: ReportGroup[];
}

export interface SavedReport {
  id: string;
  repositoryName: string;
  generatedAt: string;
  summary: string;
  isFavorite?: boolean;
}

export interface SavedReportDetail {
  id: string;
  repositoryName: string;
  generatedAt: string;
  content: Report;
}

export const api = {
  getRepositories: (): Promise<Repository[]> => {
    return fetchApi<Repository[]>('/github/repositories');
  },

  getBranches: (owner: string, repo: string): Promise<string[]> => {
    return fetchApi<string[]>(`/github/${owner}/${repo}/branches`);
  },

  getCommits: (
    owner: string,
    repo: string,
    branch: string,
    page = 1,
  ): Promise<Commit[]> => {
    const params = new URLSearchParams({ owner, repo, branch, page: String(page) });
    return fetchApi<Commit[]>(`/github/commits?${params}`);
  },

  generateReport: (commits: Commit[]): Promise<Report> => {
    return fetchApi<Report>('/github/report', {
      method: 'POST',
      body: JSON.stringify({ commits }),
    });
  },

  getReports: (): Promise<{ data: SavedReport[]; total: number }> => {
    return fetchApi<{ data: SavedReport[]; total: number }>('/reports');
  },

  getReportById: (id: string): Promise<SavedReportDetail> => {
    return fetchApi<SavedReportDetail>(`/reports/${id}`);
  },

  deleteReport: (id: string): Promise<void> => {
    return fetchApi<void>(`/reports/${id}`, { method: 'DELETE' });
  },
};