import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ProjectsView } from './components/ProjectsView';
import { FieldReportingView } from './components/FieldReportingView';
import { StrategicView } from './components/StrategicView';
import { OfficialReportView } from './components/OfficialReportView';
import { MunicipalMapView } from './components/MunicipalMapView';
import { CitizenPortalView } from './components/CitizenPortalView';
import { dashboardService, projectService, authService } from './services/api';
import { ExecutiveSummary, Project } from './types';
import { Loader2, Menu, PanelsTopLeft, LayoutGrid, Check, ChevronDown, Building2, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<string>('alcalde');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Estados de layout del Menú
  const [layoutStyle, setLayoutStyle] = useState<'sidebar' | 'topbar'>('sidebar');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);

  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const roles = [
    { key: 'alcalde', label: 'Alcalde Municipal', shortLabel: 'Alcalde', email: 'alcalde@sgp.gob', roleDesc: 'Máxima Autoridad (M.A.E.)' },
    { key: 'director_area', label: 'Director de Obras Públicas', shortLabel: 'Director', email: 'director.obras@sgp.gob', roleDesc: 'Secretaría Municipal Técnica' },
    { key: 'responsable_proyecto', label: 'Residente de Obra', shortLabel: 'Residente', email: 'responsable.obras@sgp.gob', roleDesc: 'Ingeniero Responsable Técnico' },
    { key: 'supervisor_fiscal', label: 'Fiscal de Obras / Supervisor', shortLabel: 'Fiscal', email: 'supervisor.fiscal@sgp.gob', roleDesc: 'Fiscalización y Aprobación' },
    { key: 'control_social', label: 'Control Social / Juntas Vecinales', shortLabel: 'Control Social', email: 'vecino.sucre@sgp.gob', roleDesc: 'Participación Ciudadana (Ley 341)' },
  ];

  const currentRoleObj = roles.find(r => r.key === currentRole) || roles[0];

  const tabLabels: Record<string, string> = {
    dashboard: 'Tablero Ejecutivo de Control Municipal',
    projects: 'Programación de Obras y Desglose EDT / WBS',
    field: 'Fiscalización Móvil y Validación de Terreno',
    strategic: 'Planificación POA (Formas 1, 2 y 3)',
    map: 'Sistema de Información Geográfica (GIS Satelital HD)',
    report: 'Informe Oficial de Rendición de Cuentas',
    citizen: 'Portal Ciudadano y Control Social (Ley 341)',
  };

  const loadData = async (roleToUse = currentRole) => {
    try {
      setLoading(true);
      const email = roles.find(r => r.key === roleToUse)?.email || 'alcalde@sgp.gob';
      await authService.login(email, 'admin123');
      const [sumData, projData] = await Promise.all([
        dashboardService.getExecutiveSummary(),
        projectService.getProjects(),
      ]);
      setSummary(sumData);
      setProjects(projData);
    } catch (err) {
      console.error('Error cargando datos del sistema:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentRole);
  }, [currentRole]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab('projects');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex selection:bg-sky-500 selection:text-white">
      {/* 1. MODO SIDEBAR (MENÚ LATERAL PLEGABLE / RESPONSIVO TIPO PAUL CODES) */}
      {layoutStyle === 'sidebar' && (
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          tenantName={summary?.institution_name || 'Gobierno Autónomo Municipal de Sucre'}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      )}

      {/* 2. CONTENEDOR DERECHO PRINCIPAL */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          layoutStyle === 'sidebar' 
            ? isCollapsed ? 'lg:ml-20' : 'lg:ml-64' 
            : 'ml-0'
        }`}
      >
        {/* ENCABEZADO SUPERIOR SEGÚN MODO SELECCIONADO */}
        {layoutStyle === 'sidebar' ? (
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
            <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
              <div className="h-16 flex items-center justify-between gap-3">
                
                {/* Lado Izquierdo: Botón Menú Móvil + Breadcrumb */}
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={() => setIsOpenMobile(true)}
                    className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Abrir menú de navegación"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 truncate">
                      <span>Sucre, Bolivia</span>
                      <span>·</span>
                      <span>POA 2026</span>
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {tabLabels[currentTab] || 'SGP Municipal'}
                    </h2>
                  </div>
                </div>

                {/* Lado Derecho: Selector de Layout + Perfil de Usuario */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Switcher para cambiar estilo de menú */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => setLayoutStyle('sidebar')}
                      className="px-2.5 py-1 rounded-md font-semibold transition-all flex items-center space-x-1 bg-white text-sky-800 shadow-xs"
                      title="Menú lateral interactivo (tipo Paul Codes)"
                    >
                      <PanelsTopLeft className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Menú Lateral</span>
                    </button>
                    <button
                      onClick={() => setLayoutStyle('topbar')}
                      className="px-2.5 py-1 rounded-md font-semibold transition-all flex items-center space-x-1 text-slate-600 hover:text-slate-900"
                      title="Barra superior clásica"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Barra Superior</span>
                    </button>
                  </div>

                  {/* Selector Rápido de Rol */}
                  <div className="relative">
                    <button
                      onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                      className="flex items-center space-x-2 py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="font-bold text-slate-800 hidden sm:inline">{currentRoleObj.label}</span>
                      <span className="font-bold text-slate-800 sm:hidden">{currentRoleObj.shortLabel}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {roleDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setRoleDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Simulación de Roles y Permisos
                          </div>
                          {roles.map((r) => {
                            const isSelected = r.key === currentRole;
                            return (
                              <button
                                key={r.key}
                                onClick={() => {
                                  setCurrentRole(r.key);
                                  setRoleDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                                  isSelected ? 'bg-sky-50 text-sky-900 font-bold' : 'text-slate-700'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold text-slate-900">{r.label}</div>
                                  <div className="text-[10px] text-slate-400">{r.roleDesc}</div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-sky-600 flex-shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </header>
        ) : (
          /* MODO BARRA SUPERIOR */
          <div className="relative">
            <Navbar
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              tenantName={summary?.institution_name || 'Gobierno Autónomo Municipal de Sucre'}
            />
            {/* Botón flotante para volver a Menú Lateral */}
            <div className="max-w-7xl mx-auto px-4 pt-2 flex justify-end">
              <button
                onClick={() => setLayoutStyle('sidebar')}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-sky-800 shadow-xs transition-colors"
                title="Cambiar a menú lateral estilo Paul Codes"
              >
                <PanelsTopLeft className="w-3.5 h-3.5" />
                <span>Activar Menú Lateral</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. CONTENIDO PRINCIPAL */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {loading && !summary ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-500">
                Conectando con la base de datos municipal...
              </p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && summary && (
                <ExecutiveDashboard
                  summary={summary}
                  onSelectProject={handleSelectProject}
                  onNavigateToReport={() => setCurrentTab('report')}
                />
              )}

              {currentTab === 'projects' && (
                <ProjectsView
                  projects={projects}
                  onRefresh={loadData}
                  selectedProjectId={selectedProjectId}
                />
              )}

              {currentTab === 'field' && (
                <FieldReportingView
                  projects={projects}
                  currentRole={currentRole}
                  onRefresh={loadData}
                />
              )}

              {currentTab === 'strategic' && (
                <StrategicView
                  onSelectProject={handleSelectProject}
                />
              )}

              {currentTab === 'map' && (
                <MunicipalMapView
                  projects={projects}
                  summary={summary}
                  onSelectProject={handleSelectProject}
                />
              )}

              {currentTab === 'report' && (
                <OfficialReportView
                  onBack={() => setCurrentTab('dashboard')}
                />
              )}

              {currentTab === 'citizen' && (
                <CitizenPortalView
                  currentRole={currentRole}
                />
              )}
            </>
          )}
        </main>

        {/* 4. PIE DE PÁGINA INSTITUCIONAL */}
        <footer className="bg-white border-t border-slate-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>
              <strong>SGP Municipal SaaS</strong> · Sistema de Gerencia de Proyectos y Planificación Estratégica.
            </p>
            <p className="text-slate-400">
              Gobierno Autónomo Municipal de Sucre, Chuquisaca · Todos los derechos reservados © {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
