import React, { useState, useMemo } from 'react';
import {
  Users2,
  Plus,
  Search,
  Building,
  GraduationCap,
  Calendar,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  Award
} from 'lucide-react';
import { ClassInfo, Student, GradeRecord } from '../types';
import { ClassModal } from '../components/modals/ClassModal';
import { StorageService } from '../services/storage';

interface ClassViewProps {
  classes: ClassInfo[];
  students: Student[];
  grades: GradeRecord[];
  onRefreshData: () => void;
  onNavigateTab: (tab: any) => void;
}

export const ClassView: React.FC<ClassViewProps> = ({
  classes,
  students,
  grades,
  onRefreshData,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | '10' | '11' | '12'>('all');
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [viewingClass, setViewingClass] = useState<ClassInfo | null>(null);

  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      if (gradeFilter !== 'all' && String(c.grade) !== gradeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = c.code.toLowerCase().includes(q);
        const matchName = c.name.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      return true;
    });
  }, [classes, gradeFilter, searchQuery]);

  const handleDeleteClass = (c: ClassInfo) => {
    const count = students.filter(s => s.className === c.code || s.classId === c.id).length;
    if (count > 0) {
      alert(`Không thể xóa lớp ${c.code} vì hiện đang có ${count} học sinh thuộc lớp này. Vui lòng chuyển hoặc xóa học sinh trước!`);
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa lớp học ${c.code}?`)) {
      StorageService.deleteClass(c.id);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users2 className="w-6 h-6 text-[#0756A8]" />
            <span>Quản lý Lớp học</span>
          </h1>
          <p className="text-xs text-slate-500">
            Danh sách các lớp đang giảng dạy tại Trường THPT Tràng Định (Năm học 2024-2025)
          </p>
        </div>

        <button
          onClick={() => setIsAddClassOpen(true)}
          className="px-4 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lớp mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã lớp (10A1, 11A1) hoặc tên..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600">Khối:</span>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
          >
            <option value="all">Tất cả các khối</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const classStudents = students.filter(s => s.className === cls.code || s.classId === cls.id);
          const classGrades = grades.filter(g => g.classCode === cls.code);
          const avgs = classGrades.map(g => g.avg).filter((a): a is number => a !== null && a !== undefined);
          const classAvg = avgs.length ? (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1) : '--';

          return (
            <div
              key={cls.id}
              className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-sky-100 text-[#0756A8] font-bold text-lg flex items-center justify-center shadow-xs">
                      {cls.code}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
                      <p className="text-xs text-slate-500">Khối {cls.grade} • {cls.room}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-[#0756A8] border border-sky-100">
                    {cls.isSample ? 'Lớp mẫu' : 'Đang dạy'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">Sĩ số học sinh:</span>
                    <strong className="text-sm text-slate-900">{classStudents.length} HS</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                    <span className="text-slate-500 block">Điểm trung bình:</span>
                    <strong className="text-sm text-amber-700">{classAvg}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 italic">
                  {cls.note || 'Chưa có ghi chú đặc biệt cho lớp này.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setViewingClass(cls)}
                  className="text-[#0756A8] font-bold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem danh sách ({classStudents.length})</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingClass(cls)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                    title="Xóa lớp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Details Modal */}
      {viewingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-[#063B7A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Danh sách học sinh lớp {viewingClass.code}</h3>
                <p className="text-xs text-sky-200">{viewingClass.name} • GV: {viewingClass.teacher}</p>
              </div>
              <button onClick={() => setViewingClass(null)} className="p-1 rounded text-white hover:bg-white/20">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">STT</th>
                    <th className="py-2 px-3">Mã HS</th>
                    <th className="py-2 px-4">Họ và tên</th>
                    <th className="py-2 px-3 text-center">Giới tính</th>
                    <th className="py-2 px-3">SĐT Phụ huynh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.filter(s => s.className === viewingClass.code).map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-[#0756A8]">{s.code}</td>
                      <td className="py-2 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-2 px-3 text-center">{s.gender}</td>
                      <td className="py-2 px-3 text-slate-600">{s.parentPhone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  setViewingClass(null);
                  onNavigateTab('gradebook');
                }}
                className="px-4 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded font-bold"
              >
                Mở sổ điểm lớp {viewingClass.code}
              </button>
              <button
                onClick={() => setViewingClass(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Create / Edit Modal */}
      <ClassModal
        isOpen={isAddClassOpen || !!editingClass}
        classItem={editingClass}
        onClose={() => {
          setIsAddClassOpen(false);
          setEditingClass(null);
        }}
        onSave={(data) => {
          if ('id' in data) {
            StorageService.updateClass(data as ClassInfo);
          } else {
            StorageService.addClass(data);
          }
          onRefreshData();
        }}
      />
    </div>
  );
};
