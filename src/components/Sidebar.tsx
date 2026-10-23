import React from 'react';
import {
  LayoutDashboard,
  Users2,
  UserCheck,
  ClipboardList,
  BarChart3,
  CalendarCheck2,
  CalendarCheck,
  FolderKanban,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  Atom,
  FlaskConical,
  BookOpen
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  hasChevron?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'classes', label: 'Lớp học', icon: <Users2 className="w-5 h-5" />, hasChevron: true },
    { id: 'students', label: 'Học sinh', icon: <UserCheck className="w-5 h-5" />, hasChevron: true },
    { id: 'attendance', label: 'Điểm danh', icon: <CalendarCheck className="w-5 h-5" />, hasChevron: true },
    { id: 'gradebook', label: 'Sổ điểm', icon: <ClipboardList className="w-5 h-5" />, hasChevron: true },
    { id: 'analytics', label: 'Thống kê', icon: <BarChart3 className="w-5 h-5" />, hasChevron: true },
    { id: 'lesson-plan', label: 'Kế hoạch dạy học', icon: <CalendarCheck2 className="w-5 h-5" />, hasChevron: true },
    { id: 'resources', label: 'Học liệu số', icon: <FolderKanban className="w-5 h-5" />, hasChevron: true },
    { id: 'reports', label: 'Báo cáo', icon: <FileSpreadsheet className="w-5 h-5" />, hasChevron: true },
    { id: 'settings', label: 'Cài đặt', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-[#063B7A] via-[#052e61] to-[#04244d] text-white flex flex-col justify-between shadow-xl transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-3 pt-4 flex-1 overflow-y-auto">
          {/* Mobile title */}
          <div className="lg:hidden pb-3 mb-2 border-b border-sky-800 flex items-center justify-between">
            <span className="font-bold text-sm tracking-wide">THPT TRÀNG ĐỊNH</span>
            <button
              onClick={onCloseMobile}
              className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20"
            >
              Đóng
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1677E8] text-white shadow-md font-bold'
                      : 'text-sky-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-sky-200'}>
                      {item.icon}
                    </span>
                    <span className="tracking-wide text-[14px]">{item.label}</span>
                  </div>

                  {item.hasChevron && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-white' : 'text-sky-300/70'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Chemistry Quote & Watermark - matching screenshot */}
        <div className="p-4 border-t border-sky-800/60 bg-[#031d3d]/60 relative overflow-hidden select-none">
          {/* Subtle Science Icons in background */}
          <div className="absolute -bottom-4 -right-4 opacity-15 pointer-events-none text-sky-300">
            <Atom className="w-24 h-24" />
          </div>
          <div className="absolute top-2 right-2 opacity-10 pointer-events-none text-sky-200">
            <FlaskConical className="w-12 h-12" />
          </div>

          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-1.5 text-sky-300">
              <FlaskConical className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-[12px] italic text-sky-100/90 leading-relaxed font-serif">
              “Hóa học là chìa khóa mở ra thế giới vật chất và những điều kỳ diệu của cuộc sống!”
            </p>
            <div className="mt-2 text-[10px] text-sky-300/70 uppercase tracking-widest font-semibold">
              Tổ Hóa - Sinh • THPT Tràng Định
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
