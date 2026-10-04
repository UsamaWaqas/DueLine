import React from 'react';
import { Circle, Svg } from 'react-native-svg';

export type DonutSlice = { value: number; color: string };

type Props = {
  data: DonutSlice[];
  size?: number;
  strokeWidth?: number;
};

export function DonutChart({ data, size = 88, strokeWidth = 10 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let offset = 0;
  return (
    <Svg width={size} height={size}>
      {data.map((slice, i) => {
        const fraction = slice.value / total;
        const dash = fraction * circumference;
        const gap = circumference - dash;
        const dashOffset = -offset;
        offset += dash;
        return (
          <Circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={slice.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </Svg>
  );
}
