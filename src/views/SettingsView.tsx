import React, { useState, useRef } from 'react';
import {
  Settings,
  User,
  Building,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Database
} from 'lucide-react';
import { TeacherProfile, GradeConfig } from '../types';
import { StorageService } from '../services/storage';

interface SettingsViewProps {
  teacher: TeacherProfile;
  gradeConfig: GradeConfig;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  teacher,
  gradeConfig,
  onRefreshData,
}) => {
  // Form states
  const [name, setName] = useState(teacher.name);
  const [school, setSchool] = useState(teacher.school);
  const [slogan, setSlogan] = useState(teacher.slogan);
  const [defaultSubject, setDefaultSubject] = useState(teacher.defaultSubject);
  const [academicYear, setAcademicYear] = useState(teacher.academicYear);
  const [semester, setSemester] = useState(teacher.semester);
  const [email, setEmail] = useState(teacher.email);
  const [phone, setPhone] = useState(teacher.phone);

  // Grade thresholds
  const [goodThreshold, setGoodThreshold] = useState(gradeConfig.goodThreshold);
  const [fairThreshold, setFairThreshold] = useState(gradeConfig.fairThreshold);
  const [avgThreshold, setAvgThreshold] = useState(gradeConfig.avgThreshold);

  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveTeacherProfile({
      ...teacher,
      name,
      school,
      slogan,
      defaultSubject,
      academicYear,
      semester,
      email,
      phone,
    });
    StorageService.saveGradeConfig({
      ...gradeConfig,
      goodThreshold,
      fairThreshold,
      avgThreshold,
    });
    setMessage('Đã lưu thành công cài đặt hệ thống!');
    onRefreshData();
    setTimeout(() => setMessage(null), 3500);
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportJsonBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sao-luu-thpt-trang-dinh-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.restoreJsonBackup(content);
        if (success) {
          alert('Khôi phục dữ liệu từ tệp sao lưu thành công!');
          onRefreshData();
          window.location.reload();
        } else {
          alert('Tệp sao lưu không hợp lệ. Vui lòng kiểm tra lại định dạng JSON.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToDefault = () => {
    if (confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của Thầy Hoàng Việt Dũng - Trường THPT Tràng Định? Tất cả dữ liệu hiện tại sẽ được làm mới về mặc định.')) {
      StorageService.resetAllToDefault();
      onRefreshData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#0756A8]" />
            <span>Cài đặt &amp; Quản trị Hệ thống</span>
          </h1>
          <p className="text-xs text-slate-500">
            Hồ sơ giáo viên, quy tắc học lực và quản lý dữ liệu lưu trữ
          </p>
        </div>

        {message && (
          <div className="p-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Settings (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0756A8]" />
              <span>Thông tin Giáo viên &amp; Nhà trường</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên giáo viên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-800 focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên đơn vị công tác</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800 focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khẩu hiệu giáo dục</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-700 italic focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn học mặc định</label>
                <select
                  value={defaultSubject}
                  onChange={(e) => setDefaultSubject(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-[#0756A8] bg-white"
                >
                  <option value="Hóa học">Hóa học (Mặc định)</option>
                  <option value="Sinh học">Sinh học</option>
                  <option value="Vật lí">Vật lí</option>
                  <option value="Toán học">Toán học</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Năm học</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Học kỳ hiện tại</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="HKI">Học kỳ I</option>
                  <option value="HKII">Học kỳ II</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email liên hệ</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            {/* Threshold settings */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Ngưỡng cảnh báo và xếp loại học lực:</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-emerald-800 font-bold mb-1">Ngưỡng Giỏi (&gt;=)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={goodThreshold}
                    onChange={(e) => setGoodThreshold(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-emerald-300 rounded bg-emerald-50 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-amber-800 font-bold mb-1">Ngưỡng Khá (&gt;=)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fairThreshold}
                    onChange={(e) => setFairThreshold(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-amber-300 rounded bg-amber-50 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-sky-800 font-bold mb-1">Ngưỡng Trung bình (&gt;=)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={avgThreshold}
                    onChange={(e) => setAvgThreshold(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-sky-300 rounded bg-sky-50 font-bold text-center"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded font-bold flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thông tin cài đặt</span>
              </button>
            </div>
          </form>
        </div>

        {/* Storage, Backup & System Info (1 col) */}
        <div className="space-y-4 text-xs">
          {/* Data Backup Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0756A8]" />
              <span>Quản lý &amp; Sao lưu Dữ liệu</span>
            </h2>

            <p className="text-slate-500 leading-relaxed">
              Dữ liệu giảng dạy, sổ điểm, hồ sơ học sinh và kế hoạch bài dạy được lưu trữ cục bộ bền vững trên trình duyệt.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleExportBackup}
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Tải tệp sao lưu dữ liệu (.JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 text-[#0756A8] border border-sky-300 rounded-md font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4 text-sky-600" />
                <span>Khôi phục từ tệp sao lưu (.JSON)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />

              <button
                onClick={handleResetToDefault}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-md font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Đặt lại dữ liệu mẫu của Thầy Dũng</span>
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-sky-50/60 rounded-xl border border-sky-100 p-4 space-y-2">
            <h3 className="font-bold text-[#063B7A] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0756A8]" />
              <span>Hệ thống Quản lý Dạy học THPT</span>
            </h3>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Phiên bản 2.5 được thiết kế tối ưu hóa theo quy định đánh giá học sinh THPT (Thông tư 22/2021/TT-BGDĐT).
            </p>
            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <div>Phông chữ bắt buộc: <strong>Times New Roman</strong></div>
              <div>Đơn vị: <strong>Trường THPT Tràng Định (Lạng Sơn)</strong></div>
              <div>Giáo viên phụ trách: <strong>Hoàng Việt Dũng</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
