import React, { useState } from 'react';
import { 
  FolderKanban, CheckCircle2, Lock, Calendar, DollarSign, MapPin, 
  ChevronDown, ChevronRight, Layers, FileCheck2, Sparkles, Check
} from 'lucide-react';
import { Project } from '../types';
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Programación de Proyectos y Desglose (EDT / WBS)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Estructuración de componentes, actividades, ponderación de pesos (%) y congelamiento de línea base.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm ${
                isExpanded ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Encabezado del Proyecto */}
              <div
                onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {proj.code}
                      </span>
                      {isFrozen ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Lock className="w-3 h-3 mr-1" /> Línea Base Congelada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          En Formulación / Borrador
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-lg text-slate-900 mt-1">
                      {proj.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {proj.location_name || 'Ubicación central'} · {proj.funding_source}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500 font-semibold block">Presupuesto</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      Bs. {proj.budget_allocated?.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-sky-600" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Contenido Expandible (EDT / Componentes / Actividades) */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-7 space-y-6">
                  {/* Botón de Congelamiento Oficial */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                        <FileCheck2 className="w-4 h-4 mr-1.5 text-sky-600" />
                        Control Oficial de Línea Base (Diapositiva 6 y 7)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isFrozen 
                          ? `Aprobada y congelada oficialmente para auditoría. Los cambios requieren flujo formal de reprogramación.`
                          : 'Una vez acordada la programación con Planificación, congele la línea base original.'}
                      </p>
                    </div>

                    {!isFrozen && (
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

                  {/* Componentes y Actividades */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center">
                      <Layers className="w-4 h-4 mr-2 text-indigo-600" />
                      Estructura de Desglose del Trabajo (EDT)
                    </h3>

                    {proj.components && proj.components.length > 0 ? (
                      proj.components.map((comp) => (
                        <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                          <div className="bg-slate-100/80 px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-slate-600">{comp.code}</span>
                              <span className="font-bold text-sm text-slate-800">{comp.name}</span>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Peso en Obra: {comp.weight_percentage}%
                            </span>
                          </div>

                          {/* Actividades del Componente */}
                          <div className="p-3 divide-y divide-slate-100">
                            {comp.activities && comp.activities.length > 0 ? (
                              comp.activities.map((act) => (
                                <div key={act.id} className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                                  <div>
                                    <span className="font-mono font-bold text-slate-500 mr-2">{act.code}</span>
                                    <span className="font-semibold text-slate-900">{act.name}</span>
                                    <span className="text-slate-400 ml-2">
                                      ({act.start_date} al {act.end_date})
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-slate-600">
                                      Meta total: <strong className="text-slate-900">{act.total_target_quantity} {act.unit_of_measure}</strong>
                                    </span>
                                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                      Peso: {act.weight_percentage}%
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

