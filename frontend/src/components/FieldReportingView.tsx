import React, { useState } from 'react';
import { 
  Camera, MapPin, CheckCircle2, AlertCircle, Clock, 
  Send, ShieldCheck, ThumbsUp, ThumbsDown, MessageSquare, Image, Upload
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
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [executedQuantity, setExecutedQuantity] = useState<number>(100);
  const [evidenceDescription, setEvidenceDescription] = useState<string>('Vaciado e inspección de avance en sector norte');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Obtener actividades del proyecto seleccionado
  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const allActivities = currentProject?.components.flatMap((c) => c.activities) || [];

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
            latitude: -17.3935,
            longitude: -66.1570,
            captured_at: new Date().toISOString(),
            description: evidenceDescription,
          },
        ],
      });

      setMessage({
        type: 'success',
        text: '¡Avance físico y evidencia fotográfica enviados al Supervisor para validación!',
      });
      setTimeout(() => setMessage(null), 5000);
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

  const isSupervisor = currentRole === 'supervisor_fiscal' || currentRole === 'alcalde' || currentRole === 'director_area';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Banner de Presentación Diapositiva 11 */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1">
          <Camera className="w-4 h-4" />
          <span>Módulo de Campo · Registro Móvil y Fiscalización (Diapositiva 11)</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Captura de Avance Físico con Respaldo
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm mt-1">
          El avance se registra directamente en la obra con fotografías geolocalizadas (GPS) y pasa por validación formal del fiscalizador.
        </p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario de Carga (Simulación Celular Residente) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">
              Nuevo Reporte Periódico de Avance
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Paso 4 del flujo
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Selección de Proyecto */}
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

            {/* Selección de Actividad */}
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

            {/* Cantidad Física Ejecutada */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cantidad Ejecutada en el Periodo
              </label>
              <div className="relative">
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
            </div>

            {/* Respaldo Fotográfico y GPS */}
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
                <span>Coordenadas GPS capturadas: <strong>-17.3935, -66.1570</strong> (Distrito 4)</span>
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

        {/* Panel Lateral: Vista Previa de Evidencia / Fiscalización */}
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
            <p className="text-xs text-slate-500">
              Cumplimiento del requisito de respaldo fotográfico obligatorio para evitar desvíos no documentados.
            </p>
          </div>

          {/* Caja de Regla de Negocio */}
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
    </div>
  );
};

