import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ProjectsView } from './components/ProjectsView';
import { FieldReportingView } from './components/FieldReportingView';
import { StrategicView } from './components/StrategicView';
import { OfficialReportView } from './components/OfficialReportView';
import { dashboardService, projectService, authService } from './services/api';
import { ExecutiveSummary, Project } from './types';
import { Loader2, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<string>('alcalde');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
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
    loadData();
  }, []);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab('projects');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Navbar Superior */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        tenantName={summary?.institution_name || 'Gobierno Autónomo Municipal'}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            {currentTab === 'report' && (
              <OfficialReportView
                onBack={() => setCurrentTab('dashboard')}
              />
            )}
          </>
        )}
      </main>

      {/* Pie de Página Institucional */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            <strong>SGP Municipal SaaS</strong> · Sistema de Gerencia de Proyectos y Planificación Estratégica.
          </p>
          <p className="text-slate-400">
            Ingeniería en Sistemas de Información (ISI) · Proyecto de Grado 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

