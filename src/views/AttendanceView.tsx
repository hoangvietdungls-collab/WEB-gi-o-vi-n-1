import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCheck,
  Save,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  Eye,
  Trash2,
  Phone,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import {
  ClassInfo,
  Student,
  AttendanceSession,
  AttendanceStatus,
  StudentAttendanceItem
} from '../types';
import { StorageService } from '../services/storage';

interface AttendanceViewProps {
  classes: ClassInfo[];
  students: Student[];
  sessions: AttendanceSession[];
  onRefreshData: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  classes,
  students,
  sessions,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'session' | 'history' | 'summary'>('session');

  // Current session parameters
  const [selectedDate, setSelectedDate] = useState('2025-04-28');
  const [selectedClass, setSelectedClass] = useState('10A1');
  const [selectedPeriod, setSelectedPeriod] = useState('Tiết 1');
  const [sessionTopic, setSessionTopic] = useState('Bài 32: Luyện tập Oxi - Lưu huỳnh');
  const [generalNotes, setGeneralNotes] = useState('Lớp học trật tự, tập trung nghe giảng.');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Active session records
  const [currentRecords, setCurrentRecords] = useState<StudentAttendanceItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Load or initialize records when class/date/period changes
  useEffect(() => {
    // Check if an existing session exists for this date, class and period
    const existing = sessions.find(
      s => s.date === selectedDate && s.classCode === selectedClass && s.period === selectedPeriod
    );

    const classStudents = students.filter(s => s.className === selectedClass);

    if (existing) {
      setSessionTopic(existing.topic || '');
      setGeneralNotes(existing.generalNotes || '');
      // Ensure all current class students are represented
      const recordsMap = new Map(existing.records.map(r => [r.studentId, r]));
      const merged = classStudents.map(std => {
        if (recordsMap.has(std.id)) {
          return recordsMap.get(std.id)!;
        }
        return {
          studentId: std.id,
          studentCode: std.code,
          studentName: std.name,
          status: 'present' as AttendanceStatus,
          note: '',
          parentPhone: std.parentPhone,
        };
      });
      setCurrentRecords(merged);
    } else {
      // New session: default all students to 'present'
      const init = classStudents.map(std => ({
        studentId: std.id,
        studentCode: std.code,
        studentName: std.name,
        status: 'present' as AttendanceStatus,
        note: '',
        parentPhone: std.parentPhone,
      }));
      setCurrentRecords(init);
    }
    setIsDirty(false);
  }, [selectedDate, selectedClass, selectedPeriod, sessions, students]);

  // Compute counters
  const totalCount = currentRecords.length;
  const presentCount = currentRecords.filter(r => r.status === 'present').length;
  const excusedCount = currentRecords.filter(r => r.status === 'excused').length;
  const unexcusedCount = currentRecords.filter(r => r.status === 'unexcused').length;
  const lateCount = currentRecords.filter(r => r.status === 'late').length;

  // Change individual student status
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setIsDirty(true);
    setCurrentRecords(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, status: newStatus } : item))
    );
  };

  // Change individual note
  const handleNoteChange = (studentId: string, noteText: string) => {
    setIsDirty(true);
    setCurrentRecords(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, note: noteText } : item))
    );
  };

  // Speed action: mark all present
  const handleMarkAllPresent = () => {
    setIsDirty(true);
    setCurrentRecords(prev =>
      prev.map(item => ({ ...item, status: 'present', note: '' }))
    );
  };

  // Save session
  const handleSaveSession = () => {
    const sessionId = `att-${selectedDate}-${selectedClass}-${selectedPeriod.replace(/\s+/g, '')}`;
    const newSession: AttendanceSession = {
      id: sessionId,
      date: selectedDate,
      classCode: selectedClass,
      period: selectedPeriod,
      subject: 'Hóa học',
      topic: sessionTopic.trim(),
      totalStudents: totalCount,
      presentCount,
      excusedCount,
      unexcusedCount,
      lateCount,
      records: currentRecords,
      generalNotes: generalNotes.trim(),
      createdAt: `${selectedDate} 08:00`,
    };

    StorageService.saveOrUpdateAttendanceSession(newSession);
    setIsDirty(false);
    setSaveSuccessMsg(`Đã lưu thành công điểm danh lớp ${selectedClass} (${selectedPeriod} ngày ${selectedDate})!`);
    onRefreshData();
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Delete past session
  const handleDeleteSession = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa dữ liệu buổi điểm danh này?')) {
      StorageService.deleteAttendanceSession(id);
      onRefreshData();
    }
  };

  // Filtered records for current search
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return currentRecords;
    const q = searchQuery.toLowerCase().trim();
    return currentRecords.filter(
      r => r.studentName.toLowerCase().includes(q) || r.studentCode.toLowerCase().includes(q)
    );
  }, [currentRecords, searchQuery]);

  // Export current session to Excel / CSV
  const handleExportSession = () => {
    const headers = ['STT', 'Mã HS', 'Họ và tên', 'Trạng thái điểm danh', 'Lý do / Ghi chú vắng', 'SĐT Phụ huynh'];
    const rows = currentRecords.map((r, idx) => {
      const statusLabel =
        r.status === 'present'
          ? 'Có mặt'
          : r.status === 'excused'
          ? 'Vắng có phép'
          : r.status === 'unexcused'
          ? 'Vắng không phép'
          : 'Đi muộn';
      return [idx + 1, r.studentCode, r.studentName, statusLabel, r.note || '', r.parentPhone || ''];
    });
    StorageService.exportCsv(`Diem-danh-${selectedClass}-${selectedDate}-${selectedPeriod}.csv`, headers, rows);
  };

  // Summary statistics aggregated per student across all sessions
  const studentAttendanceStats = useMemo(() => {
    const classStudents = students.filter(s => selectedClass === 'all' || s.className === selectedClass);
    return classStudents.map(std => {
      let totalAssessed = 0;
      let present = 0;
      let excused = 0;
      let unexcused = 0;
      let late = 0;

      sessions.forEach(sess => {
        if (sess.classCode === std.className) {
          const record = sess.records.find(r => r.studentId === std.id || r.studentCode === std.code);
          if (record) {
            totalAssessed++;
            if (record.status === 'present') present++;
            else if (record.status === 'excused') excused++;
            else if (record.status === 'unexcused') unexcused++;
            else if (record.status === 'late') late++;
          }
        }
      });

      const totalAbsent = excused + unexcused;
      const rate = totalAssessed > 0 ? Math.round(((present + late) / totalAssessed) * 100) : 100;

      return {
        student: std,
        totalAssessed,
        present,
        excused,
        unexcused,
        late,
        totalAbsent,
        rate,
      };
    });
  }, [students, sessions, selectedClass]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-[#0756A8]" />
              <span>Phân hệ Điểm danh &amp; Theo dõi Chuyên cần</span>
            </h1>
            <p className="text-xs text-slate-500">
              Trường THPT Tràng Định • Môn Hóa học • Giáo viên: Hoàng Việt Dũng
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSession}
              className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleSaveSession}
              className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 shadow transition-all ${
                isDirty
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-[#063B7A] hover:bg-[#0756A8] text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isDirty ? 'Lưu điểm danh (*)' : 'Lưu buổi điểm danh'}</span>
            </button>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 pt-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('session')}
            className={`pb-2 px-4 border-b-2 transition-colors ${
              activeTab === 'session'
                ? 'border-[#1677E8] text-[#1677E8]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Điểm danh buổi dạy
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-4 border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-[#1677E8] text-[#1677E8]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Lịch sử các buổi điểm danh ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2 px-4 border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-[#1677E8] text-[#1677E8]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Thống kê chuyên cần cả kỳ
          </button>
        </div>

        {saveSuccessMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* TAB 1: Điểm danh buổi dạy */}
      {activeTab === 'session' && (
        <div className="space-y-4">
          {/* Session Parameters Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày giảng dạy</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lớp học</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-bold text-[#0756A8] bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.code}>{c.code} ({c.studentCount} HS)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiết dạy</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-semibold text-slate-800 bg-white"
                >
                  <option value="Tiết 1">Tiết 1 (07:15 - 08:00)</option>
                  <option value="Tiết 2">Tiết 2 (08:05 - 08:50)</option>
                  <option value="Tiết 3">Tiết 3 (09:05 - 09:50)</option>
                  <option value="Tiết 4">Tiết 4 (10:00 - 10:45)</option>
                  <option value="Tiết 5">Tiết 5 (10:50 - 11:35)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên bài học / Chủ đề</label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => {
                    setIsDirty(true);
                    setSessionTopic(e.target.value);
                  }}
                  placeholder="VD: Bài 32: Luyện tập Oxi - Lưu huỳnh"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Sĩ số và các con số thống kê của buổi điểm danh */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-800 font-bold">
                  Sĩ số: {totalCount}
                </span>
                <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Có mặt: {presentCount}</span>
                </span>
                <span className="px-3 py-1 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Có phép: {excusedCount}</span>
                </span>
                <span className="px-3 py-1 rounded-md bg-rose-100 text-rose-800 font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Không phép: {unexcusedCount}</span>
                </span>
                <span className="px-3 py-1 rounded-md bg-orange-100 text-orange-800 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Đi muộn: {lateCount}</span>
                </span>
              </div>

              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-[#063B7A] rounded-md font-bold flex items-center gap-1.5 transition-colors"
                title="Đánh dấu tất cả học sinh trong lớp là Có mặt"
              >
                <CheckCheck className="w-4 h-4 text-[#0756A8]" />
                <span>Điểm danh tất cả Có mặt</span>
              </button>
            </div>
          </div>

          {/* Search box within attendance sheet */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-3 flex items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm học sinh theo tên hoặc mã..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <span className="text-slate-500 text-[11px] italic">
              * Nhấp vào các nút trạng thái tương ứng với từng học sinh để cập nhật.
            </span>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#063B7A] text-white">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">STT</th>
                    <th className="py-2.5 px-3 w-20">Mã HS</th>
                    <th className="py-2.5 px-4 min-w-[150px]">Họ và tên</th>
                    <th className="py-2.5 px-3 text-center min-w-[280px]">Trạng thái điểm danh</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Lý do / Ghi chú vắng</th>
                    <th className="py-2.5 px-3 w-36">SĐT Phụ huynh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        Không tìm thấy học sinh nào trong lớp {selectedClass}.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item, idx) => {
                      return (
                        <tr
                          key={item.studentId}
                          className={`transition-colors ${
                            item.status === 'unexcused'
                              ? 'bg-rose-50/50'
                              : item.status === 'excused'
                              ? 'bg-amber-50/40'
                              : item.status === 'late'
                              ? 'bg-orange-50/40'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-[#0756A8]">{item.studentCode}</td>
                          <td className="py-2 px-4 font-bold text-slate-800 whitespace-nowrap">
                            {item.studentName}
                          </td>

                          {/* 4 Status Toggle Buttons */}
                          <td className="py-2 px-3 text-center">
                            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 gap-1">
                              {/* Có mặt */}
                              <button
                                onClick={() => handleStatusChange(item.studentId, 'present')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                  item.status === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-emerald-700'
                                }`}
                              >
                                Có mặt
                              </button>

                              {/* Có phép */}
                              <button
                                onClick={() => handleStatusChange(item.studentId, 'excused')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                  item.status === 'excused'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-amber-700'
                                }`}
                              >
                                Có phép
                              </button>

                              {/* Không phép */}
                              <button
                                onClick={() => handleStatusChange(item.studentId, 'unexcused')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                  item.status === 'unexcused'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-rose-700'
                                }`}
                              >
                                K.Phép
                              </button>

                              {/* Đi muộn */}
                              <button
                                onClick={() => handleStatusChange(item.studentId, 'late')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                  item.status === 'late'
                                    ? 'bg-orange-500 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-orange-700'
                                }`}
                              >
                                Muộn
                              </button>
                            </div>
                          </td>

                          {/* Ghi chú lý do */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.note || ''}
                              onChange={(e) => handleNoteChange(item.studentId, e.target.value)}
                              placeholder={
                                item.status === 'excused'
                                  ? 'Nhập lý do có đơn xin phép...'
                                  : item.status === 'unexcused'
                                  ? 'Vắng không phép, cần liên hệ phụ huynh...'
                                  : item.status === 'late'
                                  ? 'Số phút đi muộn, lý do...'
                                  : 'Ghi chú...'
                              }
                              className={`w-full px-2 py-1 border rounded text-xs transition-colors ${
                                item.status === 'unexcused'
                                  ? 'border-rose-300 bg-white text-rose-800 placeholder-rose-300'
                                  : item.status === 'excused'
                                  ? 'border-amber-300 bg-white text-amber-800 placeholder-amber-300'
                                  : 'border-slate-200 bg-slate-50 focus:bg-white text-slate-700'
                              }`}
                            />
                          </td>

                          {/* SĐT Phụ huynh */}
                          <td className="py-2 px-3 text-slate-600">
                            {item.parentPhone ? (
                              <a
                                href={`tel:${item.parentPhone}`}
                                className="font-mono text-[11px] text-[#0756A8] hover:underline flex items-center gap-1"
                                title="Nhấp để gọi phụ huynh"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{item.parentPhone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with save button */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Lớp <strong className="text-slate-800">{selectedClass}</strong> • {selectedPeriod} • Ngày {selectedDate}
              </span>
              <button
                onClick={handleSaveSession}
                className="px-5 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white font-bold rounded shadow-xs transition-colors"
              >
                Lưu kết quả điểm danh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Lịch sử các buổi điểm danh */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <h3 className="font-bold text-sm text-slate-800">
              Nhật ký các buổi điểm danh đã thực hiện
            </h3>
            <span className="text-slate-500">Tổng số: {sessions.length} buổi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#063B7A] text-white">
                <tr>
                  <th className="py-2.5 px-3">Ngày</th>
                  <th className="py-2.5 px-2 text-center">Tiết</th>
                  <th className="py-2.5 px-2 text-center">Lớp</th>
                  <th className="py-2.5 px-4">Bài học / Chủ đề</th>
                  <th className="py-2.5 px-2 text-center">Sĩ số</th>
                  <th className="py-2.5 px-2 text-center text-emerald-300">Có mặt</th>
                  <th className="py-2.5 px-2 text-center text-amber-300">Có phép</th>
                  <th className="py-2.5 px-2 text-center text-rose-300">K.Phép</th>
                  <th className="py-2.5 px-2 text-center text-orange-300">Muộn</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                      Chưa có buổi điểm danh nào được lưu.
                    </td>
                  </tr>
                ) : (
                  sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{sess.date}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-[#0756A8]">{sess.period}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-700">{sess.classCode}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{sess.topic || '-'}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-700">{sess.totalStudents}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-700">{sess.presentCount}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-amber-700">{sess.excusedCount}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-rose-600">{sess.unexcusedCount}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-orange-600">{sess.lateCount}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedDate(sess.date);
                              setSelectedClass(sess.classCode);
                              setSelectedPeriod(sess.period);
                              setActiveTab('session');
                            }}
                            className="text-[#0756A8] hover:underline font-bold"
                          >
                            Mở xem
                          </button>
                          <button
                            onClick={() => handleDeleteSession(sess.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded"
                            title="Xóa buổi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Thống kê chuyên cần cả kỳ */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                Thống kê Chuyên cần Toàn diện Học sinh
              </h3>
              <p className="text-slate-500">
                Tổng hợp từ tất cả các buổi điểm danh trong học kỳ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Lớp:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
              >
                <option value="all">Tất cả các lớp</option>
                {classes.map(c => (
                  <option key={c.id} value={c.code}>{c.code}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  const headers = ['STT', 'Mã HS', 'Họ và tên', 'Lớp', 'Tổng buổi học', 'Có mặt', 'Có phép', 'Không phép', 'Đi muộn', 'Tỷ lệ chuyên cần (%)'];
                  const rows = studentAttendanceStats.map((item, idx) => [
                    idx + 1,
                    item.student.code,
                    item.student.name,
                    item.student.className,
                    item.totalAssessed,
                    item.present,
                    item.excused,
                    item.unexcused,
                    item.late,
                    `${item.rate}%`,
                  ]);
                  StorageService.exportCsv(`Thong-ke-chuyen-can-${selectedClass}.csv`, headers, rows);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất thống kê Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#063B7A] text-white">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">STT</th>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-4">Họ và tên</th>
                  <th className="py-2.5 px-2 text-center">Lớp</th>
                  <th className="py-2.5 px-2 text-center">Tổng buổi</th>
                  <th className="py-2.5 px-2 text-center text-emerald-300">Có mặt</th>
                  <th className="py-2.5 px-2 text-center text-amber-300">Có phép</th>
                  <th className="py-2.5 px-2 text-center text-rose-300">K.Phép</th>
                  <th className="py-2.5 px-2 text-center text-orange-300">Đi muộn</th>
                  <th className="py-2.5 px-3 text-center">Tỷ lệ chuyên cần</th>
                  <th className="py-2.5 px-3 text-center">Cảnh báo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentAttendanceStats.map((item, idx) => {
                  const hasWarning = item.unexcused > 0 || item.totalAbsent >= 2;
                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-[#0756A8]">{item.student.code}</td>
                      <td className="py-2 px-4 font-bold text-slate-800">{item.student.name}</td>
                      <td className="py-2 px-2 text-center font-semibold text-slate-700">{item.student.className}</td>
                      <td className="py-2 px-2 text-center font-bold text-slate-700">{item.totalAssessed}</td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-700">{item.present}</td>
                      <td className="py-2 px-2 text-center font-bold text-amber-700">{item.excused}</td>
                      <td className="py-2 px-2 text-center font-bold text-rose-600">
                        {item.unexcused > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">{item.unexcused}</span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-orange-600">{item.late}</td>
                      <td className="py-2 px-3 text-center font-bold">
                        <span className={item.rate < 90 ? 'text-rose-600' : 'text-emerald-700'}>
                          {item.rate}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {hasWarning ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Vắng {item.totalAbsent} buổi</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-[11px] font-semibold">Tốt</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
