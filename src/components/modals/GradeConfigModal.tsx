import React, { useState } from 'react';
import { X, Sliders, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { GradeConfig } from '../../types';
import { initialGradeConfig } from '../../services/initialData';

interface GradeConfigModalProps {
  isOpen: boolean;
  config: GradeConfig;
  onClose: () => void;
  onSave: (newConfig: GradeConfig) => void;
}

export const GradeConfigModal: React.FC<GradeConfigModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave,
}) => {
  const [txWeight, setTxWeight] = useState(config.txWeight);
  const [gkWeight, setGkWeight] = useState(config.gkWeight);
  const [ckWeight, setCkWeight] = useState(config.ckWeight);
  const [txCount, setTxCount] = useState(config.txCount);
  const [roundDecimals, setRoundDecimals] = useState(config.roundDecimals);
  const [goodThreshold, setGoodThreshold] = useState(config.goodThreshold);
  const [fairThreshold, setFairThreshold] = useState(config.fairThreshold);
  const [avgThreshold, setAvgThreshold] = useState(config.avgThreshold);

  if (!isOpen) return null;

  const handleReset = () => {
    setTxWeight(initialGradeConfig.txWeight);
    setGkWeight(initialGradeConfig.gkWeight);
    setCkWeight(initialGradeConfig.ckWeight);
    setTxCount(initialGradeConfig.txCount);
    setRoundDecimals(initialGradeConfig.roundDecimals);
    setGoodThreshold(initialGradeConfig.goodThreshold);
    setFairThreshold(initialGradeConfig.fairThreshold);
    setAvgThreshold(initialGradeConfig.avgThreshold);
  };

  const handleSave = () => {
    onSave({
      txWeight,
      gkWeight,
      ckWeight,
      txCount,
      roundDecimals,
      minScoresToCalculate: 2,
      goodThreshold,
      fairThreshold,
      avgThreshold,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-[#063B7A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-sky-300" />
            <div>
              <h3 className="text-base font-bold">Cấu hình Quy tắc Tính điểm</h3>
              <p className="text-xs text-sky-200">Áp dụng môn Hóa học - Chương trình GDPT THPT</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-900">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-[#0756A8]" />
              <span>Công thức áp dụng hiện tại:</span>
            </p>
            <p className="font-mono text-[11px] bg-white p-2 rounded border border-sky-100 text-slate-800">
              Điểm TB = (∑TX × {txWeight} + GK × {gkWeight} + CK × {ckWeight}) / (Số bài TX × {txWeight} + {gkWeight} + {ckWeight})
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hệ số TX (Thường xuyên)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={txWeight}
                onChange={(e) => setTxWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 font-bold text-center"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hệ số Giữa kỳ (GK)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={gkWeight}
                onChange={(e) => setGkWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 font-bold text-center"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hệ số Cuối kỳ (CK)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={ckWeight}
                onChange={(e) => setCkWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số cột điểm TX trên sổ</label>
              <select
                value={txCount}
                onChange={(e) => setTxCount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 font-semibold"
              >
                <option value={3}>3 cột (TX1, TX2, TX3)</option>
                <option value={4}>4 cột (TX1, TX2, TX3, TX4)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Làm tròn số thập phân</label>
              <select
                value={roundDecimals}
                onChange={(e) => setRoundDecimals(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 font-semibold"
              >
                <option value={1}>1 chữ số thập phân (VD: 7.2)</option>
                <option value={2}>2 chữ số thập phân (VD: 7.25)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2">Ngưỡng xếp loại học lực tham khảo:</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-emerald-800 font-bold mb-1">Học sinh Giỏi (&gt;=)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={goodThreshold}
                  onChange={(e) => setGoodThreshold(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-emerald-300 rounded bg-emerald-50 font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-amber-800 font-bold mb-1">Học sinh Khá (&gt;=)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={fairThreshold}
                  onChange={(e) => setFairThreshold(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-amber-300 rounded bg-amber-50 font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-sky-800 font-bold mb-1">Học sinh TB (&gt;=)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={avgThreshold}
                  onChange={(e) => setAvgThreshold(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-sky-300 rounded bg-sky-50 font-bold text-center"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-bold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded-md font-bold flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>Lưu cấu hình</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
