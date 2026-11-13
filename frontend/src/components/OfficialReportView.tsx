import React, { useState, useEffect } from 'react';
import { 
  Printer, Download, Building2, CheckCircle2, AlertTriangle, 
  Clock, ShieldCheck, ArrowLeft, FileCheck, Layers, FileSpreadsheet
} from 'lucide-react';
import { dashboardService } from '../services/api';

interface OfficialReportViewProps {
  onBack: () => void;
}

export const OfficialReportView: React.FC<OfficialReportViewProps> = ({ onBack }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<string>('Bimestre I / Gestión 2026');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getOfficialReport();
        setReportData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!reportData) return;
    const headers = [
      'Código',
      'Proyecto / Obra',
      'Área Estratégica',
      'Presupuesto Oficial (Bs.)',
      'Fecha Inicio',
      'Fecha Fin',
      'Versión LB',
      'Avance Real (%)',
      'Avance Prog. (%)',
      'Cumplimiento',
      'Semáforo',
      'Causa de Desvío'
    ];

    const rows = (reportData.projects_detailed || []).map((p: any) => [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.area_name}"`,
      p.budget,
      p.start_date,
      p.end_date,
      `v${p.baseline_version}`,
      p.real_progress_pct,
      p.planned_progress_pct,
      p.compliance_index,
      p.traffic_light.toUpperCase(),
      `"${p.variance_reason}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r: any) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportData.report_code}_Matriz_Fisico_Financiera.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !reportData) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm font-semibold">
        Generando Informe Oficial de Rendición de Cuentas...
      </div>
    );
  }

  const { summary, projects_detailed, signers } = reportData;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Barra de Acciones (Oculta al imprimir) */}
      <div className="print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Tablero</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <span>Período:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold"
            >
              <option value="Bimestre I / Gestión 2026">Bimestre I / Gestión 2026</option>
              <option value="Primer Trimestre / POA 2026">Primer Trimestre / POA 2026</option>
              <option value="Primer Semestre / POA 2026">Primer Semestre / POA 2026</option>
              <option value="Informe Anual de Gestión">Informe Anual de Gestión</option>
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all"
            title="Descargar matriz en Excel para remisión al Concejo y Planificación"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar a PDF</span>
          </button>
        </div>
      </div>

      {/* HOJA DE INFORME OFICIAL (FORMATO IMPRESIÓN Y LECTURA) */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 space-y-8 font-serif">
        
        {/* Encabezado Oficial Institucional */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1">
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-600">
            ESTADO PLURINACIONAL DE BOLIVIA
          </p>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
            {reportData.institution_name}
          </h1>
          <p className="text-xs font-bold uppercase text-slate-600 tracking-wider">
            Dirección de Planificación y Seguimiento a la Inversión Pública
          </p>
          <div className="pt-2 flex items-center justify-center space-x-3 text-xs font-mono font-bold text-slate-700">
            <span className="bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
              {reportData.report_code}
            </span>
            <span>·</span>
            <span>Fecha de Emisión: {reportData.generated_at}</span>
          </div>
        </div>

        {/* Título del Documento */}
        <div className="text-center space-y-1 py-2">
          <h2 className="text-lg font-extrabold uppercase text-slate-900 underline underline-offset-4 tracking-wide">
            INFORME TÉCNICO OFICIAL DE EJECUCIÓN FÍSICA Y CONTROL DE DESVÍOS
          </h2>
          <p className="text-xs font-medium text-slate-600 italic">
            Articulación de Proyectos de Inversión Pública con el Programa Operativo Anual ({period})
          </p>
        </div>

        {/* Cuadro Resumen Ejecutivo de Cumplimiento */}
        <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-3 font-sans">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>1. Resumen Consolidado de Gestión Física Municipal</span>
            <span className="font-mono text-[11px] font-normal text-slate-500">
              Presupuesto Total Auditado: Bs. {reportData.total_budget?.toLocaleString()}
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Obras Registradas</span>
              <span className="text-xl font-extrabold text-slate-900">{summary.total_projects}</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Avance Real Global</span>
              <span className="text-xl font-extrabold text-sky-700">{summary.global_real_progress_pct}%</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Meta Programada</span>
              <span className="text-xl font-extrabold text-slate-700">{summary.global_planned_progress_pct}%</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Semáforo General</span>
              <span className={`text-xs font-black uppercase inline-block px-2 py-0.5 mt-1 rounded ${
                summary.global_traffic_light === 'green' ? 'bg-emerald-100 text-emerald-800' :
                summary.global_traffic_light === 'yellow' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {summary.global_traffic_light === 'green' ? 'En Ruta (≥90%)' :
                 summary.global_traffic_light === 'yellow' ? 'En Riesgo (70-89%)' : 'Desvío Crítico (<70%)'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla Detallada de Obras y Proyectos */}
        <div className="space-y-2 font-sans">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            2. Estado de Ejecución Física por Proyecto e Historial de Línea Base
          </h3>

          <div className="overflow-x-auto border border-slate-300 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Denominación del Proyecto</th>
                  <th className="py-2.5 px-3">Área Estratégica</th>
                  <th className="py-2.5 px-3 text-right">Presupuesto (Bs.)</th>
                  <th className="py-2.5 px-3 text-center">Prog.</th>
                  <th className="py-2.5 px-3 text-center">Real</th>
                  <th className="py-2.5 px-3 text-center">L. Base</th>
                  <th className="py-2.5 px-3 text-center">Semáforo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projects_detailed.map((p: any) => (
                  <tr key={p.code} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{p.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {p.name}
                      {p.traffic_light === 'red' && (
                        <span className="block text-[10px] text-rose-600 font-normal mt-0.5 italic">
                          Causa de retraso: {p.variance_reason}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{p.area_name}</td>
                    <td className="py-2.5 px-3 text-right font-mono">Bs. {p.budget?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600">{p.planned_progress_pct}%</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">{p.real_progress_pct}%</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">v{p.baseline_version}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        p.traffic_light === 'green' ? 'bg-emerald-100 text-emerald-800' :
                        p.traffic_light === 'yellow' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.traffic_light === 'green' ? 'Verde' : p.traffic_light === 'yellow' ? 'Amarillo' : 'Rojo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dictamen Técnico de la Dirección de Planificación */}
        <div className="border-t border-slate-300 pt-4 space-y-2 text-xs leading-relaxed text-slate-700">
          <h3 className="font-bold uppercase text-slate-900">
            3. Dictamen Técnico y Declaración de Veracidad
          </h3>
          <p>
            Se certifica que el presente informe técnico consolida las planillas de medición y avance físico registradas directamente en obra mediante el Sistema de Gerencia de Proyectos Municipal (SGP), respaldadas por fiscalización técnica y fotografías geolocalizadas. Las obras en estado de semáforo rojo cuentan con solicitud formal de reprogramación y justificación documentada conforme a normativa.
          </p>
        </div>

        {/* Bloque Oficial de Firmas y Rúbricas (4 Firmas) */}
        <div className="pt-12 border-t-2 border-slate-900 font-sans">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {signers.map((s: any, idx: number) => (
              <div key={idx} className="space-y-1.5 flex flex-col justify-end">
                <div className="border-t border-slate-800 w-3/4 mx-auto pt-2"></div>
                <p className="font-bold text-xs text-slate-900">{s.name}</p>
                <p className="text-[11px] font-semibold text-slate-600">{s.title}</p>
                <p className="text-[10px] text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pie de Página Institucional */}
        <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400 font-sans">
          Documento generado automáticamente por el Sistema de Gerencia de Proyectos Municipal (SGP SaaS) · Validez para Auditoría y Control Social
        </div>
      </div>
    </div>
  );
};

