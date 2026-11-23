import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Activity, Smartphone, Layers, 
  Users, Compass, FileText, MapPin, ChevronDown, Check
} from 'lucide-react';

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
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles = [
    { key: 'alcalde', label: 'Alcalde Municipal', shortLabel: 'Alcalde', email: 'alcalde@sgp.gob', roleDesc: 'Máxima Autoridad Ejecutiva (M.A.E.)' },
    { key: 'director_area', label: 'Director de Obras Públicas', shortLabel: 'Director', email: 'director.obras@sgp.gob', roleDesc: 'Secretaría Municipal Técnica' },
    { key: 'responsable_proyecto', label: 'Residente de Obra', shortLabel: 'Residente', email: 'responsable.obras@sgp.gob', roleDesc: 'Ingeniero Responsable Técnico' },
    { key: 'supervisor_fiscal', label: 'Fiscal de Obras / Supervisor', shortLabel: 'Fiscal', email: 'supervisor.fiscal@sgp.gob', roleDesc: 'Fiscalización y Aprobación' },
    { key: 'control_social', label: 'Control Social / Juntas Vecinales', shortLabel: 'Control Social', email: 'vecino.sucre@sgp.gob', roleDesc: 'Participación Ciudadana (Ley 341)' },
  ];

  const currentRoleObj = roles.find(r => r.key === currentRole) || roles[0];

  const navItems = [
    { id: 'dashboard', label: 'Tablero General', icon: Activity },
    { id: 'projects', label: 'Proyectos & EDT', icon: Layers },
    { id: 'map', label: 'GIS Satelital', icon: MapPin },
    { id: 'field', label: 'Fiscalización Móvil', icon: Smartphone },
    { id: 'strategic', label: 'Planificación POA', icon: Compass },
    { id: 'report', label: 'Informe Oficial', icon: FileText },
    { id: 'citizen', label: 'Control Social', icon: ShieldCheck },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* 1. Barra Superior Institucional */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Identidad Institucional */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight">SGP</span>
                <span className="text-[10px] sm:text-xs font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  GovTech
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {tenantName || 'Gobierno Autónomo Municipal de Sucre'}
              </p>
            </div>
          </div>

          {/* Selector de Rol Compacto y Elegante */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-2 py-1.5 px-2.5 sm:px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs transition-colors"
              title="Cambiar perfil de usuario para demostración técnica"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="text-left hidden sm:block">
                <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Perfil Activo</span>
                <span className="font-bold text-slate-800 text-xs">{currentRoleObj.label}</span>
              </div>
              <span className="sm:hidden font-bold text-slate-800 text-xs">{currentRoleObj.shortLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Menú Desplegable de Roles */}
            {roleDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setRoleDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulación de Roles y Permisos
                  </div>
                  {roles.map((r) => {
                    const isSelected = r.key === currentRole;
                    return (
                      <button
                        key={r.key}
                        onClick={() => {
                          setCurrentRole(r.key);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-sky-50 text-sky-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{r.label}</div>
                          <div className="text-[10px] text-slate-400">{r.roleDesc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-600 flex-shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Barra de Módulos Responsiva (Desktop, Tablet y Celular) */}
      <div className="bg-slate-50/80 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-1.5 scrollbar-none no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
