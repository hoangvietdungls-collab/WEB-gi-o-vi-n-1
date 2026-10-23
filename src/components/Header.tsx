import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, CheckCircle2, AlertCircle, FileText, Calendar, RotateCcw, Download, Upload, User, ShieldCheck } from 'lucide-react';
import { TeacherProfile, NotificationItem } from '../types';
import { StorageService } from '../services/storage';

interface HeaderProps {
  teacher: TeacherProfile;
  notifications: NotificationItem[];
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  onSelectTab?: (tab: any) => void;
  onSubjectChange?: (subject: string) => void;
  onSemesterChange?: (semester: 'HKI' | 'HKII') => void;
}

export const Header: React.FC<HeaderProps> = ({
  teacher,
  notifications,
  onOpenSettings,
  onSelectTab,
  onSubjectChange,
  onSemesterChange,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
  };

  const handleNotificationClick = (id: string) => {
    StorageService.markNotificationRead(id);
  };

  return (
    <header className="relative w-full bg-gradient-to-r from-[#052c5c] via-[#063B7A] to-[#0a4b96] text-white shadow-md z-30 select-none border-b border-sky-900/50">
      {/* Decorative Chemistry/Science Watermark in background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden flex items-center justify-end pr-32">
        <svg width="400" height="70" viewBox="0 0 400 70" fill="none" stroke="currentColor">
          <circle cx="280" cy="35" r="14" strokeWidth="1.5" />
          <circle cx="340" cy="20" r="10" strokeWidth="1.5" />
          <circle cx="350" cy="55" r="12" strokeWidth="1.5" />
          <line x1="294" y1="35" x2="330" y2="23" strokeWidth="1.5" />
          <line x1="293" y1="40" x2="338" y2="52" strokeWidth="1.5" />
          <path d="M120 55 L135 25 L150 25 L165 55 Z" strokeWidth="1.5" />
          <line x1="140" y1="20" x2="140" y2="25" strokeWidth="1.5" />
          <line x1="145" y1="20" x2="145" y2="25" strokeWidth="1.5" />
          <circle cx="142" cy="45" r="3" fill="currentColor" />
          <circle cx="148" cy="40" r="2" fill="currentColor" />
          <circle cx="137" cy="50" r="2" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between relative z-10">
        {/* Left Section: School Logo & Slogan */}
        <div className="flex items-center gap-3">
          {/* Official-looking School Emblem SVG */}
          <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md flex-shrink-0 flex items-center justify-center border-2 border-amber-400">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Outer circle */}
              <circle cx="50" cy="50" r="48" fill="#063B7A" stroke="#EAB308" strokeWidth="3" />
              <circle cx="50" cy="50" r="42" fill="#ffffff" />
              {/* Inner seal */}
              <circle cx="50" cy="50" r="38" fill="#0756A8" />
              {/* Open Book */}
              <path d="M 28 62 Q 50 56 50 68 Q 50 56 72 62 L 72 44 Q 50 38 50 50 Q 50 38 28 44 Z" fill="#ffffff" />
              <line x1="50" y1="48" x2="50" y2="68" stroke="#063B7A" strokeWidth="2" />
              {/* Torch / Flame */}
              <path d="M 50 20 Q 45 28 48 34 Q 50 30 52 34 Q 55 28 50 20 Z" fill="#F59E0B" />
              <path d="M 48 34 L 52 34 L 51 40 L 49 40 Z" fill="#D97706" />
              {/* Star */}
              <polygon points="50,22 51.5,26.5 56,26.5 52.5,29.5 54,34 50,31.5 46,34 47.5,29.5 44,26.5 48.5,26.5" fill="#EF4444" />
              {/* Laurel leaves on sides */}
              <path d="M 20 50 Q 22 36 32 30" stroke="#FDE047" strokeWidth="2" fill="none" />
              <path d="M 80 50 Q 78 36 68 30" stroke="#FDE047" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-sm sm:text-base md:text-lg font-bold tracking-wide text-white uppercase drop-shadow-sm leading-tight">
              {teacher.school}
            </span>
            <span className="text-xs sm:text-sm text-sky-200 italic font-medium">
              {teacher.slogan}
            </span>
          </div>

          {/* Chevron Divider */}
          <div className="hidden md:flex items-center text-sky-300/80 mx-2 text-xl font-light">
            &gt;
          </div>
        </div>

        {/* Center Section: System Name & Teacher / Subject Info */}
        <div className="hidden lg:flex flex-col items-center text-center px-4">
          <div className="text-sm sm:text-base font-bold text-white tracking-wider uppercase">
            HỆ THỐNG QUẢN LÝ DẠY HỌC
          </div>
          <div className="flex items-center gap-2 text-xs text-sky-100 font-medium mt-0.5">
            <span>Giáo viên: <strong className="text-white">{teacher.name}</strong></span>
            <span className="text-sky-400">|</span>
            <div className="flex items-center gap-1">
              <span>Môn:</span>
              <select
                value={teacher.defaultSubject}
                onChange={(e) => onSubjectChange?.(e.target.value)}
                className="bg-[#052c5c]/80 text-sky-200 font-semibold px-2 py-0.5 rounded border border-sky-400/30 text-xs focus:outline-none focus:ring-1 focus:ring-sky-300 cursor-pointer"
              >
                <option value="Hóa học">Hóa học (Mặc định)</option>
                <option value="Sinh học">Sinh học</option>
                <option value="Vật lí">Vật lí</option>
                <option value="Toán học">Toán học</option>
              </select>
            </div>
            <span className="text-sky-400">|</span>
            <div className="flex items-center gap-1">
              <span>Học kỳ:</span>
              <select
                value={teacher.semester}
                onChange={(e) => onSemesterChange?.(e.target.value as 'HKI' | 'HKII')}
                className="bg-[#052c5c]/80 text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-sky-400/30 text-xs focus:outline-none focus:ring-1 focus:ring-sky-300 cursor-pointer"
              >
                <option value="HKI">HKI (2024-2025)</option>
                <option value="HKII">HKII (2024-2025)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Section: Notifications Bell & User Account Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-full hover:bg-white/15 transition-colors focus:outline-none"
              title="Thông báo"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-[#0756A8]" />
                    <span>Thông báo mới ({unreadCount})</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-[#0756A8] hover:underline font-semibold"
                    >
                      Đánh dấu đã đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={`p-3 text-xs cursor-pointer transition-colors ${
                        notif.read ? 'bg-white hover:bg-slate-50' : 'bg-sky-50/70 hover:bg-sky-100/60 font-medium'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                            notif.type === 'exam'
                              ? 'bg-amber-500'
                              : notif.type === 'resource'
                              ? 'bg-blue-500'
                              : notif.type === 'deadline'
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}
                        />
                        <div className="flex-1">
                          <p className={`leading-snug ${notif.read ? 'text-slate-700' : 'text-slate-900 font-bold'}`}>
                            {notif.title}
                          </p>
                          {notif.content && (
                            <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">
                              {notif.content}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.timeAgo}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-3 py-2 border-t border-slate-100 text-center bg-slate-50">
                  <button
                    onClick={() => {
                      setShowNotifMenu(false);
                      onSelectTab?.('dashboard');
                    }}
                    className="text-xs text-[#063B7A] font-bold hover:underline"
                  >
                    Xem tất cả thông báo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-sky-200 text-[#063B7A] font-bold flex items-center justify-center text-sm shadow border border-white/50">
                <User className="w-5 h-5 text-[#063B7A]" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {teacher.name}
                </span>
                <span className="text-[11px] text-sky-200">
                  Giáo viên
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-sky-200" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-sky-50/50">
                  <p className="font-bold text-sm text-slate-800">{teacher.name}</p>
                  <p className="text-xs text-slate-500">{teacher.email}</p>
                  <p className="text-[11px] text-[#063B7A] font-semibold mt-0.5">
                    Trường THPT Tràng Định - Lạng Sơn
                  </p>
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelectTab?.('settings');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-sky-50 flex items-center gap-2.5 text-slate-700 font-medium"
                  >
                    <User className="w-4 h-4 text-sky-600" />
                    <span>Hồ sơ &amp; Cài đặt hệ thống</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      const backup = StorageService.exportJsonBackup();
                      const blob = new Blob([backup], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `sao-luu-thpt-trang-dinh-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-sky-50 flex items-center gap-2.5 text-slate-700 font-medium"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Sao lưu toàn bộ dữ liệu (JSON)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của Thầy Hoàng Việt Dũng - Trường THPT Tràng Định?')) {
                        StorageService.resetAllToDefault();
                        window.location.reload();
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-2.5 text-amber-700 font-medium border-t border-slate-100"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>Đặt lại dữ liệu mẫu gốc</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
