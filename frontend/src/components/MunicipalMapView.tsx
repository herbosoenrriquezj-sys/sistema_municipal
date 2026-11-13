import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Navigation, Eye, CheckCircle2, AlertTriangle, 
  Layers, Search, Filter, ExternalLink, Building2
} from 'lucide-react';
import { Project, ExecutiveSummary } from '../types';

interface MunicipalMapViewProps {
  projects: Project[];
  summary: ExecutiveSummary | null;
  onSelectProject: (projectId: string) => void;
}

export const MunicipalMapView: React.FC<MunicipalMapViewProps> = ({
  projects,
  summary,
  onSelectProject,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProject, setActiveProject] = useState<any | null>(null);

  // Obtener cálculo de semáforo por proyecto desde summary
  const getProjectTrafficLight = (projId: string): 'green' | 'yellow' | 'red' => {
    if (!summary) return 'green';
    for (const area of summary.areas_summary) {
      for (const p of area.projects_summary || []) {
        if (p.project_id === projId) return p.traffic_light;
      }
    }
    return 'green';
  };

  const getProjectProgress = (projId: string) => {
    if (!summary) return { real: 0, planned: 0 };
    for (const area of summary.areas_summary) {
      for (const p of area.projects_summary || []) {
        if (p.project_id === projId) {
          return { real: p.real_progress_pct, planned: p.planned_progress_pct };
        }
      }
    }
    return { real: 0, planned: 0 };
  };

  // Coordenadas válidas
  const georeferencedProjects = projects.map((p) => {
    const lat = p.latitude || -17.3935;
    const lng = p.longitude || -66.1570;
    const trafficLight = getProjectTrafficLight(p.id);
    const progress = getProjectProgress(p.id);
    return {
      ...p,
      lat,
      lng,
      trafficLight,
      progress,
    };
  });

  const filteredProjects = georeferencedProjects.filter((p) => {
    const matchesFilter = selectedFilter === 'all' || p.trafficLight === selectedFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.location_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Inicializar mapa centrado en el municipio
      const initialCenter: [number, number] = [-17.3980, -66.1520];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | SGP Municipal GIS',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Limpiar marcadores previos
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Crear marcadores personalizados con semáforos animados
    filteredProjects.forEach((p) => {
      const colorBg = 
        p.trafficLight === 'green' ? '#10b981' :
        p.trafficLight === 'yellow' ? '#f59e0b' : '#e11d48';

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: ${colorBg}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 18px; height: 18px; border-radius: 9999px; background-color: ${colorBg}; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(map);

      // Popup
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 200px;">
          <span style="font-family: monospace; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">${p.code}</span>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 2px 0 6px 0;">${p.name}</h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">📍 ${p.location_name || 'Ubicación municipal'}</p>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 8px;">
            <span>Avance Real:</span>
            <span style="color: ${colorBg};">${p.progress.real}% / ${p.progress.planned}%</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setActiveProject(p);
      });

      markersRef.current[p.id] = marker;
    });

    // Ajustar vista si hay marcadores
    if (filteredProjects.length > 0) {
      const bounds = L.latLngBounds(filteredProjects.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredProjects.length, selectedFilter]);

  const handleFlyTo = (p: any) => {
    setActiveProject(p);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([p.lat, p.lng], 16, { duration: 1.2 });
      const marker = markersRef.current[p.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Navigation className="w-4 h-4" />
            <span>Sistema de Información Geográfica (GIS Municipal)</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Mapa Satelital de Obras y Proyectos
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Georreferenciación de proyectos de inversión pública en tiempo real con monitoreo visual de semáforos por distrito.
          </p>
        </div>

        {/* Resumen de pines */}
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 text-xs">
          <div className="flex items-center space-x-1.5 px-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>En Ruta</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>En Riesgo</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Crítico</span>
          </div>
        </div>
      </div>

      {/* Grid: Lista Lateral + Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[680px]">
        {/* Panel Lateral de Obras */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col h-full space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Obras Georreferenciadas ({filteredProjects.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Haga clic sobre una obra para centrar el mapa.
            </p>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o distrito..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Filtro por Semáforo */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                selectedFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter('green')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                selectedFilter === 'green' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Verde
            </button>
            <button
              onClick={() => setSelectedFilter('yellow')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                selectedFilter === 'yellow' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Amarillo
            </button>
            <button
              onClick={() => setSelectedFilter('red')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                selectedFilter === 'red' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Rojo
            </button>
          </div>

          {/* Lista Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredProjects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleFlyTo(p)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-slate-500 block text-[10px]">
                        {p.code}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-0.5 line-clamp-2">
                        {p.name}
                      </h4>
                    </div>
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                      p.trafficLight === 'green' ? 'bg-emerald-500' :
                      p.trafficLight === 'yellow' ? 'bg-amber-500' : 'bg-rose-600'
                    }`}></span>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{p.location_name || 'Ubicación central'}</span>
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 font-semibold">
                    <span className="text-slate-600">Avance Real:</span>
                    <span className="text-slate-900 font-extrabold">{p.progress.real}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mapa Interactivo (Leaflet) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative h-full">
          <div ref={mapContainerRef} className="w-full h-full z-0"></div>

          {/* Tarjeta Flotante al Seleccionar Obra */}
          {activeProject && (
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xl z-20 space-y-3 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {activeProject.code}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">
                    {activeProject.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {activeProject.location_name}
                  </p>
                </div>
                <button
                  onClick={() => setActiveProject(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold">
                <div>
                  <span className="text-slate-500 block text-[10px]">Presupuesto</span>
                  <span className="text-slate-900 font-bold">Bs. {activeProject.budget_allocated?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Avance Físico</span>
                  <span className={`font-bold ${
                    activeProject.trafficLight === 'green' ? 'text-emerald-600' :
                    activeProject.trafficLight === 'yellow' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {activeProject.progress.real}% <span className="text-slate-400 font-normal">/ {activeProject.progress.planned}%</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectProject(activeProject.id)}
                className="w-full py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Ver Ficha Técnica y Desglose EDT</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
