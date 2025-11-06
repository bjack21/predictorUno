import React from 'react';

interface TeamSelectorProps {
  teamA: string;
  setTeamA: (value: string) => void;
  teamB: string;
  setTeamB: (value: string) => void;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({ teamA, setTeamA, teamB, setTeamB }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
      <input
        type="text"
        value={teamA}
        onChange={(e) => setTeamA(e.target.value)}
        placeholder="Enter Team A"
        className="w-full md:w-1/2 bg-[#0d1117] border-2 border-gray-700 rounded-lg px-4 py-3 text-center text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
      />
      <span className="text-slate-500 font-bold text-lg">VS</span>
      <input
        type="text"
        value={teamB}
        onChange={(e) => setTeamB(e.target.value)}
        placeholder="Enter Team B"
        className="w-full md:w-1/2 bg-[#0d1117] border-2 border-gray-700 rounded-lg px-4 py-3 text-center text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
      />
    </div>
  );
};
