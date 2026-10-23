import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Save,
  Sliders,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Filter,
  RefreshCw,
  PlusCircle,
  Download
} from 'lucide-react';
import { ClassInfo, Student, GradeRecord, GradeConfig } from '../types';
import { StorageService } from '../services/storage';
import { GradeConfigModal } from '../components/modals/GradeConfigModal';
import { calculateStudentAverage, calculateTier } from '../services/initialData';

interface GradebookViewProps {
  classes: ClassInfo[];
  students: Student[];
  grades: GradeRecord[];
  gradeConfig: GradeConfig;
  onRefreshData: () => void;
}

export const GradebookView: React.FC<GradebookViewProps> = ({
  classes,
  students,
  grades,
  gradeConfig,
  onRefreshData,
}) => {
  const [selectedClass, setSelectedClass] = useState('10A1');
  const [selectedSemester, setSelectedSemester] = useState<'HKI' | 'HKII'>('HKI');
  const [selectedSubject, setSelectedSubject] = useState('Hóa học');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Local copy of grades for the current view that the teacher edits directly
  const [editableGrades, setEditableGrades] = useState<GradeRecord[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({}); // key: `${recordId}_${field}`

  // Grid cell navigation refs
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sync editableGrades whenever selectedClass / selectedSemester changes or grades change from outside
  useEffect(() => {
    const classStudents = students.filter(s => s.className === selectedClass);
    const relevantGrades = classStudents.map(student => {
      const existing = grades.find(
        g => g.studentId === student.id && g.semester === selectedSemester && g.subject === selectedSubject
      );
      if (existing) {
        return { ...existing };
      }
      // If not exists, initialize
      return {
        id: `grd-${student.id}-${selectedSemester}`,
        studentId: student.id,
        studentCode: student.code,
        studentName: student.name,
        classCode: student.className,
        subject: selectedSubject,
        semester: selectedSemester,
        academicYear: '2024-2025',
        tx1: null,
        tx2: null,
        tx3: null,
        tx4: null,
        gk: null,
        ck: null,
        avg: null,
        tier: null,
      } as GradeRecord;
    });

    setEditableGrades(relevantGrades);
    setIsDirty(false);
    setErrors({});
  }, [selectedClass, selectedSemester, selectedSubject, students, grades]);

  // Handle cell change
  const handleScoreChange = (recordId: string, field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck', valStr: string) => {
    setIsDirty(true);
    const key = `${recordId}_${field}`;

    if (valStr === '' || valStr === undefined) {
      // Clear score
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);

      setEditableGrades(prev => prev.map(rec => {
        if (rec.id === recordId) {
          const updated = { ...rec, [field]: null };
          const avg = calculateStudentAverage(updated, gradeConfig);
          const tier = calculateTier(avg, gradeConfig);
          return { ...updated, avg, tier };
        }
        return rec;
      }));
      return;
    }

    const num = parseFloat(valStr.replace(',', '.'));
    if (isNaN(num) || num < 0 || num > 10) {
      setErrors(prev => ({ ...prev, [key]: 'Điểm phải từ 0 đến 10' }));
    } else {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }

    setEditableGrades(prev => prev.map(rec => {
      if (rec.id === recordId) {
        const updated = { ...rec, [field]: isNaN(num) ? null : num };
        const avg = calculateStudentAverage(updated, gradeConfig);
        const tier = calculateTier(avg, gradeConfig);
        return { ...updated, avg, tier };
      }
      return rec;
    }));
  };

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colField: string,
    filteredList: GradeRecord[]
  ) => {
    const fields = ['tx1', 'tx2', 'tx3', 'tx4', 'gk', 'ck'];
    const colIndex = fields.indexOf(colField);

    let nextRow = rowIndex;
    let nextCol = colIndex;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      nextRow = Math.max(0, rowIndex - 1);
    } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      nextRow = Math.min(filteredList.length - 1, rowIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      if ((e.target as HTMLInputElement).selectionStart === 0) {
        e.preventDefault();
        nextCol = Math.max(0, colIndex - 1);
      }
    } else if (e.key === 'ArrowRight') {
      const input = e.target as HTMLInputElement;
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        nextCol = Math.min(fields.length - 1, colIndex + 1);
      }
    }

    if (nextRow !== rowIndex || nextCol !== colIndex) {
      const targetRec = filteredList[nextRow];
      const targetField = fields[nextCol];
      const targetInput = inputRefs.current[`${targetRec.id}_${targetField}`];
      if (targetInput) {
        targetInput.focus();
        targetInput.select();
      }
    }
  };

  // Save changes
  const handleSaveAll = () => {
    if (Object.keys(errors).length > 0) {
      alert('Vui lòng kiểm tra lại các ô điểm bị báo lỗi đỏ (phải từ 0 đến 10).');
      return;
    }
    StorageService.batchUpdateGrades(editableGrades);
    setIsDirty(false);
    setSaveSuccessMsg('Đã lưu thành công dữ liệu sổ điểm!');
    onRefreshData();
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Filtered view list
  const filteredGrades = useMemo(() => {
    if (!searchQuery.trim()) return editableGrades;
    const q = searchQuery.toLowerCase().trim();
    return editableGrades.filter(
      g => g.studentName.toLowerCase().includes(q) || g.studentCode.toLowerCase().includes(q)
    );
  }, [editableGrades, searchQuery]);

  // Summary counts
  const totalInClass = editableGrades.length;
  const gradedCount = editableGrades.filter(g => g.avg !== null).length;
  const missingCount = totalInClass - gradedCount;
  const avgClass = useMemo(() => {
    const valids = editableGrades.map(g => g.avg).filter((a): a is number => a !== null && a !== undefined);
    if (!valids.length) return '--';
    const sum = valids.reduce((a, b) => a + b, 0);
    return (sum / valids.length).toFixed(1);
  }, [editableGrades]);

  // Export CSV
  const handleExport = () => {
    const headers = ['STT', 'Mã HS', 'Họ và tên', 'TX1', 'TX2', 'TX3', 'TX4', 'Giữa kỳ (GK)', 'Cuối kỳ (CK)', 'Điểm TB', 'Xếp loại'];
    const rows = filteredGrades.map((g, idx) => [
      idx + 1,
      g.studentCode,
      g.studentName,
      g.tx1 ?? '',
      g.tx2 ?? '',
      g.tx3 ?? '',
      g.tx4 ?? '',
      g.gk ?? '',
      g.ck ?? '',
      g.avg !== null && g.avg !== undefined ? g.avg.toFixed(1) : '',
      g.tier || '',
    ]);
    StorageService.exportCsv(`So-diem-${selectedClass}-${selectedSemester}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Filter Row */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-[#0756A8]" />
              <span>Sổ điểm điện tử môn {selectedSubject}</span>
            </h1>
            <p className="text-xs text-slate-500">
              Trường THPT Tràng Định • Giáo viên: Hoàng Việt Dũng • Năm học 2024-2025
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-[#063B7A] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-4 h-4 text-[#0756A8]" />
              <span>Cấu hình tính điểm</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleSaveAll}
              className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 shadow transition-all ${
                isDirty
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-[#063B7A] hover:bg-[#0756A8] text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isDirty ? 'Lưu thay đổi (*)' : 'Lưu sổ điểm'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Lớp học:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md font-bold text-[#0756A8] bg-white focus:outline-none"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.code}>{c.code} ({c.studentCount} HS)</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Học kỳ:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as 'HKI' | 'HKII')}
                className="px-2.5 py-1.5 border border-slate-300 rounded-md font-bold text-slate-800 bg-white focus:outline-none"
              >
                <option value="HKI">Học kỳ I</option>
                <option value="HKII">Học kỳ II</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Môn học:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold text-slate-800 bg-white focus:outline-none"
              >
                <option value="Hóa học">Hóa học</option>
                <option value="Sinh học">Sinh học</option>
                <option value="Vật lí">Vật lí</option>
              </select>
            </div>
          </div>

          {/* Quick search in gradebook */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh học sinh theo tên, mã..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="bg-sky-50/70 p-2.5 rounded-lg border border-sky-100 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-4 text-slate-700">
            <span>Sĩ số lớp: <strong className="text-slate-900">{totalInClass}</strong></span>
            <span>Đã đủ điểm: <strong className="text-emerald-700">{gradedCount}</strong></span>
            {missingCount > 0 && (
              <span className="text-amber-800 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Còn thiếu điểm: {missingCount}</span>
              </span>
            )}
            <span>Điểm trung bình lớp: <strong className="text-[#0756A8] text-sm">{avgClass}</strong></span>
          </div>

          <div className="text-[11px] text-slate-500 italic">
            * Nhấn phím mũi tên ↑ ↓ ← → hoặc Enter để chuyển nhanh giữa các ô điểm.
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-[#063B7A] text-white select-none">
              <tr>
                <th className="py-2.5 px-3 w-12 border border-sky-900">STT</th>
                <th className="py-2.5 px-3 w-20 border border-sky-900 text-left">Mã HS</th>
                <th className="py-2.5 px-4 text-left border border-sky-900 min-w-[160px]">Họ và tên</th>
                <th className="py-2 px-2 border border-sky-900 bg-[#0756A8] w-20" title="Kiểm tra thường xuyên 1 (HS 1)">
                  TX 1 (HS 1)
                </th>
                <th className="py-2 px-2 border border-sky-900 bg-[#0756A8] w-20" title="Kiểm tra thường xuyên 2 (HS 1)">
                  TX 2 (HS 1)
                </th>
                <th className="py-2 px-2 border border-sky-900 bg-[#0756A8] w-20" title="Kiểm tra thường xuyên 3 (HS 1)">
                  TX 3 (HS 1)
                </th>
                <th className="py-2 px-2 border border-sky-900 bg-[#0756A8] w-20" title="Kiểm tra thường xuyên 4 (HS 1)">
                  TX 4 (HS 1)
                </th>
                <th className="py-2 px-2 border border-sky-900 bg-[#052c5c] w-24 font-bold" title="Điểm kiểm tra Giữa kỳ (HS 2)">
                  Giữa kỳ (HS 2)
                </th>
                <th className="py-2 px-2 border border-sky-900 bg-[#04244d] w-24 font-bold" title="Điểm kiểm tra Cuối kỳ (HS 3)">
                  Cuối kỳ (HS 3)
                </th>
                <th className="py-2 px-3 border border-sky-900 bg-amber-600 font-bold w-20">
                  Điểm TB
                </th>
                <th className="py-2 px-3 border border-sky-900 bg-emerald-700 font-bold w-24">
                  Xếp loại
                </th>
                <th className="py-2 px-3 border border-sky-900 min-w-[140px] text-left">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 italic">
                    Chưa có học sinh nào trong lớp này.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((rec, rowIndex) => {
                  const avg = rec.avg;
                  const tier = rec.tier;

                  return (
                    <tr key={rec.id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="py-1.5 px-2 text-slate-500 font-semibold border border-slate-200">
                        {rowIndex + 1}
                      </td>
                      <td className="py-1.5 px-3 text-left font-bold text-[#0756A8] border border-slate-200">
                        {rec.studentCode}
                      </td>
                      <td className="py-1.5 px-4 text-left font-bold text-slate-800 border border-slate-200 whitespace-nowrap">
                        {rec.studentName}
                      </td>

                      {/* TX1 */}
                      <td className="p-1 border border-slate-200">
                        <input
                          ref={(el) => { inputRefs.current[`${rec.id}_tx1`] = el; }}
                          type="text"
                          value={rec.tx1 !== null && rec.tx1 !== undefined ? rec.tx1 : ''}
                          onChange={(e) => handleScoreChange(rec.id, 'tx1', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 'tx1', filteredGrades)}
                          placeholder="-"
                          className={`w-full text-center py-1 rounded text-xs font-bold border transition-colors ${
                            errors[`${rec.id}_tx1`]
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : rec.tx1 === null || rec.tx1 === undefined
                              ? 'border-dashed border-amber-300 bg-amber-50/30 text-slate-400'
                              : 'border-slate-200 text-slate-800 focus:bg-sky-50 focus:border-sky-500'
                          }`}
                        />
                      </td>

                      {/* TX2 */}
                      <td className="p-1 border border-slate-200">
                        <input
                          ref={(el) => { inputRefs.current[`${rec.id}_tx2`] = el; }}
                          type="text"
                          value={rec.tx2 !== null && rec.tx2 !== undefined ? rec.tx2 : ''}
                          onChange={(e) => handleScoreChange(rec.id, 'tx2', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 'tx2', filteredGrades)}
                          placeholder="-"
                          className={`w-full text-center py-1 rounded text-xs font-bold border transition-colors ${
                            errors[`${rec.id}_tx2`]
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : rec.tx2 === null || rec.tx2 === undefined
                              ? 'border-dashed border-amber-300 bg-amber-50/30 text-slate-400'
                              : 'border-slate-200 text-slate-800 focus:bg-sky-50 focus:border-sky-500'
                          }`}
                        />
                      </td>

                      {/* TX3 */}
                      <td className="p-1 border border-slate-200">
                        <input
                          ref={(el) => { inputRefs.current[`${rec.id}_tx3`] = el; }}
                          type="text"
                          value={rec.tx3 !== null && rec.tx3 !== undefined ? rec.tx3 : ''}
                          onChange={(e) => handleScoreChange(rec.id, 'tx3', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 'tx3', filteredGrades)}
                          placeholder="-"
                          className={`w-full text-center py-1 rounded text-xs font-bold border transition-colors ${
                            errors[`${rec.id}_tx3`]
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : rec.tx3 === null || rec.tx3 === undefined
                              ? 'border-dashed border-amber-300 bg-amber-50/30 text-slate-400'
                              : 'border-slate-200 text-slate-800 focus:bg-sky-50 focus:border-sky-500'
                          }`}
                        />
                      </td>

                      {/* TX4 */}
                      <td className="p-1 border border-slate-200">
                        <input
                          ref={(el) => { inputRefs.current[`${rec.id}_tx4`] = el; }}
                          type="text"
                          value={rec.tx4 !== null && rec.tx4 !== undefined ? rec.tx4 : ''}
                          onChange={(e) => handleScoreChange(rec.id, 'tx4', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 'tx4', filteredGrades)}
                          placeholder="-"
                          className={`w-full text-center py-1 rounded text-xs font-bold border transition-colors ${
                            errors[`${rec.id}_tx4`]
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : rec.tx4 === null || rec.tx4 === undefined
                              ? 'border-dashed border-amber-300 bg-amber-50/30 text-slate-400'
                              : 'border-slate-200 text-slate-800 focus:bg-sky-50 focus:border-sky-500'
                          }`}
                        />
                      </td>

                      {/* Giữa kỳ (GK) */}
                      <td className="p-1 border border-slate-200 bg-sky-50/30">
                        <input
                          ref={(el) => { inputRefs.current[`${rec.id}_gk`] = el; }}
                          type="text"
                          value={rec.gk !== null && rec.gk !== undefined ? rec.gk : ''}
                          onChange={(e) => handleScoreChange(rec.id, 'gk', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 'gk', filteredGrades)}
                          placeholder="-"
                          className={`w-full text-center py-1 rounded text-xs font-extrabold border transition-colors ${
                            errors[`${rec.id}_gk`]
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : rec.gk === null || rec.gk === undefined
                              ? 'border-dashed border-amber-400 bg-amber-50/40 text-slate-400'
                              : 'border-sky-300 text-sky-900 bg-sky-50/70 focus:bg-sky-100'
                          }`}
                        />
                      </td>

                      {/* Cuối kỳ (CK) */}
                      <td className="p-1 border border-slate-200 bg-indigo-50/30">
                        <input
                          ref={(el) => { inputRefs.current[`${rec.id}_ck`] = el; }}
                          type="text"
                          value={rec.ck !== null && rec.ck !== undefined ? rec.ck : ''}
                          onChange={(e) => handleScoreChange(rec.id, 'ck', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 'ck', filteredGrades)}
                          placeholder="-"
                          className={`w-full text-center py-1 rounded text-xs font-extrabold border transition-colors ${
                            errors[`${rec.id}_ck`]
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : rec.ck === null || rec.ck === undefined
                              ? 'border-dashed border-amber-400 bg-amber-50/40 text-slate-400'
                              : 'border-indigo-300 text-indigo-900 bg-indigo-50/70 focus:bg-indigo-100'
                          }`}
                        />
                      </td>

                      {/* Điểm TB */}
                      <td className="py-2 px-2 font-bold text-sm text-slate-900 bg-amber-50/40 border border-slate-200">
                        {avg !== null && avg !== undefined ? (
                          <span className={avg < 5.0 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>
                            {avg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>

                      {/* Xếp loại */}
                      <td className="py-2 px-2 border border-slate-200">
                        {tier === 'Giỏi' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            Giỏi
                          </span>
                        )}
                        {tier === 'Khá' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            Khá
                          </span>
                        )}
                        {tier === 'Trung bình' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                            Trung bình
                          </span>
                        )}
                        {tier === 'Yếu' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            Yếu
                          </span>
                        )}
                        {!tier && <span className="text-slate-400 text-xs">--</span>}
                      </td>

                      {/* Ghi chú */}
                      <td className="p-1 border border-slate-200 text-left">
                        <input
                          type="text"
                          value={rec.note || ''}
                          onChange={(e) => {
                            setIsDirty(true);
                            setEditableGrades(prev => prev.map(r => r.id === rec.id ? { ...r, note: e.target.value } : r));
                          }}
                          placeholder="Ghi chú..."
                          className="w-full px-2 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-sky-500 rounded bg-transparent focus:bg-white"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Hiển thị <strong className="text-slate-900">{filteredGrades.length}</strong> học sinh lớp{' '}
            <strong>{selectedClass}</strong>. Các ô viền nét đứt vàng là ô chưa có đầu điểm.
          </div>
          <button
            onClick={handleSaveAll}
            className="px-4 py-1.5 bg-[#063B7A] hover:bg-[#0756A8] text-white font-bold rounded shadow-xs"
          >
            Lưu sổ điểm ({selectedClass})
          </button>
        </div>
      </div>

      {/* Grade Config Modal */}
      <GradeConfigModal
        isOpen={isConfigOpen}
        config={gradeConfig}
        onClose={() => setIsConfigOpen(false)}
        onSave={(newCfg) => {
          StorageService.saveGradeConfig(newCfg);
          onRefreshData();
        }}
      />
    </div>
  );
};
