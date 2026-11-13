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

export const authService = {
  login: async (email: string, password: string = 'admin123') => {
    try {
      const res = await api.post('/auth/login-json', { email, password });
      localStorage.setItem('sgp_token', res.data.access_token);
      localStorage.setItem('sgp_user_role', res.data.role);
      localStorage.setItem('sgp_user_name', res.data.user_name);
      return res.data;
    } catch (err) {
      console.warn('API de login no disponible, usando sesión local');
      // Fallback para demo
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
                name: 'Pavimentación y Drenaje Pluvial Avenida Integración Distrito 4',
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
                name: 'Construcción Centro de Salud Integral Comunitario',
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
            name: 'Pavimentación y Drenaje Pluvial Avenida Integración Distrito 4',
            area_name: 'Infraestructura Urbana y Obras Públicas',
            budget: 1850000.0,
            real_progress_pct: 13.0,
            planned_progress_pct: 30.0,
            compliance_index: 0.43
          },
          {
            project_id: 'p2',
            code: 'PRY-2026-ED-02',
            name: 'Construcción Centro de Salud Integral Comunitario',
            area_name: 'Desarrollo Humano, Educación y Salud',
            budget: 2400000.0,
            real_progress_pct: 5.83,
            planned_progress_pct: 25.0,
            compliance_index: 0.23
          }
        ]
      };
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

