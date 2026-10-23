import React, { useState } from 'react';

export interface PieSlice {
  label: string;
  count: number;
  percentage: number;
  color: string;
  rangeKey: string;
}

interface PieChartProps {
  data: PieSlice[];
  title?: string;
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title = 'Phân bố điểm môn Hóa học',
  size = 220 
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  const center = size / 2;
  const radius = (size / 2) - 15;

  // Compute angles for slices
  let cumulativeAngle = -Math.PI / 2; // start from top (-90 deg)
  const slicesWithAngles = data.map((slice) => {
    const fraction = total > 0 ? slice.count / total : (slice.percentage / 100);
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    const midAngle = startAngle + angle / 2;
    cumulativeAngle += angle;

    // SVG Arc Path
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // Center for text percentage
    const textRadius = radius * 0.62;
    const textX = center + textRadius * Math.cos(midAngle);
    const textY = center + textRadius * Math.sin(midAngle) + 4;

    return {
      ...slice,
      pathData,
      textX,
      textY,
      startAngle,
      endAngle,
      midAngle,
      displayPercentage: Math.round(slice.percentage || (total > 0 ? (slice.count / total) * 100 : 0))
    };
  });

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-base font-bold text-slate-800">{title}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-slate-100 p-3 min-h-[260px]">
        {/* SVG Pie */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none">
            {slicesWithAngles.map((slice, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <g 
                  key={slice.label}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <path
                    d={slice.pathData}
                    fill={slice.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-200"
                    style={{
                      transformOrigin: `${center}px ${center}px`,
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' : 'none'
                    }}
                  />
                  {slice.displayPercentage > 4 && (
                    <text
                      x={slice.textX}
                      y={slice.textY}
                      textAnchor="middle"
                      fill="#ffffff"
                      className="text-[12px] font-bold pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                    >
                      {slice.displayPercentage}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {hoveredIdx !== null && slicesWithAngles[hoveredIdx] && (
            <div className="absolute -bottom-2 bg-slate-900/90 text-white text-xs px-2 py-1 rounded shadow pointer-events-none animate-in fade-in">
              <span className="font-semibold">{slicesWithAngles[hoveredIdx].label}</span>: {slicesWithAngles[hoveredIdx].count} HS ({slicesWithAngles[hoveredIdx].displayPercentage}%)
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 text-xs text-slate-700 w-full sm:w-auto pr-2">
          {slicesWithAngles.map((slice, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center gap-2.5 cursor-pointer py-1 px-2 rounded transition-colors ${
                  isHovered ? 'bg-sky-50 font-bold text-sky-950' : 'hover:bg-slate-50'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-sm flex-shrink-0 transition-transform"
                  style={{
                    backgroundColor: slice.color,
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
                <span className="whitespace-nowrap">
                  {slice.label} ({slice.displayPercentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
