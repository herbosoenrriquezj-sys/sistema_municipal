import React, { useState, useEffect } from 'react';
import { 
  Users, Building, MapPin, DollarSign, CheckCircle2, AlertTriangle, 
  Send, MessageSquare, Search, Filter, ShieldCheck, Camera, Clock, 
  ExternalLink, ChevronRight, Phone, MessageCircle
} from 'lucide-react';
import { PublicProject, CitizenInquiry } from '../types';
import { transparencyService } from '../services/api';

interface CitizenPortalViewProps {
  currentRole: string;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({ currentRole }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'inquiries'>('projects');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [inquiries, setInquiries] = useState<CitizenInquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Formulario de consulta ciudadana
  const [citizenName, setCitizenName] = useState<string>('');
  const [citizenContact, setCitizenContact] = useState<string>('');
  const [organization, setOrganization] = useState<string>('Junta Vecinal');
  const [formDistrict, setFormDistrict] = useState<string>('Distrito 2');
  const [category, setCategory] = useState<string>('alerta_retraso');
  const [message, setMessage] = useState<string>('');
  const [submittingInquiry, setSubmittingInquiry] = useState<boolean>(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);

  // Estado para responder consultas (si es funcionario municipal)
  const [replyingInquiryId, setReplyingInquiryId] = useState<string | null>(null);
  const [officialResponseText, setOfficialResponseText] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);

  const districts = [
    'Todos',
    'Distrito 1',
    'Distrito 2',
    'Distrito 3',
    'Distrito 4',
    'Distrito 5',
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const resProjects = await transparencyService.getPublicProjects(selectedDistrict, searchQuery);
      setProjects(resProjects.projects || []);

      const resInquiries = await transparencyService.getInquiries(selectedDistrict);
      setInquiries(resInquiries || []);
    } catch (err) {
      console.error('Error cargando datos de transparencia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDistrict, searchQuery]);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName || !citizenContact || !message) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    try {
      setSubmittingInquiry(true);
      await transparencyService.submitInquiry({
        district: formDistrict,
        citizen_name: citizenName,
        citizen_contact: citizenContact,
        organization,
        category,
        message
      });

      setInquirySuccess('¡Su consulta ha sido radicada oficialmente en el Sistema Municipal de Control Social!');
      setCitizenName('');
      setCitizenContact('');
      setMessage('');
      setTimeout(() => setInquirySuccess(null), 5000);
      loadData();
    } catch (err) {
      alert('Error enviando consulta.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleRespondInquiry = async (inquiryId: string) => {
    if (!officialResponseText) return;
    try {
      setSubmittingReply(true);
      await transparencyService.respondInquiry(inquiryId, officialResponseText);
      setReplyingInquiryId(null);
      setOfficialResponseText('');
      loadData();
    } catch (err) {
      alert('Error respondiendo consulta');
    } finally {
      setSubmittingReply(false);
    }
  };

  const isOfficial = ['alcalde', 'director_area', 'supervisor_fiscal'].includes(currentRole);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner de Identidad Institucional y Control Social */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Ley 341 de Participación y Control Social · Sucre</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Portal Ciudadano de Obras y Fiscalización Vecinal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Transparencia digital en tiempo real: Consulte el avance físico auditado, presupuestos asignados y fotos de inspección de las obras en su distrito municipal.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold">
            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
              🏛️ Gobierno Autónomo Municipal de Sucre
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30">
              ✓ Datos Públicos Verificados
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'projects'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Obras por Distrito ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inquiries'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buzón de Control Social ({inquiries.length})
          </button>
        </div>

        {/* Filtro por Distrito */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Distrito:
          </span>
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDistrict === d
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* PESTAÑA 1: OBRAS PÚBLICAS POR DISTRITO */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Buscador de Obras */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar obra por nombre o barrio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">Cargando obras públicas...</div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 text-xs border border-slate-200">
              No se encontraron obras para los filtros seleccionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p) => {
                const trafficBg =
                  p.traffic_light === 'green' ? 'bg-emerald-500' :
                  p.traffic_light === 'yellow' ? 'bg-amber-500' : 'bg-rose-600';
                const trafficText =
                  p.traffic_light === 'green' ? 'En Ruta Normal' :
                  p.traffic_light === 'yellow' ? 'En Alerta de Avance' : 'Atraso Crítico en Obra';

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Imagen de Portada con Badge de Estado */}
                      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={p.photos[0]}
                          alt={p.name}
                          className="w-full h-full object-cover opacity-90 hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-slate-800 shadow-sm">
                          {p.code}
                        </div>
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center space-x-1.5 ${trafficBg}`}>
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          <span>{trafficText}</span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-xs p-2 rounded-xl text-white text-xs flex items-center justify-between">
                          <span className="flex items-center truncate">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-sky-400 flex-shrink-0" />
                            {p.location_name}
                          </span>
                        </div>
                      </div>

                      {/* Información de la Obra */}
                      <div className="p-5 space-y-3">
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                          {p.name}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {p.description}
                        </p>

                        {/* Barra de Avance Físico */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-600">Avance Físico Auditado:</span>
                            <span className="text-slate-900 font-extrabold">{p.real_progress_pct}% <span className="text-slate-400 font-normal">/ {p.planned_progress_pct}% prog.</span></span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, p.real_progress_pct)}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${trafficBg}`}
                            ></div>
                          </div>
                        </div>

                        {/* Ficha Rápida: Inversión y Supervisión */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Inversión Pública</span>
                            <span className="font-extrabold text-slate-900">Bs. {p.budget_allocated.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{p.funding_source}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Fiscal de Obras</span>
                            <span className="font-bold text-slate-800 truncate block">{p.supervisor_name}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold block">Actas al día</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón para enviar consulta vecinal sobre esta obra */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => {
                          setActiveTab('inquiries');
                          setFormDistrict(p.location_name.split(',')[0].trim() || 'Distrito 2');
                          setMessage(`Consulta vecinal respecto a la obra ${p.code} (${p.name}): `);
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-slate-200"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Hacer Consulta o Reporte sobre esta Obra</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: BUZÓN DE CONTROL SOCIAL CIUDADANO (LEY 341) */}
      {activeTab === 'inquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario para Vecinos y Juntas Vecinales */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 h-fit">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center">
                <Send className="w-4 h-4 mr-2 text-sky-600" />
                Registrar Solicitud Vecinal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Formulario directo para juntas vecinales, comités de salud y ciudadanos de Sucre.
              </p>
            </div>

            {inquirySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{inquirySuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitInquiry} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Distrito Municipal</label>
                <select
                  value={formDistrict}
                  onChange={(e) => setFormDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold"
                >
                  <option value="Distrito 1">Distrito 1 (Centro Histórico)</option>
                  <option value="Distrito 2">Distrito 2 (San Roque / Hosp. Universitario)</option>
                  <option value="Distrito 3">Distrito 3 (Lajastambo / Aeropuerto)</option>
                  <option value="Distrito 4">Distrito 4 (Azari)</option>
                  <option value="Distrito 5">Distrito 5 (San Juanillo / Rumi Rumi)</option>
                  <option value="Distritos Rurales">Distritos Rurales (6, 7, 8)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo / Dirigente</label>
                <input
                  type="text"
                  placeholder="Ej: Mario Condori"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Organización o Junta Vecinal</label>
                <input
                  type="text"
                  placeholder="Ej: Junta Vecinal Barrio Obrero Universitario"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono / Celular WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ej: 72891044"
                  value={citizenContact}
                  onChange={(e) => setCitizenContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Solicitud</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold"
                >
                  <option value="alerta_retraso">Alerta de retraso o paralización</option>
                  <option value="solicitud_inspeccion">Solicitud de inspección técnica en barrio</option>
                  <option value="consulta">Consulta de cronograma de ejecución</option>
                  <option value="felicitacion">Felicitación por calidad de obra</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detalle del Requerimiento</label>
                <textarea
                  rows={3}
                  placeholder="Escriba su observación, duda o requerimiento vecinal..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingInquiry}
                className="w-full py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingInquiry ? 'Radicando...' : 'Enviar al Municipio'}</span>
              </button>
            </form>
          </div>

          {/* Listado Público de Consultas y Respuestas Oficiales */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-sky-600" />
                Consultas Vecinales y Respuestas Oficiales ({inquiries.length})
              </h3>
              <span className="text-xs text-slate-500">Transparencia Pública Ley 341</span>
            </div>

            {inquiries.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-500 text-xs border border-slate-200">
                Aún no hay requerimientos radicados para este distrito.
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 text-[11px]">
                            {inq.district}
                          </span>
                          <span className="font-bold text-slate-900">{inq.citizen_name}</span>
                          {inq.organization && (
                            <span className="text-slate-400 italic">({inq.organization})</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          Contacto: {inq.citizen_contact} · {new Date(inq.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        inq.status === 'responded'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {inq.status === 'responded' ? '✓ Respondido Oficial' : 'Pendiente de Respuesta'}
                      </span>
                    </div>

                    <p className="text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 leading-relaxed">
                      "{inq.message}"
                    </p>

                    {/* Respuesta Oficial */}
                    {inq.official_response ? (
                      <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200 space-y-1">
                        <div className="flex items-center space-x-1.5 text-sky-900 font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
                          <span>Respuesta Oficial de la Supervisión Municipal:</span>
                        </div>
                        <p className="text-sky-950 font-medium leading-relaxed pl-5">
                          {inq.official_response}
                        </p>
                      </div>
                    ) : isOfficial ? (
                      <div>
                        {replyingInquiryId === inq.id ? (
                          <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-300">
                            <label className="font-bold text-slate-700 block">Redactar Respuesta Oficial para la Junta Vecinal:</label>
                            <textarea
                              rows={2}
                              value={officialResponseText}
                              onChange={(e) => setOfficialResponseText(e.target.value)}
                              placeholder="Indique las medidas técnicas adoptadas, fechas o aclaraciones..."
                              className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                            ></textarea>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRespondInquiry(inq.id)}
                                disabled={submittingReply}
                                className="px-3 py-1.5 bg-sky-700 text-white rounded-xl font-bold text-xs"
                              >
                                {submittingReply ? 'Publicando...' : 'Publicar Respuesta'}
                              </button>
                              <button
                                onClick={() => setReplyingInquiryId(null)}
                                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingInquiryId(inq.id);
                              setOfficialResponseText('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs transition-all"
                          >
                            + Responder Oficialmente como Autoridad / Fiscal
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
