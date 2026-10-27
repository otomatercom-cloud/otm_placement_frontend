"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function PerformanceChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-card shadow-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base text-ink">Candidates by program</h3>
        <span className="text-xs text-slate">Active registrations</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#7d8799" }}
            axisLine={{ stroke: "#e8edf4" }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fontSize: 11, fill: "#7d8799" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "#f7f9fc" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #e8edf4", fontSize: 12 }}
          />
          <Bar dataKey="count" fill="#087cf0" radius={[6, 6, 0, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
