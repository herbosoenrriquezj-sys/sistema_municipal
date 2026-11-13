export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'alcalde' | 'director_area' | 'responsable_proyecto' | 'supervisor_fiscal' | 'planificacion' | 'control_social' | 'tenant_admin';
  tenant_id: string;
  is_active: boolean;
}

export interface CriticalProject {
  project_id: string;
  code: string;
  name: string;
  area_name: string;
  budget: number;
  real_progress_pct: number;
  planned_progress_pct: number;
  compliance_index: number;
}

export interface AreaSummary {
  area_id: string;
  name: string;
  code: string;
  weight_pct: number;
  real_progress_pct: number;
  planned_progress_pct: number;
  compliance_index: number;
  traffic_light: 'green' | 'yellow' | 'red';
  total_projects: number;
  projects_summary: Array<{
    project_id: string;
    code: string;
    name: string;
    status: string;
    real_progress_pct: number;
    planned_progress_pct: number;
    compliance_index: number;
    traffic_light: 'green' | 'yellow' | 'red';
    budget_allocated: number;
  }>;
}

export interface ExecutiveSummary {
  institution_name: string;
  total_projects: number;
  global_real_progress_pct: number;
  global_planned_progress_pct: number;
  global_compliance_index: number;
  global_traffic_light: 'green' | 'yellow' | 'red';
  areas_summary: AreaSummary[];
  critical_projects_count: number;
  critical_projects: CriticalProject[];
}

export interface ProjectActivity {
  id: string;
  code: string;
  name: string;
  unit_of_measure: string;
  total_target_quantity: number;
  weight_percentage: number;
  start_date: string;
  end_date: string;
}

export interface ProjectComponent {
  id: string;
  code: string;
  name: string;
  weight_percentage: number;
  activities: ProjectActivity[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  budget_allocated: number;
  funding_source: string;
  start_date_planned: string;
  end_date_planned: string;
  status: string;
  baseline_frozen_at: string | null;
  components: ProjectComponent[];
}

