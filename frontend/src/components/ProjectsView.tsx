import React, { useState } from 'react';
import { 
  FolderKanban, CheckCircle2, Lock, Calendar, DollarSign, MapPin, 
  ChevronDown, ChevronRight, Layers, FileCheck2, Sparkles, Check,
  AlertTriangle, History, Plus, X, RefreshCw, CalendarDays, TrendingUp,
  BarChart3, AlertOctagon, HelpCircle, FileSpreadsheet, FileText, ShieldCheck
} from 'lucide-react';
import { Project, SCurveData } from '../types';
import { projectService } from '../services/api';

interface ProjectsViewProps {
  projects: Project[];
  onRefresh: () => void;
  selectedProjectId?: string | null;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onRefresh,
  selectedProjectId,
}) => {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(selectedProjectId || (projects[0]?.id || null));
  const [freezing, setFreezing] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pestañas por proyecto: 'edt' | 'gantt' | 'scurve' | 'contract'
  const [activeProjectTabs, setActiveProjectTabs] = useState<{ [projectId: string]: 'edt' | 'gantt' | 'scurve' | 'contract' }>({});
  const [sCurveCache, setSCurveCache] = useState<{ [projectId: string]: SCurveData }>({});
  const [loadingSCurve, setLoadingSCurve] = useState<string | null>(null);

  // Estados para Modal de Reprogramación (Módulo 4.4)
  const [reprogModalProject, setReprogModalProject] = useState<Project | null>(null);
  const [causeCategory, setCauseCategory] = useState<string>('climatic_factors');
  const [justification, setJustification] = useState<string>('Intensas precipitaciones fluviales que impidieron el ingreso de maquinaria pesada.');
  const [extensionDays, setExtensionDays] = useState<number>(30);
  const [submittingReprog, setSubmittingReprog] = useState<boolean>(false);

  // Estados para Modal de Nueva Obra (Sucre)
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('PRY-2026-OB-05');
  const [newName, setNewName] = useState<string>('Construcción Tinglado y Cancha Polifuncional Barrio La Esperanza');
  const [newBudget, setNewBudget] = useState<number>(450000);
  const [newLocation, setNewLocation] = useState<string>('Distrito 3, Barrio La Esperanza - Sucre');
  const [newFunding, setNewFunding] = useState<string>('Coparticipación Tributaria');
  const [creatingProject, setCreatingProject] = useState<boolean>(false);

  const loadSCurve = async (projectId: string) => {
    if (sCurveCache[projectId]) return;
    try {
      setLoadingSCurve(projectId);
      const data = await projectService.getSCurve(projectId);
      setSCurveCache((prev) => ({ ...prev, [projectId]: data }));
    } catch (err) {
      console.error('Error cargando Curva S:', err);
    } finally {
      setLoadingSCurve(null);
    }
  };

  const setProjectTab = (projectId: string, tab: 'edt' | 'gantt' | 'scurve' | 'contract') => {
    setActiveProjectTabs((prev) => ({ ...prev, [projectId]: tab }));
    if (tab === 'scurve') {
      loadSCurve(projectId);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Código',
      'Nombre de la Obra',
      'Ubicación / Distrito',
      'Presupuesto Oficial (Bs.)',
      'Fuente de Financiamiento',
      'Fecha Inicio',
      'Fecha Fin',
      'Línea Base Congelada',
      'Estado'
    ];

    const rows = projects.map((p) => [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.location_name || ''}"`,
      p.budget_allocated || 0,
      `"${p.funding_source || ''}"`,
      p.start_date_planned,
      p.end_date_planned,
      p.baseline_frozen_at ? 'SÍ' : 'NO',
      `"${p.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SGP_Cartera_Proyectos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFreeze = async (projectId: string) => {
    try {
      setFreezing(projectId);
      await projectService.freezeBaseline(projectId);
      setSuccessMessage('¡Línea Base congelada y aprobada para auditoría oficial!');
      setTimeout(() => setSuccessMessage(null), 4000);
      onRefresh();
    } catch (err) {
      alert('Error congelando línea base');
    } finally {
      setFreezing(null);
    }
  };

  const handleRequestReprogramming = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reprogModalProject) return;

    try {
      setSubmittingReprog(true);
      const req = await projectService.requestReprogramming(reprogModalProject.id, {
        cause_category: causeCategory,
        justification,
        requested_days_extension: extensionDays
      });

      // Para propósitos de demo inmediata, aprobamos automáticamente si es el director o solicitante
      await projectService.reviewReprogramming(
        req.id, 
        'approved', 
        'Aprobado por el Director de Obras tras verificación de informe meteorológico.'
      );

      setSuccessMessage(`¡Reprogramación aprobada! Se ha generado la Línea Base v2 con ${extensionDays} días de ampliación.`);
      setTimeout(() => setSuccessMessage(null), 5000);
      setReprogModalProject(null);
      onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Error al registrar reprogramación');
    } finally {
      setSubmittingReprog(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingProject(true);
      // Tomamos el área estratégica y usuarios del primer proyecto existente
      const sample = projects[0];
      await projectService.createProject({
        code: newCode,
        name: newName,
        description: 'Proyecto prioritario incorporado al POA 2026.',
        location_name: newLocation,
        budget_allocated: newBudget,
        funding_source: newFunding,
        start_date_planned: '2026-03-01',
        end_date_planned: '2026-09-30',
        strategic_area_id: sample ? (sample as any).strategic_area_id || 'c5fc777f-0ec9-4449-a2a8-f9eb689970c2' : '1',
        responsible_id: (sample as any).responsible_id || '1',
      });

      setSuccessMessage('¡Nueva obra registrada exitosamente en el sistema!');
      setTimeout(() => setSuccessMessage(null), 4000);
      setShowNewProjectModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Error al crear proyecto');
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Programación de Proyectos y Desglose (EDT / WBS)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Estructuración de componentes, actividades, ponderación de pesos (%) y congelamiento de línea base.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
            title="Exportar cartera completa a Excel para control presupuestario"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Obra</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Lista de Proyectos */}
      <div className="space-y-4">
        {projects.map((proj) => {
          const isExpanded = expandedProjectId === proj.id;
          const isFrozen = !!proj.baseline_frozen_at;

          return (
            <div
              key={proj.id}
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isExpanded ? 'border-sky-400 ring-1 ring-sky-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Encabezado del Proyecto */}
              <div
                onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-base flex-shrink-0">
                    <FolderKanban className="w-5 h-5 text-sky-700" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {proj.code}
                      </span>
                      {isFrozen ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Lock className="w-3 h-3 mr-1 text-emerald-600" /> Línea Base v1 (Congelada)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          En Formulación / Borrador
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-sm sm:text-base text-slate-900 mt-1">
                      {proj.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{proj.location_name || 'Ubicación central'}</span>
                      <span className="mx-1.5 text-slate-300">·</span>
                      <span className="truncate">{proj.funding_source}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-500 font-semibold block">Presupuesto</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      Bs. {proj.budget_allocated?.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-sky-600" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Contenido Expandible */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/40 p-4 sm:p-6 space-y-5">
                  {/* Barra de Acciones de Control de Cambios y Reprogramación */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                        <FileCheck2 className="w-4 h-4 mr-1.5 text-sky-600 flex-shrink-0" />
                        Auditoría y Gestión de Desvíos (Módulo 4.4)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isFrozen 
                          ? 'Línea Base congelada oficialmente. Si existen desvíos climáticos o contractuales, solicite una reprogramación formal.'
                          : 'Una vez acordada la programación con Planificación, congele la línea base original.'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      {isFrozen ? (
                        <button
                          onClick={() => setReprogModalProject(proj)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Solicitar Reprogramación por Desvío</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFreeze(proj.id)}
                          disabled={freezing === proj.id}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-sm transition-all flex-shrink-0"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{freezing === proj.id ? 'Congelando...' : 'Aprobar y Congelar Línea Base'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pestañas de Visualización del Proyecto */}
                  {(() => {
                    const currentTab = activeProjectTabs[proj.id] || 'edt';
                    const scurve = sCurveCache[proj.id];
                    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                    const getMonthIdx = (dateStr: string) => {
                      if (!dateStr) return 0;
                      const parts = dateStr.split('-');
                      if (parts.length >= 2) return Math.max(0, Math.min(11, parseInt(parts[1], 10) - 1));
                      return 0;
                    };

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none no-scrollbar">
                          <button
                            onClick={() => setProjectTab(proj.id, 'edt')}
                            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                              currentTab === 'edt'
                                ? 'bg-sky-700 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Estructura EDT (WBS)</span>
                          </button>
                          <button
                            onClick={() => setProjectTab(proj.id, 'gantt')}
                            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                              currentTab === 'gantt'
                                ? 'bg-sky-700 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>Cronograma Gantt</span>
                          </button>
                          <button
                            onClick={() => setProjectTab(proj.id, 'scurve')}
                            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                              currentTab === 'scurve'
                                ? 'bg-sky-700 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Curva "S" (Auditoría)</span>
                          </button>
                          <button
                            onClick={() => setProjectTab(proj.id, 'contract')}
                            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                              currentTab === 'contract'
                                ? 'bg-sky-700 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Contrato & SICOES</span>
                          </button>
                        </div>

                        {/* VISTA 1: ESTRUCTURA EDT (WBS) */}
                        {currentTab === 'edt' && (
                          <div className="space-y-4">
                            <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wider flex items-center">
                              <Layers className="w-4 h-4 mr-2 text-indigo-600" />
                              Estructura de Desglose del Trabajo (EDT)
                            </h3>

                            {proj.components && proj.components.length > 0 ? (
                              proj.components.map((comp) => (
                                <div key={comp.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                                  <div className="bg-slate-100/90 px-3.5 py-2 flex items-center justify-between border-b border-slate-200">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-mono text-xs font-bold text-slate-600">{comp.code}</span>
                                      <span className="font-bold text-xs sm:text-sm text-slate-800">{comp.name}</span>
                                    </div>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      Peso: {comp.weight_percentage}%
                                    </span>
                                  </div>

                                  <div className="p-3 divide-y divide-slate-100">
                                    {comp.activities && comp.activities.length > 0 ? (
                                      comp.activities.map((act) => (
                                        <div key={act.id} className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                                          <div>
                                            <span className="font-mono font-bold text-slate-500 mr-2">{act.code}</span>
                                            <span className="font-semibold text-slate-900">{act.name}</span>
                                            <span className="text-slate-400 block sm:inline sm:ml-2 text-[11px]">
                                              ({act.start_date} al {act.end_date})
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-3 text-right">
                                            <span className="text-slate-600">
                                              Meta: <strong className="text-slate-900">{act.total_target_quantity} {act.unit_of_measure}</strong>
                                            </span>
                                            <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                              {act.weight_percentage}%
                                            </span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-slate-400 italic py-2 px-2">
                                        Sin actividades registradas en este componente.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500 italic">No hay componentes registrados.</p>
                            )}
                          </div>
                        )}

                        {/* VISTA 2: CRONOGRAMA GANTT MENSUAL (MÓDULO 4.2) */}
                        {currentTab === 'gantt' && (
                          <div className="space-y-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                              <div>
                                <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center">
                                  <CalendarDays className="w-4 h-4 mr-2 text-sky-600" />
                                  Cronograma Oficial de Ejecución de Obras (Ene - Dic 2026)
                                </h3>
                                <p className="text-xs text-slate-500">
                                  Distribución temporal de hitos constructivos y barras de duración por actividad.
                                </p>
                              </div>
                              <div className="flex items-center space-x-3 text-[11px] font-bold">
                                <span className="flex items-center"><span className="w-3 h-3 rounded bg-sky-500 mr-1.5"></span> Programado</span>
                                <span className="flex items-center"><span className="w-3 h-3 rounded bg-emerald-500 mr-1.5"></span> Ejecutado</span>
                              </div>
                            </div>

                            <p className="sm:hidden text-[11px] text-sky-700 font-semibold bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                              ← Desliza horizontalmente para ver la línea de tiempo completa →
                            </p>

                            <div className="overflow-x-auto pb-2">
                              <div className="min-w-[720px]">
                                {/* Cabecera de los 12 meses */}
                                <div className="grid grid-cols-12 gap-1 text-center font-mono text-xs font-bold text-slate-600 bg-slate-100 py-1.5 rounded-lg mb-2.5 border border-slate-200">
                                  {months.map((m, idx) => (
                                    <div key={m} className={`${idx <= 1 ? 'text-sky-800 font-extrabold bg-sky-200/60 rounded py-0.5' : ''}`}>
                                      {m}
                                    </div>
                                  ))}
                                </div>

                                {/* Filas por Componente y Actividad */}
                                <div className="space-y-3">
                                  {proj.components?.map((comp) => (
                                    <div key={comp.id} className="space-y-1.5">
                                      <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                                        <span>{comp.code} - {comp.name}</span>
                                        <span className="text-indigo-600">{comp.weight_percentage}% peso</span>
                                      </div>

                                      {comp.activities?.map((act) => {
                                        const startIdx = getMonthIdx(act.start_date);
                                        const endIdx = getMonthIdx(act.end_date);
                                        const span = Math.max(1, endIdx - startIdx + 1);
                                        const leftPct = (startIdx / 12) * 100;
                                        const widthPct = (span / 12) * 100;

                                        return (
                                          <div key={act.id} className="space-y-1 py-1 border-b border-slate-100">
                                            <div className="flex justify-between text-xs">
                                              <span className="font-semibold text-slate-800">
                                                {act.code}: {act.name}
                                              </span>
                                              <span className="text-slate-500 text-[11px]">
                                                {act.total_target_quantity} {act.unit_of_measure} ({act.start_date} al {act.end_date})
                                              </span>
                                            </div>

                                            {/* Barra de Gantt en el grid de 12 meses */}
                                            <div className="relative h-6 bg-slate-100 rounded overflow-hidden border border-slate-200">
                                              {/* Fondo de rejilla mensual */}
                                              <div className="absolute inset-0 grid grid-cols-12 divide-x divide-slate-200 pointer-events-none">
                                                {months.map((_, i) => <div key={i} className="h-full"></div>)}
                                              </div>

                                              {/* Barra de duración de la actividad */}
                                              <div
                                                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                                className="absolute top-1 bottom-1 bg-sky-700 rounded shadow-xs flex items-center px-2 text-white text-[10px] font-bold overflow-hidden"
                                              >
                                                <span className="truncate">{act.name}</span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* VISTA 3: CURVA S (FÍSICO VS FINANCIERO - MÓDULO 8.3) */}
                        {currentTab === 'scurve' && (
                          <div className="space-y-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
                            {loadingSCurve === proj.id ? (
                              <div className="p-8 text-center text-slate-500 text-xs font-semibold flex items-center justify-center space-x-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                                <span>Calculando curva acumulada y desbalances contractuales...</span>
                              </div>
                            ) : scurve ? (
                              <>
                                {/* KPIs Principales de Auditoría */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                      Presupuesto Oficial
                                    </span>
                                    <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 block truncate">
                                      Bs. {scurve.budget_allocated.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                                      Avance Físico Auditado
                                    </span>
                                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                                      <span className="text-sm sm:text-base font-black text-emerald-700">{scurve.real_physical_pct}%</span>
                                      <span className="text-xs text-emerald-600 font-semibold truncate">/ {scurve.planned_physical_pct}%</span>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-purple-50/70 rounded-lg border border-purple-200">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                                      Desembolso Financiero
                                    </span>
                                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                                      <span className="text-sm sm:text-base font-black text-purple-700">{scurve.real_financial_pct}%</span>
                                      <span className="text-[11px] text-purple-600 font-semibold truncate">Pagado</span>
                                    </div>
                                  </div>

                                  <div className={`p-3 rounded-lg border ${
                                    scurve.has_overpayment_alert 
                                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                                      : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                                      Diferencial Fís-Fin
                                    </span>
                                    <span className="text-sm sm:text-base font-black mt-0.5 block">
                                      {scurve.financial_physical_gap > 0 ? `+${scurve.financial_physical_gap}%` : `${scurve.financial_physical_gap}%`}
                                    </span>
                                  </div>
                                </div>

                                {/* ALERTA CRÍTICA DE SOBREPAGO (Si corresponde) */}
                                {scurve.has_overpayment_alert && (
                                  <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 space-y-1">
                                    <div className="flex items-center space-x-2 font-bold text-xs sm:text-sm text-rose-800">
                                      <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                      <span>ALERTA DE FISCALIZACIÓN: {scurve.alert_title}</span>
                                    </div>
                                    <p className="text-xs font-medium text-rose-700 pl-6 leading-relaxed">
                                      {scurve.alert_message}
                                    </p>
                                  </div>
                                )}

                                {/* Gráfico de Comparación Mensual */}
                                <div className="space-y-2 pt-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                                    <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                                      Evolución: Prog. Físico vs Real Físico vs Financiero
                                    </span>
                                    <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-600">
                                      <span className="flex items-center"><span className="w-2 h-2 rounded bg-sky-500 mr-1"></span> Prog. Físico</span>
                                      <span className="flex items-center"><span className="w-2 h-2 rounded bg-emerald-500 mr-1"></span> Real Físico</span>
                                      <span className="flex items-center"><span className="w-2 h-2 rounded bg-purple-600 mr-1"></span> Pagado Financiero</span>
                                    </div>
                                  </div>

                                  {/* Barras de comparación por mes */}
                                  <div className="overflow-x-auto pb-1">
                                    <div className="min-w-[580px] grid grid-cols-12 gap-1.5 pt-3 pb-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                      {scurve.timeline.map((item) => (
                                        <div key={item.month_number} className="flex flex-col items-center space-y-1">
                                          {/* Barra vertical comparativa */}
                                          <div className="h-24 w-full flex items-end justify-center space-x-0.5 bg-white rounded p-1 border border-slate-200">
                                            {/* Barra Planificada */}
                                            <div
                                              style={{ height: `${Math.min(100, item.planned_physical_pct)}%` }}
                                              className="w-1.5 bg-sky-500 rounded-t"
                                              title={`Planificado: ${item.planned_physical_pct}%`}
                                            ></div>

                                            {/* Barra Real Físico */}
                                            {item.real_physical_pct !== null && (
                                              <div
                                                style={{ height: `${Math.min(100, item.real_physical_pct)}%` }}
                                                className="w-1.5 bg-emerald-500 rounded-t"
                                                title={`Real Físico: ${item.real_physical_pct}%`}
                                              ></div>
                                            )}

                                            {/* Barra Desembolso Financiero */}
                                            {item.real_financial_pct !== null && (
                                              <div
                                                style={{ height: `${Math.min(100, item.real_financial_pct)}%` }}
                                                className="w-1.5 bg-purple-600 rounded-t"
                                                title={`Financiero: ${item.real_financial_pct}%`}
                                              ></div>
                                            )}
                                          </div>

                                          <span className="text-[10px] font-mono font-bold text-slate-600">
                                            {item.month_name}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-slate-400">No se pudieron cargar los datos de la Curva S.</p>
                            )}
                          </div>
                        )}

                        {/* VISTA 4: FICHA CONTRACTUAL Y SICOES (MÓDULO 4.1) */}
                        {currentTab === 'contract' && (() => {
                          const isQuiroga = proj.code.includes('OB-01');
                          const isLajastambo = proj.code.includes('ED-02');
                          const isPatrimonio = proj.code.includes('CH-03');

                          const contractorName = isQuiroga 
                            ? 'Consorcio Vial Chuquisaca (Asoc. Accidental)'
                            : isLajastambo 
                            ? 'Constructora San Roque S.R.L.'
                            : isPatrimonio
                            ? 'Asociación Accidental Patrimonio Sucre'
                            : 'Constructora El Alfarero S.R.L.';

                          const cuceCode = isQuiroga 
                            ? '26-0401-00-149201-1-1'
                            : isLajastambo 
                            ? '26-0401-00-150344-1-1'
                            : isPatrimonio
                            ? '26-0401-00-148112-1-1'
                            : '26-0401-00-151090-1-1';

                          const modalContract = isQuiroga || isLajastambo ? 'Licitación Pública Nacional (LPN)' : 'ANPE (D.S. 0181)';

                          return (
                            <div className="space-y-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs text-xs animate-fadeIn">
                              {/* Cabecera SICOES */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                                      CUCE: {cuceCode}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                      · {modalContract}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">
                                    Contrato Administrativo de Obra N° GAMS-DOP-2026/{proj.code.split('-')[2] || '01'}
                                  </h4>
                                </div>
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                                  ✓ Contrato Vigente Protocolizado
                                </span>
                              </div>

                              {/* Grid de Información de Empresa y Pólizas */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {/* Ficha del Contratista */}
                                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                                  <h5 className="font-bold uppercase tracking-wider text-slate-700 flex items-center text-[11px]">
                                    <FolderKanban className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                                    Empresa Contratista Adjudicada
                                  </h5>
                                  <div className="space-y-1.5 pt-0.5">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Razón Social:</span>
                                      <span className="font-bold text-slate-900 truncate max-w-[200px]">{contractorName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Monto Contratado:</span>
                                      <span className="font-bold text-slate-900">Bs. {proj.budget_allocated?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Plazo Contractual:</span>
                                      <span className="font-semibold text-slate-800">{proj.start_date_planned} al {proj.end_date_planned}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Orden de Proceder:</span>
                                      <span className="font-mono font-bold text-emerald-700">Emitida el {proj.start_date_planned}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Garantías y Pólizas de Seguro (D.S. 0181) */}
                                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                                  <h5 className="font-bold uppercase tracking-wider text-slate-700 flex items-center text-[11px]">
                                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                                    Pólizas de Garantía Bancaria (D.S. 0181)
                                  </h5>
                                  <div className="space-y-1.5 pt-0.5">
                                    <div className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between">
                                      <div>
                                        <span className="font-bold text-slate-800 block text-[11px]">Cumplimiento de Contrato (7%)</span>
                                        <span className="text-[10px] text-slate-500">Bs. {(proj.budget_allocated * 0.07).toLocaleString()} · Alianza Seguros</span>
                                      </div>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Vigente</span>
                                    </div>
                                    <div className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between">
                                      <div>
                                        <span className="font-bold text-slate-800 block text-[11px]">Inversión de Anticipo (20%)</span>
                                        <span className="text-[10px] text-slate-500">Bs. {(proj.budget_allocated * 0.20).toLocaleString()} · En amortización</span>
                                      </div>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">Amortizando</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Trazabilidad de Planillas de Avance y Pagos */}
                              <div className="space-y-2 pt-1">
                                <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-700">
                                  Planillas de Avance y Certificados de Medición
                                </h5>
                                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                                  <table className="w-full text-left min-w-[550px]">
                                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                                      <tr>
                                        <th className="p-2.5">Documento</th>
                                        <th className="p-2.5">Monto Certificado (Bs.)</th>
                                        <th className="p-2.5">Respaldo Técnico</th>
                                        <th className="p-2.5">Fiscal de Obra</th>
                                        <th className="p-2.5">Estado Financiero</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      <tr>
                                        <td className="p-2.5 font-semibold">Anticipo de Obra (20%)</td>
                                        <td className="p-2.5 font-bold">Bs. {(proj.budget_allocated * 0.20).toLocaleString()}</td>
                                        <td className="p-2.5 text-slate-500">Instalación de faenas</td>
                                        <td className="p-2.5 text-slate-700">Ing. Laura Vargas</td>
                                        <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Desembolsado</span></td>
                                      </tr>
                                      <tr>
                                        <td className="p-2.5 font-semibold">Planilla N° 1 de Avance</td>
                                        <td className="p-2.5 font-bold">Bs. {(proj.budget_allocated * 0.08).toLocaleString()}</td>
                                        <td className="p-2.5 text-emerald-700 font-bold">Acta de Medición en Libro de Órdenes</td>
                                        <td className="p-2.5 text-slate-700">Ing. Laura Vargas</td>
                                        <td className="p-2.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Aprobado y Pagado</span></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: SOLICITUD DE REPROGRAMACIÓN POR DESVÍO */}
      {reprogModalProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  Solicitud de Reprogramación Oficial
                </h3>
              </div>
              <button 
                onClick={() => setReprogModalProject(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Obra: <strong className="text-slate-800">{reprogModalProject.code} - {reprogModalProject.name}</strong>
              </p>
            </div>

            <form onSubmit={handleRequestReprogramming} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Causa del Desvío (Normativa)</label>
                <select
                  value={causeCategory}
                  onChange={(e) => setCauseCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-slate-800 font-semibold"
                >
                  <option value="climatic_factors">Factores Climáticos (Lluvias, riadas)</option>
                  <option value="contractor_delay">Incumplimiento de Contratista</option>
                  <option value="lack_of_budget">Falta de Liquidez / Recursos Financieros</option>
                  <option value="scope_change">Modificación de Diseño / Alcance</option>
                  <option value="social_conflict">Conflicto Social / Bloqueos</option>
                  <option value="other">Otras causas justificadas</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Días Calendario de Ampliación Solicitados
                </label>
                <input
                  type="number"
                  min="1"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Justificación Técnica Detallada
                </label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReprogModalProject(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingReprog}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                >
                  {submittingReprog ? 'Procesando...' : 'Aprobar Reprogramación (LB v2)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR NUEVA OBRA */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                Registrar Nueva Obra Municipal
              </h3>
              <button 
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Código Oficial</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre de la Obra o Proyecto</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Presupuesto (Bs.)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fuente Financiamiento</label>
                  <input
                    type="text"
                    value={newFunding}
                    onChange={(e) => setNewFunding(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ubicación / Distrito</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs"
                >
                  {creatingProject ? 'Guardando...' : 'Crear Obra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
