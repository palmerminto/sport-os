"use client";

import { useEffect, useState } from "react";
import { format, addWeeks } from "date-fns";

// Type definitions
interface AppState {
  rawTeams: string;
  rawTimes: string;
  pitches: number;
  startDate: string;
  weeks: number;
  fixtures: {
    week: number;
    date: string;
    matches: { time: string; pitch: number; teams: string[] }[];
  }[];
}

export default function Home() {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === "undefined") {
      return {
        rawTeams: "",
        rawTimes: "",
        pitches: 2,
        startDate: "",
        weeks: 8,
        fixtures: [],
      };
    }
    return {
      rawTeams: localStorage.getItem("rawTeams") || "",
      rawTimes: localStorage.getItem("rawTimes") || "",
      pitches: 2,
      startDate: "",
      weeks: 8,
      fixtures: [],
    };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rawTeams", state.rawTeams);
      localStorage.setItem("rawTimes", state.rawTimes);
    }
  }, [state.rawTeams, state.rawTimes]);

  const isFormValid = () => {
    return (
      state.rawTeams.trim() !== "" &&
      state.rawTimes.trim() !== "" &&
      state.pitches > 0 &&
      state.startDate !== "" &&
      state.weeks > 0
    );
  };

  const exportToSportPress = () => {
    const headers =
      "Date,Time,Venue,Teams,Results,Outcome,Players,Goals,Assists,Yellow Cards,Red Cards";
    const csvContent = [
      headers,
      ...state.fixtures.flatMap((week) =>
        week.matches.map(
          (match) =>
            `${week.date},${match.time},Pitch ${match.pitch},${match.teams.join(
              " vs "
            )},,,,,,`
        )
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fixtures.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">League Fixture Generator</h1>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold">Teams (comma separated)</label>
          <textarea
            className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
            value={state.rawTeams}
            onChange={(e) =>
              setState((prev) => ({ ...prev, rawTeams: e.target.value }))
            }
          />

          <label className="block font-semibold">
            Match Times (comma separated, military time)
          </label>
          <textarea
            className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
            value={state.rawTimes}
            onChange={(e) =>
              setState((prev) => ({ ...prev, rawTimes: e.target.value }))
            }
          />

          <label className="block font-semibold">Number of Pitches</label>
          <input
            className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
            type="number"
            value={state.pitches}
            onChange={(e) =>
              setState((prev) => ({ ...prev, pitches: Number(e.target.value) }))
            }
          />

          <label className="block font-semibold">Start Date</label>
          <input
            className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
            type="date"
            value={state.startDate}
            onChange={(e) =>
              setState((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />

          <label className="block font-semibold">Number of Weeks</label>
          <input
            className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
            type="number"
            value={state.weeks}
            onChange={(e) =>
              setState((prev) => ({ ...prev, weeks: Number(e.target.value) }))
            }
          />

          <button
            className={`w-full p-2 rounded mb-2 ${
              isFormValid()
                ? "bg-blue-500 text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            onClick={exportToSportPress}
            disabled={state.fixtures.length === 0}
          >
            Export to SportPress
          </button>
        </div>
        <div>
          {state.fixtures.length > 0 ? (
            <div>
              <h2 className="text-lg font-bold">Generated Fixtures</h2>
              {state.fixtures.map((week) => (
                <div key={week.week} className="mb-4">
                  <h3 className="text-md font-semibold">
                    Week {week.week} – {week.date}
                  </h3>
                  {week.matches.map((match, index) => (
                    <p key={index} className="ml-4">
                      {match.time} - Pitch {match.pitch}: {match.teams[0]} vs{" "}
                      {match.teams[1]}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">
              No fixtures generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
