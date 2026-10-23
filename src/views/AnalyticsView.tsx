import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Award,
  Users,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { ClassInfo, Student, GradeRecord, GradeConfig } from '../types';
import { BarChart } from '../components/charts/BarChart';
import { PieChart, PieSlice } from '../components/charts/PieChart';
import { StorageService } from '../services/storage';

interface AnalyticsViewProps {
  classes: ClassInfo[];
  students: Student[];
  grades: GradeRecord[];
  gradeConfig: GradeConfig;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  classes,
  students,
  grades,
  gradeConfig,
}) => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState<'HKI' | 'HKII'>('HKI');
  const [selectedSubject, setSelectedSubject] = useState('Hóa học');

  // Filter grades
  const relevantGrades = useMemo(() => {
    return grades.filter(g => {
      if (selectedClass !== 'all' && g.classCode !== selectedClass) return false;
      if (g.semester !== selectedSemester) return false;
      if (g.subject !== selectedSubject) return false;
      return true;
    });
  }, [grades, selectedClass, selectedSemester, selectedSubject]);

  // Overall average
  const validAvgs = useMemo(() => {
    return relevantGrades.map(g => g.avg).filter((a): a is number => a !== null && a !== undefined);
  }, [relevantGrades]);

  const overallAvg = validAvgs.length ? (validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length).toFixed(1) : '--';

  // Bar Chart Data (by class)
  const barChartData = useMemo(() => {
    const list = selectedClass === 'all' ? classes.map(c => c.code) : [selectedClass];
    return list.map(code => {
      const clsGrades = grades.filter(
        g => g.classCode === code && g.semester === selectedSemester && g.subject === selectedSubject && g.avg !== null
      );
      const avgs = clsGrades.map(g => g.avg!);
      const avg = avgs.length ? Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10 : 7.0;
      return {
        label: code,
        value: avg,
        count: clsGrades.length,
      };
    });
  }, [classes, grades, selectedClass, selectedSemester, selectedSubject]);

  // Pie Chart Data (distribution)
  const pieChartData: PieSlice[] = useMemo(() => {
    let c8to10 = 0, c65to79 = 0, c5to64 = 0, c35to49 = 0, cUnder35 = 0;
    validAvgs.forEach(s => {
      if (s >= 8.0) c8to10++;
      else if (s >= 6.5) c65to79++;
      else if (s >= 5.0) c5to64++;
      else if (s >= 3.5) c35to49++;
      else cUnder35++;
    });
    const total = validAvgs.length || 1;
    return [
      { label: 'Từ 8 - 10 (Giỏi)', count: c8to10, percentage: Math.round((c8to10 / total) * 100), color: '#1677E8', rangeKey: '8-10' },
      { label: 'Từ 6,5 - 7,9 (Khá)', count: c65to79, percentage: Math.round((c65to79 / total) * 100), color: '#10B981', rangeKey: '6.5-7.9' },
      { label: 'Từ 5 - 6,4 (TB)', count: c5to64, percentage: Math.round((c5to64 / total) * 100), color: '#F59E0B', rangeKey: '5-6.4' },
      { label: 'Từ 3,5 - 4,9 (Yếu)', count: c35to49, percentage: Math.round((c35to49 / total) * 100), color: '#8B5CF6', rangeKey: '3.5-4.9' },
      { label: 'Dưới 3,5 (Kém)', count: cUnder35, percentage: Math.round((cUnder35 / total) * 100), color: '#EF4444', rangeKey: '<3.5' },
    ];
  }, [validAvgs]);

  // Students needing assistance (avg < 5.0)
  const lowScorers = useMemo(() => {
    return relevantGrades
      .filter(g => g.avg !== null && g.avg !== undefined && g.avg < gradeConfig.avgThreshold)
      .sort((a, b) => (a.avg || 0) - (b.avg || 0));
  }, [relevantGrades, gradeConfig]);

  // High achievers (avg >= 8.0)
  const topScorers = useMemo(() => {
    return relevantGrades
      .filter(g => g.avg !== null && g.avg !== undefined && g.avg >= gradeConfig.goodThreshold)
      .sort((a, b) => (b.avg || 0) - (a.avg || 0));
  }, [relevantGrades, gradeConfig]);

  // Exam Comparison averages
  const examAverages = useMemo(() => {
    const calcAvg = (key: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck') => {
      const vals = relevantGrades.map(g => g[key]).filter((v): v is number => v !== null && v !== undefined);
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '--';
    };
    return [
      { name: 'Kiểm tra TX 1', avg: calcAvg('tx1'), weight: 'Hệ số 1' },
      { name: 'Kiểm tra TX 2', avg: calcAvg('tx2'), weight: 'Hệ số 1' },
      { name: 'Kiểm tra TX 3', avg: calcAvg('tx3'), weight: 'Hệ số 1' },
      { name: 'Kiểm tra TX 4', avg: calcAvg('tx4'), weight: 'Hệ số 1' },
      { name: 'Kiểm tra Giữa kỳ (GK)', avg: calcAvg('gk'), weight: 'Hệ số 2' },
      { name: 'Kiểm tra Cuối kỳ (CK)', avg: calcAvg('ck'), weight: 'Hệ số 3' },
    ];
  }, [relevantGrades]);

  // Missing grades count
  const missingScores = useMemo(() => {
    return relevantGrades.filter(g => g.tx1 == null || g.tx2 == null || g.gk == null || g.ck == null);
  }, [relevantGrades]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#0756A8]" />
            <span>Thống kê &amp; Phân tích Kết quả Học tập</span>
          </h1>
          <p className="text-xs text-slate-500">
            Dữ liệu tổng hợp thực tế môn {selectedSubject} • Trường THPT Tràng Định
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md font-bold text-[#0756A8] bg-white"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map(c => (
              <option key={c.id} value={c.code}>{c.code}</option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-md font-bold bg-white"
          >
            <option value="HKI">Học kỳ I</option>
            <option value="HKII">Học kỳ II</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
          >
            <option value="Hóa học">Hóa học</option>
            <option value="Sinh học">Sinh học</option>
            <option value="Vật lí">Vật lí</option>
          </select>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <span className="text-xs text-slate-500 block">Điểm trung bình chung</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-amber-600">{overallAvg}</span>
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Môn {selectedSubject}</span>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <span className="text-xs text-slate-500 block">Học sinh Xuất sắc / Giỏi</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-600">{topScorers.length} HS</span>
            <Award className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">ĐTB &gt;= 8.0</span>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <span className="text-xs text-slate-500 block">Học sinh cần phụ đạo</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-rose-600">{lowScorers.length} HS</span>
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">ĐTB &lt; 5.0</span>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <span className="text-xs text-slate-500 block">HS còn thiếu đầu điểm</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-indigo-600">{missingScores.length} HS</span>
            <Users className="w-6 h-6 text-indigo-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Cần kiểm tra bù</span>
        </div>
      </div>

      {/* 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <BarChart data={barChartData} />
        </div>
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <PieChart data={pieChartData} title={`Phân bố điểm (${selectedClass === 'all' ? 'Toàn bộ' : selectedClass})`} />
        </div>
      </div>

      {/* Exam Comparisons */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4">
        <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#0756A8]" />
          <span>So sánh kết quả điểm trung bình qua các bài kiểm tra</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {examAverages.map((exam) => (
            <div key={exam.name} className="p-3 rounded-lg border border-slate-100 bg-sky-50/40 text-center">
              <span className="text-slate-500 block text-[11px] font-semibold">{exam.name}</span>
              <span className="text-lg font-bold text-[#0756A8] my-1 block">{exam.avg}</span>
              <span className="text-[10px] text-slate-400 block">{exam.weight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two lists: Low Scorers & High Achievers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Scorers */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Danh sách học sinh cần phụ đạo / hỗ trợ ({lowScorers.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">ĐTB &lt; 5.0</span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-rose-50 text-rose-900 font-bold sticky top-0">
                <tr>
                  <th className="py-2 px-3">Mã HS</th>
                  <th className="py-2 px-3">Họ và tên</th>
                  <th className="py-2 px-2 text-center">Lớp</th>
                  <th className="py-2 px-2 text-center">ĐTB</th>
                  <th className="py-2 px-3">Đề xuất hỗ trợ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowScorers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                      Không có học sinh nào dưới 5.0 điểm.
                    </td>
                  </tr>
                ) : (
                  lowScorers.map(s => (
                    <tr key={s.id} className="hover:bg-rose-50/30">
                      <td className="py-2 px-3 font-semibold text-slate-600">{s.studentCode}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{s.studentName}</td>
                      <td className="py-2 px-2 text-center">{s.classCode}</td>
                      <td className="py-2 px-2 text-center font-bold text-rose-600">{s.avg?.toFixed(1)}</td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">Kèm phụ đạo chuyên đề Oxi - Axit</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Achievers */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-emerald-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Danh sách học sinh Giỏi / Nguồn HSG ({topScorers.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">ĐTB &gt;= 8.0</span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-emerald-50 text-emerald-900 font-bold sticky top-0">
                <tr>
                  <th className="py-2 px-3">Mã HS</th>
                  <th className="py-2 px-3">Họ và tên</th>
                  <th className="py-2 px-2 text-center">Lớp</th>
                  <th className="py-2 px-2 text-center">ĐTB</th>
                  <th className="py-2 px-3">Khen thưởng / Định hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topScorers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                      Chưa có học sinh đạt mức điểm này.
                    </td>
                  </tr>
                ) : (
                  topScorers.slice(0, 10).map(s => (
                    <tr key={s.id} className="hover:bg-emerald-50/30">
                      <td className="py-2 px-3 font-semibold text-slate-600">{s.studentCode}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{s.studentName}</td>
                      <td className="py-2 px-2 text-center">{s.classCode}</td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-700">{s.avg?.toFixed(1)}</td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">Đề cử đội tuyển thi HSG cấp trường</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
