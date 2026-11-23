import React from 'react';
import { 
  TrendingUp, AlertTriangle, Clock, 
  BarChart3, ShieldAlert, ChevronRight, FileSpreadsheet, Download,
  Layers, ArrowUpRight
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
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
            EN RUTA (≥90%)
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
            EN RIESGO (70-89%)
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5"></span>
            DESVÍO (&lt;70%)
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
    link.setAttribute('download', `SGP_Sucre_Ejecucion_Fisica_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Encabezado Ejecutivo Institucional */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Despacho de Alcaldía
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500">Gestión Fiscal 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tablero de Ejecución Física e Inversión Pública
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Seguimiento de obras en tiempo real articuladas con el Plan Territorial (PTDI) y POA municipal.
          </p>
        </div>

        {/* Acciones de Exportación y Reporte */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 transition-colors shadow-2xs"
            title="Descargar matriz en Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exportar Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>

          <button
            onClick={() => onNavigateToReport ? onNavigateToReport() : window.print()}
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Informe Oficial</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjetas KPIs Principales */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Avance Real Global */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avance Físico Real</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {summary.global_real_progress_pct}%
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Promedio ponderado municipal</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-sky-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(summary.global_real_progress_pct, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 2: Meta Programada */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Meta Programada</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-700">
              {summary.global_planned_progress_pct}%
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Cronograma contractual a la fecha</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-slate-400 h-1.5 rounded-full"
              style={{ width: `${Math.min(summary.global_planned_progress_pct, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 3: Índice de Cumplimiento */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cumplimiento</span>
            {getTrafficLightBadge(summary.global_traffic_light)}
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {(summary.global_compliance_index * 100).toFixed(0)}%
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Relación Real / Planificado</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium truncate">
            {summary.global_compliance_index >= 0.90 ? 'En ruta óptima' : 'Requiere seguimiento'}
          </div>
        </div>

        {/* KPI 4: Obras en Alerta Roja */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-rose-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Obras Críticas</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-700">
              {summary.critical_projects_count}
            </div>
            <span className="text-[11px] text-rose-600/80 font-medium">de {summary.total_projects} proyectos</span>
          </div>
          <div className="text-[11px] text-rose-700 font-semibold flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
            Desvío mayor al 30%
          </div>
        </div>
      </div>

      {/* 3. Desglose por Secretarías Municipales */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Ejecución por Secretaría y Área Estratégica
            </h2>
            <p className="text-xs text-slate-500">
              Ponderación de avances de obras vinculadas a objetivos de desarrollo municipal.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> ≥90%</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span> 70-89%</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span> &lt;70%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {summary.areas_summary.map((area) => (
            <div 
              key={area.area_id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                      {area.code}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Peso: {area.weight_pct}%
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">
                    {area.name}
                  </h3>
                </div>
                {getTrafficLightBadge(area.traffic_light)}
              </div>

              {/* Comparación: Real vs Programado */}
              <div className="space-y-2 my-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-0.5">
                    <span className="text-slate-600">Avance Real</span>
                    <span className="font-bold font-mono text-slate-900">{area.real_progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-sky-600 h-2 rounded-full"
                      style={{ width: `${Math.min(area.real_progress_pct, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-0.5">
                    <span className="text-slate-500">Programado</span>
                    <span className="font-mono text-slate-600">{area.planned_progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-slate-400 h-2 rounded-full"
                      style={{ width: `${Math.min(area.planned_progress_pct, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{area.total_projects} obra(s) registrada(s)</span>
                <span className="font-bold text-slate-800">
                  Cumplimiento: {(area.compliance_index * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Obras con Desvío Crítico (Alerta Roja) - Adaptable Desktop / Tablet / Celular */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-rose-200 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-4 pb-3 border-b border-rose-100">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Obras con Desvío Crítico en Ejecución
            </h2>
            <p className="text-xs text-slate-500">
              Proyectos con avance físico inferior al 70% de la programación oficial. Requieren reprogramación justificada.
            </p>
          </div>
        </div>

        {/* Vista para Tablet y Desktop (Tabla Tradicional) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-2.5 px-3">Código / Proyecto</th>
                <th className="py-2.5 px-3">Secretaría</th>
                <th className="py-2.5 px-3">Presupuesto</th>
                <th className="py-2.5 px-3 text-center">Real vs Prog.</th>
                <th className="py-2.5 px-3 text-center">Cumplimiento</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {summary.critical_projects.map((proj) => (
                <tr key={proj.project_id} className="hover:bg-rose-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-500 block text-[10px]">
                      {proj.code}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{proj.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {proj.area_name}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    Bs. {proj.budget.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">
                    {proj.real_progress_pct}% <span className="text-slate-400 font-normal">/ {proj.planned_progress_pct}%</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                      {(proj.compliance_index * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectProject(proj.project_id)}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
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

        {/* Vista para Celular (Tarjetas Verticales Táctiles) */}
        <div className="sm:hidden space-y-3">
          {summary.critical_projects.map((proj) => (
            <div 
              key={proj.project_id}
              className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-200 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-500">{proj.code}</span>
                  <h4 className="font-bold text-slate-900 text-xs mt-0.5">{proj.name}</h4>
                  <span className="text-[11px] text-slate-500">{proj.area_name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex-shrink-0">
                  {(proj.compliance_index * 100).toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-rose-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Presupuesto</span>
                  <span className="font-mono font-bold text-slate-900">Bs. {proj.budget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Real vs Prog.</span>
                  <span className="font-mono font-bold text-rose-600">{proj.real_progress_pct}% / {proj.planned_progress_pct}%</span>
                </div>
              </div>

              <button
                onClick={() => onSelectProject(proj.project_id)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
              >
                <span>Inspeccionar Ficha Técnica</span>
                <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
