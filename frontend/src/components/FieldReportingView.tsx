import React, { useState, useEffect } from 'react';
import { 
  Camera, MapPin, CheckCircle2, AlertCircle, Clock, 
  Send, ShieldCheck, ThumbsUp, ThumbsDown, MessageSquare, Image, Upload, Check, X, FileText
} from 'lucide-react';
import { Project } from '../types';
import { trackingService } from '../services/api';

interface FieldReportingViewProps {
  projects: Project[];
  currentRole: string;
  onRefresh: () => void;
}

export const FieldReportingView: React.FC<FieldReportingViewProps> = ({
  projects,
  currentRole,
  onRefresh,
}) => {
  const isSupervisorRole = currentRole === 'supervisor_fiscal' || currentRole === 'alcalde' || currentRole === 'director_area';
  const [activeSubTab, setActiveSubTab] = useState<'submit' | 'review'>(
    currentRole === 'supervisor_fiscal' ? 'review' : 'submit'
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [executedQuantity, setExecutedQuantity] = useState<number>(100);
  const [evidenceDescription, setEvidenceDescription] = useState<string>('Vaciado e inspección de avance en sector norte');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bandeja de reportes pendientes
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState<boolean>(false);
  const [supervisorComments, setSupervisorComments] = useState<{ [key: string]: string }>({});

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const allActivities = currentProject?.components.flatMap((c) => c.activities) || [];

  const loadPending = async () => {
    try {
      setLoadingPending(true);
      const data = await trackingService.getPendingReports();
      setPendingReports(data);
    } catch (err) {
      console.warn('Error cargando reportes pendientes');
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId) {
      alert('Seleccione una actividad para reportar');
      return;
    }

    try {
      setSubmitting(true);
      await trackingService.submitReport({
        activity_id: selectedActivityId,
        period_date: new Date().toISOString().split('T')[0],
        quantity_executed: executedQuantity,
        evidences: [
          {
            file_name: 'foto_evidencia_campo.jpg',
            file_url: photoUrl,
            file_type: 'image/jpeg',
            file_size_bytes: 1450000,
            latitude: -19.0280,
            longitude: -65.2630,
            captured_at: new Date().toISOString(),
            description: evidenceDescription,
          },
        ],
      });

      setMessage({
        type: 'success',
        text: '¡Avance físico y evidencia fotográfica enviados al Fiscal para validación!',
      });
      setTimeout(() => setMessage(null), 5000);
      loadPending();
      onRefresh();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.detail || 'Error al enviar reporte de campo',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (reportId: string, decision: 'approved' | 'rejected') => {
    try {
      const comment = supervisorComments[reportId] || (decision === 'approved' ? 'Verificado conforme en inspección' : 'Observado por inconsistencia');
      await trackingService.validateReport(reportId, decision, comment);
      setMessage({
        type: 'success',
        text: `Reporte ${decision === 'approved' ? 'Aprobado oficialmente (el avance ya cuenta en el Tablero del Alcalde)' : 'Rechazado con observaciones'}.`,
      });
      setTimeout(() => setMessage(null), 5000);
      loadPending();
      onRefresh();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.detail || 'Error al validar reporte',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Banner Principal Diapositiva 11 */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1">
            <Camera className="w-4 h-4" />
            <span>Módulo de Campo · Registro Móvil y Fiscalización (Diapositiva 11)</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Fiscalización y Captura de Avance con Respaldo
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl">
            El avance se registra en la obra con fotos geolocalizadas (GPS) y pasa por validación formal del fiscalizador antes de sumarse a los indicadores.
          </p>
        </div>

        {/* Pestañas de Modo */}
        <div className="flex bg-black/20 p-1 rounded-2xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('submit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'submit' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Registrar Avance
          </button>
          <button
            onClick={() => {
              setActiveSubTab('review');
              loadPending();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'review' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bandeja del Fiscal</span>
            {pendingReports.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {pendingReports.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* MODO 1: REGISTRO DE AVANCE (RESIDENTE) */}
      {activeSubTab === 'submit' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-900">
                Nuevo Reporte Periódico de Avance
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Paso 4: Reporte
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Proyecto / Obra</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setSelectedActivityId('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Actividad Específica</label>
                <select
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Seleccione la actividad ejecutada --</option>
                  {allActivities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} · {a.name} (Meta: {a.total_target_quantity} {a.unit_of_measure})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cantidad Física Ejecutada en el Periodo
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={executedQuantity}
                  onChange={(e) => setExecutedQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center">
                  <Camera className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Fotografía de Respaldo con Geolocalización
                </span>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">
                    Descripción técnica de la inspección
                  </label>
                  <input
                    type="text"
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs"
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                  <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>GPS: <strong>-19.0280, -65.2630</strong> (Distrito 2, Sucre - Chuquisaca)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Enviando avance...' : 'Registrar Avance y Enviar a Fiscal'}</span>
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center">
                <Image className="w-4 h-4 mr-1.5 text-sky-600" />
                Evidencia en Terreno
              </h3>
              <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video relative group">
                <img
                  src={photoUrl}
                  alt="Inspección de obra"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white text-xs">
                  <p className="font-semibold truncate">Corte y rasante en progresiva 0+200</p>
                  <span className="text-slate-300 text-[10px]">Verificado por GPS · Hoy</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 text-xs text-amber-900 space-y-2">
              <span className="font-bold uppercase tracking-wider text-amber-800 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-amber-600" />
                Regla de Auditoría Municipal
              </span>
              <p>
                El avance físico <strong>NO se suma al porcentaje del proyecto</strong> hasta que el Fiscalizador o Supervisor de Obra apruebe el reporte en el sistema.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODO 2: BANDEJA DE FISCALIZACIÓN (SUPERVISOR) */}
      {activeSubTab === 'review' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Bandeja de Validación de Reportes de Campo
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Revise las mediciones y fotografías antes de autorizar su consolidación en el Tablero del Alcalde.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800">
              Paso 5: Validación
            </span>
          </div>

          {pendingReports.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No hay reportes pendientes</h3>
              <p className="text-xs text-slate-400">
                Todas las mediciones de obra han sido fiscalizadas y aprobadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {report.period_date}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Estado: <span className="text-amber-600 uppercase font-semibold">Pendiente de Aprobación</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mt-1">
                        Cantidad Ejecutada: {report.quantity_executed} unidades
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reportado el {new Date(report.reported_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Evidencias fotográficas asociadas */}
                    {report.evidences && report.evidences.length > 0 && (
                      <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200">
                        <img
                          src={report.evidences[0].file_url}
                          alt="Evidencia"
                          className="w-16 h-12 rounded-lg object-cover"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 truncate max-w-[150px]">
                            {report.evidences[0].description || 'Foto de obra'}
                          </p>
                          <span className="text-[10px] text-slate-400 flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5 text-rose-500" />
                            GPS Verificado
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campo de Comentarios del Fiscal */}
                  <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Observaciones técnicas de inspección (opcional)..."
                      value={supervisorComments[report.id] || ''}
                      onChange={(e) =>
                        setSupervisorComments({ ...supervisorComments, [report.id]: e.target.value })
                      }
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs flex-1"
                    />

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleValidate(report.id, 'rejected')}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Rechazar / Observar</span>
                      </button>

                      <button
                        onClick={() => handleValidate(report.id, 'approved')}
                        className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprobar Avance</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
