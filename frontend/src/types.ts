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

export interface SCurveTimelinePoint {
  month_number: number;
  month_name: string;
  planned_physical_pct: number;
  planned_financial_pct: number;
  planned_financial_bs: number;
  real_physical_pct: number | null;
  real_financial_pct: number | null;
  real_financial_bs: number | null;
}

export interface SCurveData {
  project_id: string;
  code: string;
  name: string;
  budget_allocated: number;
  real_physical_pct: number;
  planned_physical_pct: number;
  real_financial_pct: number;
  real_financial_amount: number;
  planned_financial_pct: number;
  financial_physical_gap: number;
  has_overpayment_alert: boolean;
  alert_title: string;
  alert_message: string;
  timeline: SCurveTimelinePoint[];
}

export interface CitizenInquiry {
  id: string;
  district: string;
  citizen_name: string;
  citizen_contact: string;
  organization?: string | null;
  category: string;
  message: string;
  status: 'pending' | 'in_review' | 'responded';
  official_response?: string | null;
  created_at: string;
  responded_at?: string | null;
}

export interface PublicProject {
  id: string;
  code: string;
  name: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  budget_allocated: number;
  funding_source: string;
  start_date: string;
  end_date: string;
  status: string;
  real_progress_pct: number;
  planned_progress_pct: number;
  compliance_index: number;
  traffic_light: 'green' | 'yellow' | 'red';
  photos: string[];
  supervisor_name: string;
}


