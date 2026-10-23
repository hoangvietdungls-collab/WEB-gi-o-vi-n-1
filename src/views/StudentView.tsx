import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  FileSpreadsheet,
  Upload,
  Download,
  Eye,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { Student, ClassInfo, GradeRecord, GradeConfig } from '../types';
import { StorageService } from '../services/storage';
import { StudentModal } from '../components/modals/StudentModal';
import { StudentProfileModal } from '../components/modals/StudentProfileModal';

interface StudentViewProps {
  students: Student[];
  classes: ClassInfo[];
  grades: GradeRecord[];
  gradeConfig: GradeConfig;
  onRefreshData: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  students,
  classes,
  grades,
  gradeConfig,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Grade lookup
  const gradeMap = useMemo(() => {
    const map = new Map<string, GradeRecord>();
    grades.forEach(g => {
      if (g.semester === 'HKI' && g.subject === 'Hóa học') {
        map.set(g.studentId, g);
      }
    });
    return map;
  }, [grades]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedClass !== 'all' && s.className !== selectedClass) return false;
      if (genderFilter !== 'all' && s.gender !== genderFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCode = s.code.toLowerCase().includes(q);
        const matchPhone = s.parentPhone?.includes(q);
        if (!matchName && !matchCode && !matchPhone) return false;
      }
      return true;
    });
  }, [students, selectedClass, genderFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Delete student
  const handleDeleteStudent = (s: Student) => {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh ${s.name} (${s.code}) khỏi hệ thống?`)) {
      StorageService.deleteStudent(s.id);
      onRefreshData();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['STT', 'Mã HS', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Lớp', 'SĐT Học sinh', 'SĐT Phụ huynh', 'Ghi chú'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.code,
      s.name,
      s.dob || '',
      s.gender,
      s.className,
      s.phone || '',
      s.parentPhone || '',
      s.notes || '',
    ]);
    StorageService.exportCsv(`Danh-sach-hoc-sinh-${selectedClass}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#0756A8]" />
            <span>Quản lý Hồ sơ Học sinh</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tổng cộng: <strong className="text-slate-800">{students.length}</strong> học sinh thuộc các khối lớp THPT Tràng Định
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất danh sách</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm học sinh mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên học sinh, mã HS, SĐT phụ huynh..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Lớp:</span>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
            >
              <option value="all">Tất cả các lớp ({students.length} HS)</option>
              {classes.map(c => (
                <option key={c.id} value={c.code}>{c.code} ({c.studentCount} HS)</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Giới tính:</span>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#063B7A] text-white">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-4">Họ và tên</th>
                <th className="py-2.5 px-3 text-center">Lớp</th>
                <th className="py-2.5 px-3">Ngày sinh</th>
                <th className="py-2.5 px-3 text-center">Giới tính</th>
                <th className="py-2.5 px-3">SĐT Phụ huynh</th>
                <th className="py-2.5 px-3 text-center">ĐTB Hóa</th>
                <th className="py-2.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                    Không tìm thấy học sinh nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const g = gradeMap.get(s.id);
                  const avg = g?.avg;

                  return (
                    <tr key={s.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-500 font-semibold">{globalIdx}</td>
                      <td className="py-2 px-3 font-bold text-[#0756A8]">{s.code}</td>
                      <td className="py-2 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-700">{s.className}</td>
                      <td className="py-2 px-3 text-slate-600">{s.dob || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.gender === 'Nam' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {s.gender}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-mono">{s.parentPhone || '-'}</td>
                      <td className="py-2 px-3 text-center font-bold">
                        {avg !== null && avg !== undefined ? (
                          <span className={avg >= 8 ? 'text-emerald-700' : avg < 5 ? 'text-rose-600' : 'text-slate-800'}>
                            {avg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewingStudent(s)}
                            className="p-1 text-[#0756A8] hover:bg-sky-50 rounded"
                            title="Xem hồ sơ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                            title="Sửa học sinh"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Hiển thị {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(currentPage * pageSize, filteredStudents.length)} trong tổng số{' '}
            {filteredStudents.length} học sinh
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded text-xs font-bold ${
                  currentPage === p
                    ? 'bg-[#1677E8] text-white'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StudentProfileModal
        isOpen={!!viewingStudent}
        student={viewingStudent}
        gradeRecord={viewingStudent ? gradeMap.get(viewingStudent.id) || null : null}
        gradeConfig={gradeConfig}
        onClose={() => setViewingStudent(null)}
        onEdit={(std) => {
          setViewingStudent(null);
          setEditingStudent(std);
        }}
      />

      <StudentModal
        isOpen={isAddOpen || !!editingStudent}
        student={editingStudent}
        classes={classes}
        existingCodes={students.map(s => s.code)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingStudent(null);
        }}
        onSave={(data) => {
          if ('id' in data) {
            StorageService.updateStudent(data as Student);
          } else {
            StorageService.addStudent(data);
          }
          onRefreshData();
        }}
      />
    </div>
  );
};
