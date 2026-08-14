import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import type { SavedMatchup, BankrollMetrics } from '../types';

interface AnalyticsViewProps {
  vault: SavedMatchup[];
  bankroll: BankrollMetrics;
}

const COLORS = ['#10B981', '#EF4444', '#6B7280']; // Green, Red, Gray

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ vault, bankroll }) => {
  const { chartData, winLossData, confidenceData } = useMemo(() => {
    const completedBets = vault.filter(v => v.outcome && v.outcome !== 'PENDING').sort((a, b) => a.timestamp - b.timestamp);
    
    let cumulativeProfit = 0;
    const chartData = completedBets.map(bet => {
      const date = new Date(bet.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      let profit = 0;
      if (bet.outcome === 'WIN') profit = bankroll.unitSize * 0.91;
      else if (bet.outcome === 'LOSS') profit = -bankroll.unitSize;
      
      cumulativeProfit += profit;
      return {
        date,
        profit: Number(profit.toFixed(2)),
        cumulative: Number(cumulativeProfit.toFixed(2)),
        matchup: `${bet.homeTeam} vs ${bet.awayTeam}`
      };
    });

    const winLossData = [
      { name: 'Wins', value: bankroll.record.wins },
      { name: 'Losses', value: bankroll.record.losses },
      { name: 'Pushes', value: bankroll.record.pushes }
    ].filter(d => d.value > 0);

    const confStats = {
      High: { wins: 0, total: 0 },
      Medium: { wins: 0, total: 0 },
      Low: { wins: 0, total: 0 }
    };

    completedBets.forEach(bet => {
      if (confStats[bet.confidence]) {
        confStats[bet.confidence].total++;
        if (bet.outcome === 'WIN') confStats[bet.confidence].wins++;
      }
    });

    const confidenceData = [
      { name: 'High', winRate: confStats.High.total > 0 ? (confStats.High.wins / confStats.High.total) * 100 : 0 },
      { name: 'Medium', winRate: confStats.Medium.total > 0 ? (confStats.Medium.wins / confStats.Medium.total) * 100 : 0 },
      { name: 'Low', winRate: confStats.Low.total > 0 ? (confStats.Low.wins / confStats.Low.total) * 100 : 0 }
    ];

    return { chartData, winLossData, confidenceData };
  }, [vault, bankroll]);

  const totalBets = bankroll.record.wins + bankroll.record.losses + bankroll.record.pushes;
  const winRate = totalBets > 0 ? ((bankroll.record.wins / (bankroll.record.wins + bankroll.record.losses)) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Performance Analytics</h2>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Total Profit</p>
          <p className={`text-3xl font-black ${bankroll.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {bankroll.totalProfit >= 0 ? '+' : '-'}${Math.abs(bankroll.totalProfit).toFixed(2)}
          </p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Win Rate</p>
          <p className="text-3xl font-black text-white">{winRate}%</p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">ROI</p>
          <p className={`text-3xl font-black ${bankroll.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {bankroll.roi >= 0 ? '+' : ''}{bankroll.roi.toFixed(2)}%
          </p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Record</p>
          <p className="text-3xl font-black text-white">
            {bankroll.record.wins}-{bankroll.record.losses}-{bankroll.record.pushes}
          </p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center">
          <p className="text-zinc-500 font-black uppercase tracking-widest">No completed predictions yet.</p>
          <p className="text-zinc-600 text-sm mt-2">Settle predictions in the Vault to generate analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart: Cumulative Profit */}
          <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Cumulative Profit Over Time</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="cumulative" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Profit ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Charts */}
          <div className="space-y-8">
            {/* Win/Loss Distribution */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Outcome Distribution</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {winLossData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Win Rate by Confidence */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Win Rate by Confidence</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      cursor={{ fill: '#27272a', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Win Rate']}
                    />
                    <Bar dataKey="winRate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
