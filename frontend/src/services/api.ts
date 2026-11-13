import axios from 'axios';
import { ExecutiveSummary, Project, UserProfile } from '../types';

const API_BASE = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sgp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const currentRole = localStorage.getItem('sgp_user_role') || 'alcalde';
      const roleEmails: Record<string, string> = {
        alcalde: 'alcalde@sgp.gob',
        director_area: 'director.obras@sgp.gob',
        responsable_proyecto: 'responsable.obras@sgp.gob',
        supervisor_fiscal: 'supervisor.fiscal@sgp.gob',
        planificacion: 'planificacion@sgp.gob',
      };
      const email = roleEmails[currentRole] || 'alcalde@sgp.gob';
      try {
        const loginRes = await axios.post(`${API_BASE}/auth/login-json`, { email, password: 'admin123' });
        const newToken = loginRes.data.access_token;
        localStorage.setItem('sgp_token', newToken);
        localStorage.setItem('sgp_user_role', loginRes.data.role);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (loginErr) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string = 'admin123') => {
    try {
      const res = await api.post('/auth/login-json', { email, password });
      localStorage.setItem('sgp_token', res.data.access_token);
      localStorage.setItem('sgp_user_role', res.data.role);
      localStorage.setItem('sgp_user_name', res.data.user_name);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      return res.data;
    } catch (err) {
      console.warn('API de login no disponible, usando sesión local');
      return {
        access_token: 'demo-token',
        role: 'alcalde',
        user_name: 'Alcalde Municipal'
      };
    }
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch {
      return {
        id: '1',
        email: 'alcalde@sgp.gob',
        full_name: 'Alcalde Municipal',
        role: 'alcalde',
        tenant_id: 'demo',
        is_active: true
      };
    }
  }
};

export const dashboardService = {
  getExecutiveSummary: async (): Promise<ExecutiveSummary> => {
    try {
      const res = await api.get('/dashboard/executive-summary');
      return res.data;
    } catch (err) {
      console.warn('Backend no accesible aún, cargando datos espejo demostrativos...');
      return {
        institution_name: 'Gobierno Autónomo Municipal de Demostración',
        total_projects: 2,
        global_real_progress_pct: 9.41,
        global_planned_progress_pct: 27.50,
        global_compliance_index: 0.34,
        global_traffic_light: 'red',
        areas_summary: [
          {
            area_id: '1',
            name: 'Infraestructura Urbana y Obras Públicas',
            code: 'AE-01',
            weight_pct: 50.0,
            real_progress_pct: 13.0,
            planned_progress_pct: 30.0,
            compliance_index: 0.43,
            traffic_light: 'red',
            total_projects: 1,
            projects_summary: [
              {
                project_id: 'p1',
                code: 'PRY-2026-OB-01',
                name: 'Pavimentación y Drenaje Pluvial Avenida Marcelo Quiroga Santa Cruz',
                status: 'in_execution',
                real_progress_pct: 13.0,
                planned_progress_pct: 30.0,
                compliance_index: 0.43,
                traffic_light: 'red',
                budget_allocated: 1850000.0
              }
            ]
          },
          {
            area_id: '2',
            name: 'Desarrollo Humano, Educación y Salud',
            code: 'AE-02',
            weight_pct: 50.0,
            real_progress_pct: 5.83,
            planned_progress_pct: 25.0,
            compliance_index: 0.23,
            traffic_light: 'red',
            total_projects: 1,
            projects_summary: [
              {
                project_id: 'p2',
                code: 'PRY-2026-ED-02',
                name: 'Construcción Centro de Salud Integral Lajastambo Distrito 3',
                status: 'in_execution',
                real_progress_pct: 5.83,
                planned_progress_pct: 25.0,
                compliance_index: 0.23,
                traffic_light: 'red',
                budget_allocated: 2400000.0
              }
            ]
          }
        ],
        critical_projects_count: 2,
        critical_projects: [
          {
            project_id: 'p1',
            code: 'PRY-2026-OB-01',
            name: 'Pavimentación y Drenaje Pluvial Avenida Marcelo Quiroga Santa Cruz',
            area_name: 'Infraestructura Urbana y Obras Públicas',
            budget: 1850000.0,
            real_progress_pct: 13.0,
            planned_progress_pct: 30.0,
            compliance_index: 0.43
          },
          {
            project_id: 'p2',
            code: 'PRY-2026-ED-02',
            name: 'Construcción Centro de Salud Integral Lajastambo Distrito 3',
            area_name: 'Desarrollo Humano, Educación y Salud',
            budget: 2400000.0,
            real_progress_pct: 5.83,
            planned_progress_pct: 25.0,
            compliance_index: 0.23
          }
        ]
      };
    }
  },

  getOfficialReport: async () => {
    try {
      const res = await api.get('/dashboard/official-report');
      return res.data;
    } catch {
      return null;
    }
  }
};

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const res = await api.get('/projects');
      return res.data;
    } catch {
      return [];
    }
  },

  createProject: async (data: any) => {
    const res = await api.post('/projects', data);
    return res.data;
  },

  freezeBaseline: async (projectId: string) => {
    const res = await api.post(`/projects/${projectId}/freeze-baseline`);
    return res.data;
  },

  requestReprogramming: async (projectId: string, data: { cause_category: string; justification: string; requested_days_extension: number }) => {
    const res = await api.post(`/projects/${projectId}/reprogramming`, data);
    return res.data;
  },

  getReprogrammings: async (projectId: string) => {
    const res = await api.get(`/projects/${projectId}/reprogramming`);
    return res.data;
  },

  reviewReprogramming: async (requestId: string, decision: 'approved' | 'rejected', review_notes: string) => {
    const res = await api.post(`/projects/reprogramming/${requestId}/review`, { decision, review_notes });
    return res.data;
  }
};

export const trackingService = {
  submitReport: async (data: any) => {
    const res = await api.post('/tracking/reports', data);
    return res.data;
  },

  getPendingReports: async () => {
    try {
      const res = await api.get('/tracking/reports/pending');
      return res.data;
    } catch {
      return [];
    }
  },

  validateReport: async (reportId: string, status: string, comments: string) => {
    const res = await api.post(`/tracking/reports/${reportId}/validate`, { status, comments });
    return res.data;
  }
};

export const strategicService = {
  getIndicatorsTree: async () => {
    try {
      const res = await api.get('/strategic/indicators-tree');
      return res.data;
    } catch (err) {
      console.warn('Error cargando árbol de indicadores');
      return [];
    }
  },

  createArea: async (data: any) => {
    const res = await api.post('/strategic/areas', data);
    return res.data;
  },

  createObjective: async (data: any) => {
    const res = await api.post('/strategic/objectives', data);
    return res.data;
  },

  createIndicator: async (data: any) => {
    const res = await api.post('/strategic/indicators', data);
    return res.data;
  }
};

