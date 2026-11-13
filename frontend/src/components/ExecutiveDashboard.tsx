import React from 'react';
import { 
  TrendingUp, AlertTriangle, CheckCircle2, Clock, 
  BarChart3, FolderKanban, ShieldAlert, ArrowUpRight, ChevronRight, FileSpreadsheet, Download
} from 'lucide-react';
import { ExecutiveSummary } from '../types';

interface ExecutiveDashboardProps {
  summary: ExecutiveSummary;
  onSelectProject: (projectId: string) => void;
  onNavigateToReport?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  summary,
  onSelectProject,
  onNavigateToReport,
}) => {
  const getTrafficLightBadge = (color: 'green' | 'yellow' | 'red') => {
    switch (color) {
      case 'green':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            EN RUTA (≥90%)
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
            EN RIESGO (70-89%)
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-600 mr-1.5 animate-ping"></span>
            DESVÍO CRÍTICO (&lt;70%)
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportExcel = () => {
    const headers = [
      'Código Proyecto',
      'Nombre de la Obra',
      'Área Estratégica',
      'Presupuesto Asignado (Bs.)',
      'Avance Físico Real (%)',
      'Avance Programado (%)',
      'Índice de Cumplimiento',
      'Semáforo de Gestión',
      'Estado'
    ];

    const rows: string[][] = [];
    summary.areas_summary.forEach((area) => {
      (area.projects_summary || []).forEach((p) => {
        rows.push([
          `"${p.code}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${area.name}"`,
          String(p.budget_allocated || 0),
          String(p.real_progress_pct),
          String(p.planned_progress_pct),
          String(p.compliance_index),
          p.traffic_light.toUpperCase(),
          `"${p.status}"`
        ]);
      });
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SGP_Reporte_Ejecucion_Fisica_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner Superior Institucional */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold tracking-widest uppercase mb-2">
              <BarChart3 className="w-4 h-4" />
              <span>Despacho del Alcalde · Gestión y Control Estratégico</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tablero General de Ejecución Física
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Monitoreo en tiempo real del cumplimiento de obras y proyectos, articulado con el Plan Territorial (PTDI) y POA municipal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-2 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-emerald-500 transition-all shadow-sm"
              title="Descargar matriz en Excel para remisión al Concejo y Planificación"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel (CSV)</span>
            </button>

            <button
              onClick={() => onNavigateToReport ? onNavigateToReport() : window.print()}
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Informe Imprimible</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPIs Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Avance Real Ponderado */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avance Real Global</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {summary.global_real_progress_pct}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              de meta física anual
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-sky-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(summary.global_real_progress_pct, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Avance Programado a la Fecha */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta Programada</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {summary.global_planned_progress_pct}%
            </span>
            <span className="text-xs font-medium text-slate-500">esperado al mes</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(summary.global_planned_progress_pct, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Índice de Cumplimiento & Semáforo */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Índice Cumplimiento</span>
            {getTrafficLightBadge(summary.global_traffic_light)}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {(summary.global_compliance_index * 100).toFixed(0)}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              (Real / Programado)
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {summary.global_compliance_index >= 0.90 
              ? 'La gestión global avanza a buen ritmo de cronograma.'
              : summary.global_compliance_index >= 0.70
              ? 'Atención: requiere supervisión de desvíos menores.'
              : 'Alerta: se requiere reprogramación y acciones correctivas.'}
          </p>
        </div>

        {/* Proyectos Críticos en Alerta */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Obras en Alerta Roja</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-rose-600">
              {summary.critical_projects_count}
            </span>
            <span className="text-xs font-medium text-slate-500">
              de {summary.total_projects} obras activas
            </span>
          </div>
          <p className="mt-3 text-xs text-rose-600 font-semibold flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Desvío de cronograma superior al 30%
          </p>
        </div>
      </div>

      {/* Desglose por Secretarías / Áreas Estratégicas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Cumplimiento por Secretaría y Área Estratégica
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Cálculo ponderado del avance físico a partir de las obras de cada unidad.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Verde ≥90%
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> Amarillo 70-89%
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2"></span> Rojo &lt;70%
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {summary.areas_summary.map((area) => (
            <div 
              key={area.area_id}
              className="p-5 rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50/50"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {area.code}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Peso Institucional: {area.weight_pct}%
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1">
                    {area.name}
                  </h3>
                </div>
                {getTrafficLightBadge(area.traffic_light)}
              </div>

              {/* Barras de comparación: Real vs Programado */}
              <div className="space-y-2.5 my-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Avance Real Ejecutado</span>
                    <span className="text-sky-700 font-bold">{area.real_progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-sky-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(area.real_progress_pct, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Meta Programada a la Fecha</span>
                    <span className="text-slate-700">{area.planned_progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-slate-400 h-2 rounded-full"
                      style={{ width: `${Math.min(area.planned_progress_pct, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span>{area.total_projects} proyecto(s) asignado(s)</span>
                <span className="font-bold text-slate-700">
                  Cumplimiento: {(area.compliance_index * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de Proyectos Críticos en Alerta Roja (Reflejo Diapositiva 10) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Obras con Desvío Crítico (Semáforo Rojo)
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Proyectos donde la ejecución física se encuentra por debajo del 70% de lo programado. Requieren justificación o intervención.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Código / Proyecto</th>
                <th className="py-3 px-4">Área Estratégica</th>
                <th className="py-3 px-4">Presupuesto</th>
                <th className="py-3 px-4 text-center">Real vs Prog.</th>
                <th className="py-3 px-4 text-center">Cumplimiento</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {summary.critical_projects.map((proj) => (
                <tr key={proj.project_id} className="hover:bg-rose-50/40 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    <span className="text-xs font-mono font-bold text-slate-500 block mb-0.5">
                      {proj.code}
                    </span>
                    {proj.name}
                  </td>
                  <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                    {proj.area_name}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800 text-xs">
                    Bs. {proj.budget.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-xs font-bold text-rose-600">
                      {proj.real_progress_pct}% <span className="text-slate-400 font-normal">/ {proj.planned_progress_pct}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                      {(proj.compliance_index * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => onSelectProject(proj.project_id)}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <span>Ver Ficha</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

