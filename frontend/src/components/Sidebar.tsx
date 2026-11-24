import React, { useState } from 'react';
import { 
  Building2, Activity, Layers, MapPin, Smartphone, 
  Compass, FileText, ShieldCheck, ChevronLeft, ChevronRight, 
  Menu, X, Check, ChevronDown, UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: string;
  setCurrentRole: (role: string) => void;
  tenantName: string;
  isOpenMobile: boolean;
  setIsOpenMobile: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole,
  tenantName,
  isOpenMobile,
  setIsOpenMobile,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles = [
    { key: 'alcalde', label: 'Alcalde Municipal', shortLabel: 'Alcalde', initials: 'AM', roleDesc: 'Máxima Autoridad (M.A.E.)' },
    { key: 'director_area', label: 'Director de Obras Públicas', shortLabel: 'Director', initials: 'DO', roleDesc: 'Secretaría Municipal Técnica' },
    { key: 'responsable_proyecto', label: 'Residente de Obra', shortLabel: 'Residente', initials: 'RO', roleDesc: 'Ingeniero Responsable Técnico' },
    { key: 'supervisor_fiscal', label: 'Fiscal de Obras / Supervisor', shortLabel: 'Fiscal', initials: 'FO', roleDesc: 'Fiscalización y Aprobación' },
    { key: 'control_social', label: 'Control Social / Vecinal', shortLabel: 'Control Social', initials: 'CS', roleDesc: 'Participación Ciudadana (Ley 341)' },
  ];

  const currentRoleObj = roles.find(r => r.key === currentRole) || roles[0];

  const navSections = [
    {
      title: 'Gestión de Obras & Terreno',
      items: [
        { id: 'dashboard', label: 'Tablero General', icon: Activity, badge: 'KPIs' },
        { id: 'projects', label: 'Proyectos & EDT', icon: Layers },
        { id: 'map', label: 'GIS Satelital HD', icon: MapPin },
        { id: 'field', label: 'Fiscalización Móvil', icon: Smartphone, badge: 'GPS' },
      ]
    },
    {
      title: 'Planificación & Transparencia',
      items: [
        { id: 'strategic', label: 'Planificación POA', icon: Compass, badge: 'F 1,2,3' },
        { id: 'report', label: 'Informe Oficial', icon: FileText },
        { id: 'citizen', label: 'Control Social', icon: ShieldCheck },
      ]
    }
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Overlay oscuro para pantallas móviles cuando el menú lateral está abierto */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Lateral Principal */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 border-r border-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${
          // Móvil: deslizar desde la izquierda
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          // Escritorio: colapsado (w-20) o expandido (w-64)
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-72`}
      >
        {/* Cabecera del Sidebar */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center flex-shrink-0 shadow-md border border-sky-400/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {(!isCollapsed || isOpenMobile) && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm tracking-tight text-white">SGP</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 font-bold">
                    GovTech
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {tenantName || 'G.A.M. Sucre'}
                </p>
              </div>
            )}
          </div>

          {/* Botón de cerrar en móvil */}
          <button 
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Botón de colapsar / expandir en escritorio */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title={isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Lista de Navegación con Scroll */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-none no-scrollbar">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {(!isCollapsed || isOpenMobile) && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {sec.title}
                </div>
              )}
              {isCollapsed && !isOpenMobile && secIdx > 0 && (
                <div className="my-2 border-t border-slate-800" />
              )}

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center rounded-xl transition-all duration-150 ${
                        isCollapsed && !isOpenMobile 
                          ? 'justify-center p-3' 
                          : 'space-x-3 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                      }`} />

                      {(!isCollapsed || isOpenMobile) && (
                        <div className="flex-1 text-left flex items-center justify-between text-xs">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              isActive ? 'bg-sky-700 text-sky-100' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Tooltip flotante animado cuando el sidebar está colapsado */}
                    {isCollapsed && !isOpenMobile && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                        {item.label}
                        {item.badge && <span className="ml-1.5 text-[10px] text-sky-400 font-bold">({item.badge})</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Tarjeta de Perfil y Selector de Rol Institucional */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`w-full flex items-center rounded-xl hover:bg-slate-800 transition-colors ${
                isCollapsed && !isOpenMobile ? 'justify-center p-2' : 'p-2 space-x-3'
              }`}
              title="Cambiar perfil de usuario para demostración técnica"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-800 text-sky-200 border border-sky-600/40 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                {currentRoleObj.initials}
              </div>

              {(!isCollapsed || isOpenMobile) && (
                <div className="min-w-0 text-left flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-white truncate block">
                      {currentRoleObj.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium block truncate flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    Sesión Activa
                  </span>
                </div>
              )}

              {(!isCollapsed || isOpenMobile) && (
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
              )}
            </button>

            {/* Menú Desplegable Flotante de Roles */}
            {roleDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-50" 
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className={`absolute bottom-full mb-2 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs ${
                  isCollapsed && !isOpenMobile ? 'left-full ml-3 w-64' : 'left-0 right-0 w-64'
                }`}>
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
      </aside>
    </>
  );
};
