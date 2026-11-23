import React, { useState, useEffect } from 'react';
import { 
  Compass, Target, Award, Plus, FolderKanban, CheckCircle2, 
  ChevronRight, BarChart2, Layers, ShieldCheck, X, FileSpreadsheet,
  Calculator, Info, HelpCircle, Check, ArrowRight, Table, AlertTriangle
} from 'lucide-react';
import { strategicService } from '../services/api';

interface StrategicViewProps {
  onSelectProject?: (projectId: string) => void;
}

export const StrategicView: React.FC<StrategicViewProps> = ({ onSelectProject }) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewIndicatorModal, setShowNewIndicatorModal] = useState<boolean>(false);

  // Pestaña principal: 'tree' | 'formas' | 'formulas'
  const [activeMainTab, setActiveMainTab] = useState<'formas' | 'tree' | 'formulas'>('formas');
  
  // Subpestaña para las planillas oficiales: 'forma1' | 'forma2' | 'forma3'
  const [selectedForma, setSelectedForma] = useState<'forma1' | 'forma2' | 'forma3'>('forma1');

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
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            En Ruta (≥90%)
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            En Riesgo (70-89%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5"></span>
            Desvío (&lt;70%)
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fadeIn">
      {/* Banner Principal Institucional */}
      <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Dirección de Planificación · Trazabilidad POA (Sucre, Chuquisaca)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Planificación Institucional y Metas POA (Formas 1, 2 y 3)
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-0.5 max-w-2xl">
            Flujo metodológico oficial de formulación, metas de gestión, programación trimestral y cálculo del porcentaje adecuado por ponderación.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={() => setShowNewIndicatorModal(true)}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Indicador POA</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Selector de Vistas Principales */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-lg text-xs font-bold">
          <button
            onClick={() => setActiveMainTab('formas')}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeMainTab === 'formas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-sky-700" />
            <span>Planillas Oficiales (Forma 1, 2 y 3)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('tree')}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeMainTab === 'tree'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Árbol de Trazabilidad y Obras</span>
          </button>

          <button
            onClick={() => setActiveMainTab('formulas')}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeMainTab === 'formulas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>¿Cómo se Calcula el % Adecuado?</span>
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          Metodología Oficial POA · Ley 1178 / SPIE
        </span>
      </div>

      {/* VISTA 1: PLANILLAS OFICIALES MUNICIPALES (FORMA 1, FORMA 2, FORMA 3) */}
      {activeMainTab === 'formas' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Subpestañas Formas 1, 2 y 3 */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Seleccionar Formato Oficial:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setSelectedForma('forma1')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                    selectedForma === 'forma1'
                      ? 'bg-sky-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  FORMA 1: Propósitos y Objetivos Inmediatos
                </button>
                <button
                  onClick={() => setSelectedForma('forma2')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                    selectedForma === 'forma2'
                      ? 'bg-sky-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  FORMA 2: Metas de Gestión
                </button>
                <button
                  onClick={() => setSelectedForma('forma3')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                    selectedForma === 'forma3'
                      ? 'bg-sky-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  FORMA 3: Programación Trimestral y % Adecuado
                </button>
              </div>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Entidad 1309 · Apertura 17 0000 001 · Gestión 2026
            </span>
          </div>

          {/* CONTENEDOR DE LA PLANILLA INSTITUCIONAL */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            {/* ENCABEZADO INSTITUCIONAL OFICIAL (REPLICA EXACTA DEL DOCUMENTO) */}
            <div className="bg-amber-100/70 border-b border-amber-300 p-4 text-xs space-y-2 text-slate-900">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border border-amber-300/80 bg-amber-50/80 p-2.5 rounded">
                <div className="font-bold text-amber-950 uppercase text-[11px] flex items-center">
                  <span className="px-2 py-0.5 bg-amber-200 rounded font-black mr-2">
                    {selectedForma === 'forma1' ? 'FORMA 1' : selectedForma === 'forma2' ? 'FORMA 2' : 'FORMA 3'}
                  </span>
                  Objetivo de Desarrollo:
                </div>
                <div className="md:col-span-2 font-bold text-slate-900 uppercase text-xs">
                  FORTALECER LA CAPACIDAD DE GESTIÓN ADMINISTRATIVA, FINANCIERA Y OPERATIVA DEL GOBIERNO MUNICIPAL
                </div>
                <div className="text-right text-[11px] font-semibold text-slate-700">
                  <span>Fecha Inicio: <strong>Ene-2026</strong></span> · <span>Fecha Cierre: <strong>Dic-2026</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                <div className="p-1.5 bg-white/80 rounded border border-amber-200">
                  <span className="font-bold text-slate-600 block text-[10px]">CÓDIGO / ENTIDAD EJECUTORA:</span>
                  <span className="font-bold text-slate-900 font-mono">1309 · GOBIERNO AUTÓNOMO MUNICIPAL DE SUCRE</span>
                </div>
                <div className="p-1.5 bg-white/80 rounded border border-amber-200">
                  <span className="font-bold text-slate-600 block text-[10px]">ESTRUCTURA PROGRAMÁTICA:</span>
                  <span className="font-bold text-slate-900 font-mono">17 0000 001 · UNIDAD DE PLANIFICACIÓN Y SEGUIMIENTO</span>
                </div>
                <div className="p-1.5 bg-white/80 rounded border border-amber-200">
                  <span className="font-bold text-slate-600 block text-[10px]">RESPONSABLE DE UNIDAD:</span>
                  <span className="font-bold text-slate-900">Lic. Willys Flores Sánchez (Técnico de Planificación)</span>
                </div>
              </div>
            </div>

            {/* TABLA 1: FORMA 1 (PROPÓSITOS Y RESULTADOS ESPERADOS) */}
            {selectedForma === 'forma1' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center w-16 border-r border-slate-200">Código Obj. Inm.</th>
                      <th className="p-2.5 border-r border-slate-200">Propósitos de la Unidad (Objetivos Inmediatos)</th>
                      <th className="p-2.5 border-r border-slate-200">Resultados Esperados</th>
                      <th className="p-2.5 text-center w-20 border-r border-slate-200">Gestión</th>
                      <th className="p-2.5">Indicadores Oficiales de Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-bold font-mono text-slate-700 border-r border-slate-200">1</td>
                      <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-200">
                        Implementados la Planificación Operativa Individual (POAIs), la Planificación Mensual y el Calendario de Coordinación Semanal.
                      </td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-200 space-y-1">
                        <p>· Carpetas de planificación operativa individual elaboradas por unidad.</p>
                        <p>· Carpetas de planificación mensual elaboradas por unidad.</p>
                        <p>· Calendario de coordinación semanal elaborado por unidad.</p>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-600 border-r border-slate-200">2026</td>
                      <td className="p-2.5 text-slate-700 space-y-1 font-medium">
                        <span className="block text-emerald-700 font-bold">100% Actividades anuales planificadas</span>
                        <span className="block">100% Actividades mensuales planificadas</span>
                        <span className="block">100% Actividades semanales coordinadas</span>
                      </td>
                    </tr>

                    {/* OBJETIVO 2: FUNDAMENTO DIRECTO DEL SISTEMA DE GERENCIA DE PROYECTOS (SGP) */}
                    <tr className="bg-sky-50/80 border-y-2 border-sky-300">
                      <td className="p-2.5 text-center font-black font-mono text-sky-800 border-r border-sky-200">2</td>
                      <td className="p-2.5 font-bold text-sky-950 border-r border-sky-200">
                        <div className="flex items-center space-x-1.5 text-sky-700 font-extrabold text-[10px] uppercase mb-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>Fundamento Normativo del Sistema</span>
                        </div>
                        Implementada la Matriz de Seguimiento y Monitoreo de Planes, Proyectos y Actividades e Implementado el Sistema de Gerencia de Proyectos (SGPs).
                      </td>
                      <td className="p-2.5 text-sky-900 border-r border-sky-200 space-y-1 font-semibold">
                        <p className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-sky-600 mr-1.5"></span> Carpetas de seguimiento y monitoreo armado por proyecto.</p>
                        <p className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-sky-600 mr-1.5"></span> Carpetas digitales de gerencia de proyectos armado por proyecto (SGP Web).</p>
                      </td>
                      <td className="p-2.5 text-center font-mono font-extrabold text-sky-900 border-r border-sky-200">2026</td>
                      <td className="p-2.5 space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          ✓ 100% Proyectos monitoreados en tiempo real
                        </span>
                        <span className="block text-sky-900 font-bold text-[11px]">
                          100% Proyectos gerenciados con Línea Base y Curva S
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-bold font-mono text-slate-700 border-r border-slate-200">3</td>
                      <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-200">
                        Elaborado y Ejecutado el Plan Operativo Anual (POA) y Planes Sectoriales de Inversión Municipal.
                      </td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-200 space-y-1">
                        <p>· Plan operativo anual formulado y articulado con PTDI.</p>
                        <p>· Plan operativo anual ajustado, reformulado con control de desvíos.</p>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-600 border-r border-slate-200">2026</td>
                      <td className="p-2.5 text-slate-700 space-y-1 font-medium">
                        <span className="block font-semibold">100% Gestión institucional articulada</span>
                        <span className="block">100% Planificación evaluada y retroalimentada</span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-bold font-mono text-slate-700 border-r border-slate-200">4</td>
                      <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-200">
                        Elaborado y Evaluado los Reportes Gerenciales de la Ejecución Físico-Financiera del Plan Operativo Anual (POA).
                      </td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-200">
                        Matriz de ejecución físico-financiera elaborada bimestralmente por proyecto.
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-600 border-r border-slate-200">2026</td>
                      <td className="p-2.5 text-slate-700 space-y-1 font-medium">
                        <span className="block text-emerald-700 font-bold">≥ 80% Ejecución Financiera Presupuestada</span>
                        <span className="block text-sky-700 font-bold">≥ 85% Avance Físico Auditado en Obras</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA 2: FORMA 2 (METAS DE GESTIÓN) */}
            {selectedForma === 'forma2' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center w-24 border-r border-slate-200">Código Obj. Inm.</th>
                      <th className="p-2.5 text-center w-24 border-r border-slate-200">Cod. Meta</th>
                      <th className="p-2.5 border-r border-slate-200">Metas de Gestión Asignadas</th>
                      <th className="p-2.5 text-center w-28">Responsable Directo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* Metas Objetivo 1 */}
                    <tr>
                      <td rowSpan={4} className="p-2.5 text-center font-bold font-mono text-slate-700 border-r border-slate-200 bg-slate-50/50">1</td>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">1.1</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Formulación y consolidación de los POAIs de todas las secretarías y direcciones municipales.</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Dir. Planificación</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">1.2</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Elaboración y seguimiento a la matriz de planificación mensual de unidades organizacionales.</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Dir. Planificación</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">1.3</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Coordinación de reuniones semanales de gabinete con el Despacho del Alcalde.</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Sec. General</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">1.4</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Evaluación del desempeño operativo individualizado semestral.</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Recursos Humanos</td>
                    </tr>

                    {/* Metas Objetivo 2 (GERENCIA DE PROYECTOS SGP) */}
                    <tr className="bg-sky-50/60 font-semibold">
                      <td rowSpan={4} className="p-2.5 text-center font-black font-mono text-sky-800 border-r border-sky-200 bg-sky-100/50">2</td>
                      <td className="p-2 text-center font-mono font-bold text-sky-800 border-r border-sky-200">2.1</td>
                      <td className="p-2 text-sky-950 border-r border-sky-200">
                        <strong>Monitoreo de Infraestructura Vial Troncal:</strong> Seguimiento físico y control de desvíos en pavimentación y drenaje pluvial (Av. Marcelo Quiroga).
                      </td>
                      <td className="p-2 text-center text-sky-900 text-[11px]">Dir. Obras Públicas</td>
                    </tr>
                    <tr className="bg-sky-50/60 font-semibold">
                      <td className="p-2 text-center font-mono font-bold text-sky-800 border-r border-sky-200">2.2</td>
                      <td className="p-2 text-sky-950 border-r border-sky-200">
                        <strong>Monitoreo de Infraestructura Hospitalaria y Social:</strong> Seguimiento a la construcción del Centro Integral de Salud Lajastambo.
                      </td>
                      <td className="p-2 text-center text-sky-900 text-[11px]">Dir. Salud / Obras</td>
                    </tr>
                    <tr className="bg-sky-50/60 font-semibold">
                      <td className="p-2 text-center font-mono font-bold text-sky-800 border-r border-sky-200">2.3</td>
                      <td className="p-2 text-sky-950 border-r border-sky-200">
                        <strong>Conservación y Restauración Patrimonial:</strong> Supervisión a la conservación de fachadas y cubiertas del Centro Histórico de Sucre.
                      </td>
                      <td className="p-2 text-center text-sky-900 text-[11px]">PRAHS / Patrimonio</td>
                    </tr>
                    <tr className="bg-sky-50/60 font-semibold">
                      <td className="p-2 text-center font-mono font-bold text-sky-800 border-r border-sky-200">2.4</td>
                      <td className="p-2 text-sky-950 border-r border-sky-200">
                        <strong>Implementación y Puesta en Marcha del Sistema de Gerencia de Proyectos (SGP Web):</strong> Digitalización de la Línea Base, EDT y Curva S.
                      </td>
                      <td className="p-2 text-center text-sky-900 text-[11px]">Unidad de Sistemas / Planif.</td>
                    </tr>

                    {/* Metas Objetivo 3 */}
                    <tr>
                      <td rowSpan={3} className="p-2.5 text-center font-bold font-mono text-slate-700 border-r border-slate-200 bg-slate-50/50">3</td>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">3.1</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Consolidación del Anteproyecto del POA y presupuesto plurianual institucional.</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Dir. Planificación</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">3.2</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Remisión y aprobación del POA ante el Concejo Municipal de Sucre y Viceministerio.</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Despacho Alcalde</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">3.3</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Ajuste y reformulaciones presupuestarias cuatrimestrales conforme a ingresos reales.</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Dir. Finanzas</td>
                    </tr>

                    {/* Metas Objetivo 4 */}
                    <tr>
                      <td rowSpan={3} className="p-2.5 text-center font-bold font-mono text-slate-700 border-r border-slate-200 bg-slate-50/50">4</td>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">4.1</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Emisión bimestral del Informe Oficial de Avance Físico-Financiero para el Concejo Municipal.</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Dir. Planificación</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">4.2</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Monitoreo de semáforos de desvío y emisión de alertas de sobrepago a Contraloría.</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Fiscalización</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">4.3</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200">Rendición Pública de Cuentas Inicial y Final ante las Juntas Vecinales y Control Social (Ley 341).</td>
                      <td className="p-2 text-center text-slate-600 text-[11px]">Despacho Alcalde</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA 3: FORMA 3 (PROGRAMACIÓN TRIMESTRAL, CUANTIFICADORES Y % ADECUADO) */}
            {selectedForma === 'forma3' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                    <tr>
                      <th className="p-2 text-center border-r border-slate-200">Obj.</th>
                      <th className="p-2 text-center border-r border-slate-200">Meta</th>
                      <th className="p-2 text-center border-r border-slate-200">Cód. Act.</th>
                      <th className="p-2 border-r border-slate-200">ACTIVIDADES OPERATIVAS / OBRAS</th>
                      <th className="p-2 text-center border-r border-slate-200">Cuantificador (Meta Física)</th>
                      <th className="p-2 text-center border-r border-slate-200" colSpan={4}>Programación Trimestral (T1-T4)</th>
                      <th className="p-2 text-center border-r border-slate-200">Fechas Ini - Fin</th>
                      <th className="p-2 text-center border-r border-slate-200">Peso Meta (%)</th>
                      <th className="p-2 text-center bg-sky-100/80 text-sky-900">% Adecuado (Ponderado)</th>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-300">
                      <th colSpan={5} className="border-r border-slate-200"></th>
                      <th className="p-1 text-center w-8 border-r border-slate-200">T1</th>
                      <th className="p-1 text-center w-8 border-r border-slate-200">T2</th>
                      <th className="p-1 text-center w-8 border-r border-slate-200">T3</th>
                      <th className="p-1 text-center w-8 border-r border-slate-200">T4</th>
                      <th colSpan={3}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* OBRA 1: MARCELO QUIROGA */}
                    <tr className="hover:bg-slate-50">
                      <td rowSpan={3} className="p-2 text-center font-bold font-mono text-slate-700 border-r border-slate-200 bg-slate-50/50">2</td>
                      <td rowSpan={3} className="p-2 text-center font-bold font-mono text-sky-800 border-r border-slate-200 bg-sky-50/30">2.1</td>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">2.1.1</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200 font-medium">
                        Excavación y conformación de subrasante (Av. Marcelo Quiroga)
                      </td>
                      <td className="p-2 text-center font-bold border-r border-slate-200">4.500 m³</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">2.000</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">2.500</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-2 text-center text-[11px] text-slate-500 border-r border-slate-200">15/01 - 15/03</td>
                      <td className="p-2 text-center font-mono font-bold border-r border-slate-200">30%</td>
                      <td className="p-2 text-center font-bold text-emerald-700 bg-emerald-50/50">
                        13.00% <span className="text-[10px] text-emerald-600 block">(Ejecutado: 43.3% x 30%)</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">2.1.2</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200 font-medium">
                        Pavimentación con losas de hormigón simple e=20cm
                      </td>
                      <td className="p-2 text-center font-bold border-r border-slate-200">2.500 m²</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">1.000</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">1.500</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-2 text-center text-[11px] text-slate-500 border-r border-slate-200">01/04 - 30/07</td>
                      <td className="p-2 text-center font-mono font-bold border-r border-slate-200">50%</td>
                      <td className="p-2 text-center font-bold text-slate-600 bg-slate-50">
                        0.00% <span className="text-[10px] text-slate-400 block">(Inicia en T2)</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">2.1.3</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200 font-medium">
                        Construcción de cunetas y señalización vial reflectiva
                      </td>
                      <td className="p-2 text-center font-bold border-r border-slate-200">1.800 ml</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">1.000</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">800</td>
                      <td className="p-2 text-center text-[11px] text-slate-500 border-r border-slate-200">01/07 - 30/08</td>
                      <td className="p-2 text-center font-mono font-bold border-r border-slate-200">20%</td>
                      <td className="p-2 text-center font-bold text-slate-600 bg-slate-50">
                        0.00% <span className="text-[10px] text-slate-400 block">(Inicia en T3)</span>
                      </td>
                    </tr>

                    {/* OBRA 2: CENTRO INTEGRAL DE SALUD LAJASTAMBO */}
                    <tr className="hover:bg-slate-50 border-t-2 border-slate-300">
                      <td rowSpan={2} className="p-2 text-center font-bold font-mono text-slate-700 border-r border-slate-200 bg-slate-50/50">2</td>
                      <td rowSpan={2} className="p-2 text-center font-bold font-mono text-sky-800 border-r border-slate-200 bg-sky-50/30">2.2</td>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">2.2.1</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200 font-medium">
                        Estructura de hormigón armado y muros perimetrales (Lajastambo)
                      </td>
                      <td className="p-2 text-center font-bold border-r border-slate-200">1.200 m²</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">400</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">800</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-2 text-center text-[11px] text-slate-500 border-r border-slate-200">01/02 - 30/06</td>
                      <td className="p-2 text-center font-mono font-bold border-r border-slate-200">60%</td>
                      <td className="p-2 text-center font-bold text-amber-700 bg-amber-50/50">
                        7.50% <span className="text-[10px] text-amber-600 block">(Atraso por lluvias)</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">2.2.2</td>
                      <td className="p-2 text-slate-800 border-r border-slate-200 font-medium">
                        Instalaciones eléctricas y sanitarias hospitalarias
                      </td>
                      <td className="p-2 text-center font-bold border-r border-slate-200">1 Global</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-1 text-center text-slate-300 border-r border-slate-200">-</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">0.5</td>
                      <td className="p-1 text-center bg-amber-100/80 font-bold border-r border-slate-200">0.5</td>
                      <td className="p-2 text-center text-[11px] text-slate-500 border-r border-slate-200">01/07 - 31/10</td>
                      <td className="p-2 text-center font-mono font-bold border-r border-slate-200">40%</td>
                      <td className="p-2 text-center font-bold text-slate-600 bg-slate-50">
                        0.00% <span className="text-[10px] text-slate-400 block">(Inicia en T3)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* PIE DE FIRMAS DE VALIDACIÓN INSTITUCIONAL */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Planilla oficial generada automáticamente a partir de la Línea Base congelada del SGP.</span>
              </div>

              <div className="flex items-center space-x-6 text-center text-[11px]">
                <div className="border-t border-slate-400 pt-1 px-4">
                  <span className="font-bold text-slate-900 block">Lic. Willys Flores Sánchez</span>
                  <span className="text-slate-500">Técnico de Planificación</span>
                </div>
                <div className="border-t border-slate-400 pt-1 px-4">
                  <span className="font-bold text-slate-900 block">Ing. Héctor Arce Rodríguez</span>
                  <span className="text-slate-500">Honorable Alcalde Municipal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: ÁRBOL DE TRAZABILIDAD INTERACTIVO */}
      {activeMainTab === 'tree' && (
        <div className="space-y-6 animate-fadeIn">
          {treeData.map((area) => (
            <div key={area.id} className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-5">
              {/* Cabecera del Área */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {area.code}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {area.name}
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200 self-start sm:self-auto">
                  Ponderación en Plan Municipal: {area.weight_percentage}%
                </span>
              </div>

              {/* Objetivos del Área */}
              <div className="space-y-5">
                {area.objectives && area.objectives.length > 0 ? (
                  area.objectives.map((obj: any) => (
                    <div key={obj.id} className="pl-0 sm:pl-3 border-l-0 sm:border-l-2 sm:border-indigo-200 space-y-3">
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-500">{obj.code}</span>
                            <span className="text-[11px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                              Gestión {obj.target_year}
                            </span>
                          </div>
                          <h3 className="font-bold text-xs sm:text-sm text-slate-800 mt-0.5">
                            {obj.description}
                          </h3>
                        </div>
                      </div>

                      {/* Indicadores del Objetivo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-2">
                        {obj.indicators && obj.indicators.length > 0 ? (
                          obj.indicators.map((ind: any) => (
                            <div
                              key={ind.id}
                              className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-indigo-300 transition-all space-y-2.5 text-xs shadow-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-mono text-[10px] font-bold text-slate-400">
                                    {ind.code}
                                  </span>
                                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                                    {ind.name}
                                  </h4>
                                </div>
                                {getTrafficLightBadge(ind.traffic_light)}
                              </div>

                              {/* Medición y Progreso */}
                              <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
                                <div className="flex justify-between font-semibold">
                                  <span className="text-slate-500">Ejecutado Acumulado:</span>
                                  <span className="text-slate-900 font-bold">
                                    {ind.current_value} / {ind.target_value} {ind.unit_of_measure}
                                  </span>
                                </div>

                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-1.5 rounded-full ${
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
                                  <span>Cumplimiento: <strong>{ind.progress_pct}%</strong></span>
                                  <span>Medición: {ind.frequency}</span>
                                </div>
                              </div>

                              {/* Proyectos Vinculados que alimentan este indicador */}
                              <div className="pt-1.5 border-t border-slate-200">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  Obras que tributan a esta meta:
                                </span>
                                {ind.linked_projects && ind.linked_projects.length > 0 ? (
                                  <div className="space-y-1">
                                    {ind.linked_projects.map((p: any) => (
                                      <div
                                        key={p.id}
                                        onClick={() => onSelectProject && onSelectProject(p.id)}
                                        className="p-1.5 px-2 rounded bg-white border border-slate-200 text-[11px] flex items-center justify-between cursor-pointer hover:border-sky-400 transition-all"
                                      >
                                        <span className="font-semibold text-slate-800 truncate mr-2">
                                          {p.code} - {p.name}
                                        </span>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-400 italic">
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
      )}

      {/* VISTA 3: EXPLICACIÓN MATEMÁTICA DEL CÁLCULO PONDERADO DEL PORCENTAJE */}
      {activeMainTab === 'formulas' && (
        <div className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-6 text-xs sm:text-sm animate-fadeIn">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-emerald-600" />
              ¿Cómo calcula el sistema el Porcentaje Adecuado de los Proyectos?
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Fórmula matemática de agregación ascendente por ponderación de pesos (Módulo 3.3 y Ley 1178).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center font-bold">1</span>
                <span>Nivel Actividad (Físico)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Se calcula comparando las cantidades medidas y aprobadas en terreno contra el cuantificador de la meta.
              </p>
              <div className="p-2.5 bg-white rounded border border-slate-300 font-mono text-[11px] text-indigo-950 font-bold">
                Avance_Act = (Cant_Ejecutada / Meta_Total) × 100
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-sky-700 font-bold text-xs uppercase">
                <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center font-bold">2</span>
                <span>Nivel Componente / Meta</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada actividad tiene un peso (%) específico. El avance del componente es la sumatoria de sus actividades ponderadas.
              </p>
              <div className="p-2.5 bg-white rounded border border-slate-300 font-mono text-[11px] text-sky-950 font-bold">
                Avance_Comp = Σ (Avance_Act_i × Peso_i / 100)
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center font-bold">3</span>
                <span>Nivel Proyecto y POA</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                El avance oficial del proyecto resulta de ponderar los componentes según su incidencia contractual (100%).
              </p>
              <div className="p-2.5 bg-white rounded border border-slate-300 font-mono text-[11px] text-emerald-950 font-bold">
                Avance_Proyecto = Σ (Avance_Comp_j × Peso_j / 100)
              </div>
            </div>
          </div>

          {/* Comparación Semafórica Normativa */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Índice de Cumplimiento (Ic) y Regla Semafórica de Alertas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-800 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  Semáforo Verde: En Ruta (≥ 90%)
                </span>
                <p className="text-[11px] text-emerald-700">
                  La ejecución real marcha al ritmo planificado en la Línea Base.
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded border border-amber-200 space-y-1">
                <span className="font-bold text-amber-800 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
                  Semáforo Amarillo: En Riesgo (70% - 89%)
                </span>
                <p className="text-[11px] text-amber-700">
                  Señales de desaceleración. Requiere plan de contingencia técnico.
                </p>
              </div>

              <div className="p-3 bg-rose-50 rounded border border-rose-200 space-y-1">
                <span className="font-bold text-rose-800 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-1.5"></span>
                  Semáforo Rojo: Desvío Crítico (&lt; 70%)
                </span>
                <p className="text-[11px] text-rose-700">
                  Desvío contractual grave. Requiere reprogramación obligatoria (Línea Base v2).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Indicador */}
      {showNewIndicatorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                Registrar Nuevo Indicador POA
              </h3>
              <button 
                onClick={() => setShowNewIndicatorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIndicator} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Objetivo Estratégico Asociado</label>
                <select
                  value={selectedObjectiveId}
                  onChange={(e) => setSelectedObjectiveId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-slate-800 font-semibold"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 font-mono font-bold"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Indicador</label>
                  <input
                    type="text"
                    value={indName}
                    onChange={(e) => setIndName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 font-semibold"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meta Anual</label>
                  <input
                    type="number"
                    value={indTarget}
                    onChange={(e) => setIndTarget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 font-bold"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewIndicatorModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
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
