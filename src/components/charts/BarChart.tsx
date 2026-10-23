import React, { useState } from 'react';

interface BarDataPoint {
  label: string; // e.g. "10A1"
  value: number; // e.g. 7.1
  count?: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  title?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 260 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxY = 10;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;
  const width = 450;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const yTicks = [0, 2, 4, 6, 8, 10];
  const barWidth = Math.min(36, Math.max(24, (plotWidth / (data.length || 1)) * 0.45));

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-base font-bold text-slate-800">Kết quả học tập theo lớp</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="inline-block w-3.5 h-3.5 bg-[#1677E8] rounded-sm"></span>
          <span>Điểm trung bình</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-white rounded-lg border border-slate-100 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
          {/* Grid lines and Y axis ticks */}
          {yTicks.map((tick) => {
            const y = paddingTop + plotHeight - (tick / maxY) * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? 'none' : '2 2'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-500 font-medium"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Left Y Axis solid line */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + plotHeight}
            stroke="#94a3b8"
            strokeWidth="1.2"
          />

          {/* Bottom X Axis solid line */}
          <line
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={width - paddingRight}
            y2={paddingTop + plotHeight}
            stroke="#94a3b8"
            strokeWidth="1.2"
          />

          {/* Bars */}
          {data.map((item, idx) => {
            const step = plotWidth / data.length;
            const xCenter = paddingLeft + idx * step + step / 2;
            const x = xCenter - barWidth / 2;
            const barH = Math.max(4, (item.value / maxY) * plotHeight);
            const y = paddingTop + plotHeight - barH;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.label}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Bar Value above */}
                <text
                  x={xCenter}
                  y={y - 6}
                  textAnchor="middle"
                  className={`text-[12px] font-bold transition-all ${
                    isHovered ? 'fill-[#0756A8] text-[13px]' : 'fill-slate-700'
                  }`}
                >
                  {item.value.toFixed(1)}
                </text>

                {/* The Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="3"
                  className="transition-all duration-200"
                  fill={isHovered ? '#0b63c7' : '#1677E8'}
                  filter={isHovered ? 'drop-shadow(0 4px 6px rgba(22, 119, 232, 0.4))' : 'none'}
                />

                {/* X axis Label */}
                <text
                  x={xCenter}
                  y={paddingTop + plotHeight + 18}
                  textAnchor="middle"
                  className={`text-[12px] font-semibold transition-colors ${
                    isHovered ? 'fill-[#063B7A]' : 'fill-slate-600'
                  }`}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="absolute top-2 right-4 bg-slate-900/90 text-white text-xs px-2.5 py-1.5 rounded shadow pointer-events-none animate-in fade-in duration-100">
            <span className="font-bold text-sky-300">Lớp {data[hoveredIdx].label}</span>: ĐTB{' '}
            <span className="font-bold text-amber-300">{data[hoveredIdx].value.toFixed(1)}</span>
            {data[hoveredIdx].count ? ` (${data[hoveredIdx].count} HS)` : ''}
          </div>
        )}
      </div>
    </div>
  );
};
