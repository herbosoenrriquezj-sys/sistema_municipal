import React, { useState, useEffect } from 'react';
import { 
  Compass, Target, Award, Plus, FolderKanban, CheckCircle2, 
  ChevronRight, BarChart2, Layers, ShieldCheck, X
} from 'lucide-react';
import { strategicService } from '../services/api';

interface StrategicViewProps {
  onSelectProject?: (projectId: string) => void;
}

export const StrategicView: React.FC<StrategicViewProps> = ({ onSelectProject }) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewIndicatorModal, setShowNewIndicatorModal] = useState<boolean>(false);

  // Formulario nuevo indicador
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('');
  const [indCode, setIndCode] = useState<string>('IND-SAL-01');
  const [indName, setIndName] = useState<string>('Centros de salud construidos y equipados');
  const [indUnit, setIndUnit] = useState<string>('Centros integrales');
  const [indTarget, setIndTarget] = useState<number>(2);
  const [indFrequency, setIndFrequency] = useState<string>('quarterly');
  const [indSource, setIndSource] = useState<string>('Actas de entrega definitiva de infraestructura');

  const [message, setMessage] = useState<string | null>(null);

  const loadTree = async () => {
    try {
      setLoading(true);
      const data = await strategicService.getIndicatorsTree();
      setTreeData(data);
      if (data.length > 0 && data[0].objectives.length > 0) {
        setSelectedObjectiveId(data[0].objectives[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const handleCreateIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await strategicService.createIndicator({
        objective_id: selectedObjectiveId,
        code: indCode,
        name: indName,
        unit_of_measure: indUnit,
        target_value: indTarget,
        baseline_value: 0,
        frequency: indFrequency,
        calculation_type: 'automatic_projects',
        verification_source: indSource,
      });

      setMessage('¡Nuevo indicador institucional registrado exitosamente en el plan estratégico!');
      setTimeout(() => setMessage(null), 4000);
      setShowNewIndicatorModal(false);
      loadTree();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Error creando indicador');
    }
  };

  const getTrafficLightBadge = (color: string) => {
    switch (color) {
      case 'green':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            En Ruta (≥90%)
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
            En Riesgo (70-89%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-600 mr-1.5"></span>
            Desvío (&lt;70%)
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner Principal Diapositiva 9 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Compass className="w-4 h-4" />
              <span>Dirección de Planificación · Trazabilidad de Punta a Punta (Diapositiva 9)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Planificación Institucional y Metas POA
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Articulación directa entre las áreas estratégicas del municipio, los objetivos de gestión y los proyectos de inversión pública en ejecución.
            </p>
          </div>

          <button
            onClick={() => setShowNewIndicatorModal(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Indicador POA</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Árbol de Trazabilidad */}
      <div className="space-y-8">
        {treeData.map((area) => (
          <div key={area.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            {/* Cabecera del Área */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {area.code}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {area.name}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                Ponderación en Plan Municipal: {area.weight_percentage}%
              </span>
            </div>

            {/* Objetivos del Área */}
            <div className="space-y-6">
              {area.objectives && area.objectives.length > 0 ? (
                area.objectives.map((obj: any) => (
                  <div key={obj.id} className="pl-0 sm:pl-4 border-l-0 sm:border-l-2 sm:border-indigo-200 space-y-4">
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-500">{obj.code}</span>
                          <span className="text-xs font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                            Gestión {obj.target_year}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 mt-0.5">
                          {obj.description}
                        </h3>
                      </div>
                    </div>

                    {/* Indicadores del Objetivo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      {obj.indicators && obj.indicators.length > 0 ? (
                        obj.indicators.map((ind: any) => (
                          <div
                            key={ind.id}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono text-[11px] font-bold text-slate-400">
                                  {ind.code}
                                </span>
                                <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                                  {ind.name}
                                </h4>
                              </div>
                              {getTrafficLightBadge(ind.traffic_light)}
                            </div>

                            {/* Medición y Progreso */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
                              <div className="flex justify-between font-semibold">
                                <span className="text-slate-500">Ejecutado Acumulado:</span>
                                <span className="text-slate-900 font-bold">
                                  {ind.current_value} / {ind.target_value} {ind.unit_of_measure}
                                </span>
                              </div>

                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full ${
                                    ind.traffic_light === 'green'
                                      ? 'bg-emerald-500'
                                      : ind.traffic_light === 'yellow'
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(ind.progress_pct, 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                                <span>Cumplimiento de meta: <strong>{ind.progress_pct}%</strong></span>
                                <span>Medición: {ind.frequency}</span>
                              </div>
                            </div>

                            {/* Proyectos Vinculados que alimentan este indicador */}
                            <div className="pt-2 border-t border-slate-200/60">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                Obras que tributan a esta meta:
                              </span>
                              {ind.linked_projects && ind.linked_projects.length > 0 ? (
                                <div className="space-y-1">
                                  {ind.linked_projects.map((p: any) => (
                                    <div
                                      key={p.id}
                                      onClick={() => onSelectProject && onSelectProject(p.id)}
                                      className="p-2 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between cursor-pointer hover:border-sky-400 transition-all"
                                    >
                                      <span className="font-semibold text-slate-800 truncate mr-2">
                                        {p.code} - {p.name}
                                      </span>
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">
                                  Sin proyectos vinculados directamente.
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No hay indicadores registrados.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No hay objetivos registrados.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nuevo Indicador */}
      {showNewIndicatorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">
                Registrar Nuevo Indicador POA
              </h3>
              <button 
                onClick={() => setShowNewIndicatorModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIndicator} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Objetivo Estratégico Asociado</label>
                <select
                  value={selectedObjectiveId}
                  onChange={(e) => setSelectedObjectiveId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-slate-800 font-semibold"
                  required
                >
                  {treeData.flatMap((a) => a.objectives).map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.code} - {o.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={indCode}
                    onChange={(e) => setIndCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 font-mono font-bold"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Indicador</label>
                  <input
                    type="text"
                    value={indName}
                    onChange={(e) => setIndName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    value={indUnit}
                    onChange={(e) => setIndUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meta Anual</label>
                  <input
                    type="number"
                    value={indTarget}
                    onChange={(e) => setIndTarget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fuente Oficial de Verificación</label>
                <input
                  type="text"
                  value={indSource}
                  onChange={(e) => setIndSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewIndicatorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                >
                  Guardar Indicador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

