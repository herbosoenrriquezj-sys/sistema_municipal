import React from 'react';
import { Building2, ShieldCheck, Activity, Smartphone, Layers, Users, Compass, FileText, MapPin } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: string;
  setCurrentRole: (role: string) => void;
  tenantName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole,
  tenantName,
}) => {
  const roles = [
    { key: 'alcalde', label: 'Alcalde Municipal', email: 'alcalde@sgp.gob', badgeColor: 'bg-purple-100 text-purple-800' },
    { key: 'director_area', label: 'Director Obras', email: 'director.obras@sgp.gob', badgeColor: 'bg-blue-100 text-blue-800' },
    { key: 'responsable_proyecto', label: 'Residente Obra', email: 'responsable.obras@sgp.gob', badgeColor: 'bg-amber-100 text-amber-800' },
    { key: 'supervisor_fiscal', label: 'Fiscal / Supervisor', email: 'supervisor.fiscal@sgp.gob', badgeColor: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Nombre del Municipio */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">SGP</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold uppercase tracking-wider">
                  SaaS Municipal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                {tenantName || 'Gobierno Autónomo Municipal'}
              </p>
            </div>
          </div>

          {/* Navegación por Módulos */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Tablero del Alcalde</span>
            </button>

            <button
              onClick={() => setCurrentTab('projects')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'projects'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Proyectos & EDT</span>
            </button>

            <button
              onClick={() => setCurrentTab('field')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'field'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Reporte Campo (Móvil)</span>
            </button>

            <button
              onClick={() => setCurrentTab('strategic')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'strategic'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Planificación & POA</span>
            </button>

            <button
              onClick={() => setCurrentTab('map')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'map'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Mapa GIS</span>
            </button>

            <button
              onClick={() => setCurrentTab('report')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'report'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-700" />
              <span>Reporte Oficial</span>
            </button>
          </nav>

          {/* Selector de Rol Demostrativo */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <Users className="w-4 h-4 text-slate-500 ml-1.5 hidden sm:inline" />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Vista de rol:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg py-1 px-2.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {roles.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navegación móvil inferior o secundaria */}
      <div className="md:hidden flex justify-around border-t border-slate-200 py-2 bg-white">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center text-xs font-semibold ${
            currentTab === 'dashboard' ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          Alcalde
        </button>
        <button
          onClick={() => setCurrentTab('projects')}
          className={`flex flex-col items-center text-xs font-semibold ${
            currentTab === 'projects' ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          Proyectos
        </button>
        <button
          onClick={() => setCurrentTab('field')}
          className={`flex flex-col items-center text-xs font-semibold ${
            currentTab === 'field' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <Smartphone className="w-5 h-5 mb-0.5" />
          Campo
        </button>
        <button
          onClick={() => setCurrentTab('strategic')}
          className={`flex flex-col items-center text-xs font-semibold ${
            currentTab === 'strategic' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          POA
        </button>
        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center text-xs font-semibold ${
            currentTab === 'map' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          Mapa
        </button>
        <button
          onClick={() => setCurrentTab('report')}
          className={`flex flex-col items-center text-xs font-semibold ${
            currentTab === 'report' ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          Reporte
        </button>
      </div>
    </header>
  );
};

