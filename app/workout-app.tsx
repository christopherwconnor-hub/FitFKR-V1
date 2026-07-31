"use client";

import { useEffect, useRef, useState } from "react";

type Exercise = { name: string; sets?: number; target?: string; suggestedWeight?: string };
type Day = {
  id: string;
  short: string;
  day: string;
  title: string;
  note?: string;
  exercises: Exercise[];
  finisher?: string;
};
type SetLog = { weight: string; reps: string; done: boolean };
type Logs = Record<string, SetLog[]>;
type WorkoutPlan = { id: string; name: string; days: Day[]; imported?: boolean };
type Theme = "midnight" | "light" | "rose";
type FontStyle = "modern" | "soft-serif" | "rounded";
type PerformanceRecord = { weight: number; reps: number; targetMet: boolean; date: string };
type PeptideSchedule = { id: string; name: string; days: string[]; units: string; mg: string; notes: string };
type Tab = "home" | "workout" | "progress" | "history" | "peptides" | "plans";

const DAYS: Day[] = [
  {
    id: "monday", short: "MON", day: "Monday", title: "Arms, Shoulders & Abs",
    exercises: [
      { name: "Machine Shoulder Press", sets: 3, target: "10 reps" },
      { name: "Cable Lateral Raise", sets: 3, target: "15 reps" },
      { name: "Rear Delt Fly", sets: 3, target: "15 reps" },
      { name: "Rope Triceps Pushdown", sets: 3, target: "15 reps" },
      { name: "Single-Arm Overhead Triceps Extension", sets: 3, target: "12 reps" },
      { name: "Hammer Curl", sets: 3, target: "12 reps" },
      { name: "Cable Crunch", sets: 3, target: "15 reps" },
      { name: "Side Plank", sets: 3, target: "30–45 seconds each side" },
    ],
    finisher: "15–20 minutes StairMaster or incline treadmill",
  },
  {
    id: "tuesday", short: "TUE", day: "Tuesday", title: "Quads & Glutes",
    note: "Quad-focused with glute support",
    exercises: [
      { name: "Hack Squat", sets: 4, target: "10 reps" },
      { name: "Leg Press (feet shoulder-width, lower on platform)", sets: 4, target: "12 reps" },
      { name: "Walking Lunges", sets: 3, target: "20 steps" },
      { name: "Leg Extension", sets: 3, target: "15 reps" },
      { name: "Hip Abduction", sets: 3, target: "20 reps" },
      { name: "Standing Calf Raise", sets: 3, target: "20 reps" },
    ],
    finisher: "10-minute incline walk",
  },
  {
    id: "wednesday", short: "WED", day: "Wednesday", title: "Recovery",
    exercises: [
      { name: "30–45 minute walk" },
      { name: "Sauna" },
      { name: "Stretch" },
      { name: "Foam roll" },
    ],
  },
  {
    id: "thursday", short: "THU", day: "Thursday", title: "Glutes & Hamstrings (Heavy)",
    note: "This is your biggest glute-building day.",
    exercises: [
      { name: "Barbell Hip Thrust", sets: 4, target: "10 reps" },
      { name: "Romanian Deadlift", sets: 4, target: "10 reps" },
      { name: "Bulgarian Split Squat", sets: 3, target: "10 each leg" },
      { name: "Seated Hamstring Curl", sets: 3, target: "12 reps" },
      { name: "Cable Kickbacks", sets: 3, target: "15 reps" },
      { name: "Hip Abduction", sets: 3, target: "20 reps" },
    ],
    finisher: "10 minutes StairMaster",
  },
  {
    id: "friday", short: "FRI", day: "Friday", title: "Sculpted Back & Core",
    note: "No heavy lat focus.",
    exercises: [
      { name: "Seated Cable Row", sets: 3, target: "12 reps" },
      { name: "Chest-Supported Row", sets: 3, target: "12 reps" },
      { name: "Reverse Pec Deck", sets: 3, target: "15 reps" },
      { name: "Face Pulls", sets: 3, target: "15 reps" },
      { name: "Straight-Arm Pulldown", sets: 2, target: "15 reps (light and controlled)" },
      { name: "Dead Bugs", sets: 3, target: "15 reps" },
      { name: "Pallof Press", sets: 3, target: "12 each side" },
      { name: "Front Plank", sets: 3, target: "45–60 seconds" },
    ],
  },
  {
    id: "saturday", short: "SAT", day: "Saturday", title: "Full Body Conditioning",
    note: "No heavy glute work—just movement and calorie burn.",
    exercises: [
      { name: "Goblet Squat", sets: 3, target: "15 reps" },
      { name: "Dumbbell Romanian Deadlift", sets: 3, target: "12 reps (light to moderate)" },
      { name: "Step-Ups", sets: 3, target: "12 each leg" },
      { name: "Push-Ups (incline if needed)", sets: 3, target: "10–12 reps" },
      { name: "Farmer Carries", sets: 3, target: "rounds" },
      { name: "Cable Woodchoppers", sets: 3, target: "12 each side" },
    ],
    finisher: "20–30 minutes StairMaster, incline walk, or bike",
  },
];

const BUILT_IN_PLAN: WorkoutPlan = {
  id: "strongweek-original",
  name: "FitFKR Original",
  days: DAYS,
};
const REST_DAY: Day = {
  id: "rest-recovery",
  short: "REST",
  day: "Today",
  title: "Rest & Recovery",
  note: "No workout is scheduled today. Let your body rebuild.",
  exercises: [
    { name: "Take an easy 20–30 minute walk" },
    { name: "Stretch or foam roll for 10 minutes" },
    { name: "Hydrate and prioritize protein" },
    { name: "Aim for a full night of sleep" },
  ],
};

const ICONS = {
  home: "⌂", workout: "↗", progress: "⌁", history: "◷", peptides: "◉", plans: "✦",
};
const PEPTIDES = [
  { name: "Semaglutide", status: "FDA-approved prescription products exist", risk: "Use only the exact product and instructions supplied by your prescriber or pharmacy." },
  { name: "Tirzepatide", status: "FDA-approved prescription products exist", risk: "Use only the exact product and instructions supplied by your prescriber or pharmacy." },
  { name: "Tesamorelin", status: "FDA-approved prescription product exists", risk: "Follow its product-specific prescribing and reconstitution instructions." },
  { name: "BPC-157", status: "Not FDA approved", risk: "FDA identifies limited safety information and potential significant safety risks." },
  { name: "CJC-1295", status: "Not FDA approved", risk: "FDA identifies immunogenicity and peptide-impurity concerns." },
  { name: "Ipamorelin", status: "Not FDA approved", risk: "FDA states it lacks enough information to know whether injectable use would cause harm." },
  { name: "AOD-9604", status: "Not FDA approved", risk: "FDA identifies limited safety information and potential significant safety risks." },
  { name: "GHK-Cu (injectable)", status: "Not FDA approved", risk: "FDA identifies immunogenicity and peptide-impurity concerns for injectable use." },
  { name: "Other prescribed peptide", status: "Verify with a licensed professional", risk: "Enter the exact name and instructions from your prescription label." },
];
const ACHIEVEMENTS = [
  { threshold: 1, icon: "✦", name: "First Step", note: "Complete your first workout" },
  { threshold: 3, icon: "♡", name: "Momentum", note: "Complete 3 workouts" },
  { threshold: 6, icon: "◆", name: "Strong Week", note: "Complete 6 workouts" },
  { threshold: 10, icon: "⚡", name: "Consistency", note: "Complete 10 workouts" },
  { threshold: 25, icon: "♛", name: "Committed", note: "Complete 25 workouts" },
  { threshold: 50, icon: "★", name: "Unstoppable", note: "Complete 50 workouts" },
];
const MOTIVATION = [
  "You showed up and finished strong. That is how results are built.",
  "Another promise kept to yourself. Be proud of this one.",
  "Strong body, strong mind, strong week. Beautiful work.",
  "Consistency looks good on you. One more session in the books.",
];

function keyFor(dayId: string, exercise: string) {
  return `${dayId}:${exercise}`;
}

function makeInitialLogs(days: Day[] = DAYS): Logs {
  const logs: Logs = {};
  days.forEach((day) => day.exercises.forEach((exercise) => {
    logs[keyFor(day.id, exercise.name)] = Array.from({ length: exercise.sets ?? 1 }, () => ({
      weight: exercise.suggestedWeight ?? "", reps: "", done: false,
    }));
  }));
  return logs;
}

function workoutPlanToText(plan: WorkoutPlan) {
  return plan.days.map((day) => {
    const lines = [`${day.day} – ${day.title}`];
    if (day.note) lines.push("", `(${day.note})`);
    lines.push("", ...day.exercises.map((exercise) => {
      if (!exercise.sets) return exercise.name;
      const weight = exercise.suggestedWeight ? ` @ ${exercise.suggestedWeight} lb` : "";
      return `${exercise.name} – ${exercise.sets} × ${exercise.target ?? "reps"}${weight}`;
    }));
    if (day.finisher) lines.push("", "Finish:", "", day.finisher);
    return lines.join("\n");
  }).join("\n\n⸻\n\n");
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function parseWorkoutPlan(text: string, planName: string): WorkoutPlan {
  const lines = text.replace(/\r/g, "").split("\n").map((line) => line.trim()).filter(Boolean);
  const days: Day[] = [];
  const planId = `custom-${Date.now()}`;
  let current: Day | null = null;
  let readingFinisher = false;

  for (const raw of lines) {
    const line = raw.replace(/^[•*]\s*/, "");
    const heading = line.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*[–—-]\s*(.+)$/i);
    if (heading) {
      const day = DAY_NAMES.find((name) => name.toLowerCase() === heading[1].toLowerCase()) ?? heading[1];
      current = {
        id: `${planId}-${day.toLowerCase()}`,
        short: day.slice(0, 3).toUpperCase(),
        day,
        title: heading[2].trim(),
        exercises: [],
      };
      days.push(current);
      readingFinisher = false;
      continue;
    }
    if (!current) continue;
    if (/^finish\s*:?\s*$/i.test(line)) {
      readingFinisher = true;
      continue;
    }
    if (readingFinisher) {
      current.finisher = line;
      readingFinisher = false;
      continue;
    }
    if (/^\(.+\)$/.test(line) && current.exercises.length === 0) {
      current.note = line.slice(1, -1);
      continue;
    }
    const exercise = line.match(/^(.*?)\s*[–—-]\s*(\d+)\s*[×x]\s*(.+)$/i);
    if (exercise) {
      const prescription = exercise[3].trim();
      const weightMatch = prescription.match(/(?:@|,|\s)\s*(\d+(?:\.\d+)?)\s*(?:lb|lbs|kg)\s*$/i);
      const target = weightMatch
        ? prescription.slice(0, weightMatch.index).trim().replace(/[,;@-]\s*$/, "")
        : prescription;
      current.exercises.push({
        name: exercise[1].trim(),
        sets: Number(exercise[2]),
        target: target.replace(/^(\d+(?:[–—-]\d+)?)$/, "$1 reps"),
        suggestedWeight: weightMatch?.[1],
      });
    } else if (!/^⸻+$/.test(line)) {
      current.exercises.push({ name: line });
    }
  }

  if (!days.length) throw new Error("No day headings found. Use a heading like “Monday – Arms & Abs”.");
  if (days.some((day) => day.exercises.length === 0)) throw new Error("One or more days did not contain any exercises.");
  const cleanName = planName.replace(/\.txt$/i, "").replace(/[-_]+/g, " ").trim();
  return {
    id: planId,
    name: cleanName ? cleanName.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Imported Plan",
    days,
    imported: true,
  };
}

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      // Hydrate device-local data after the initial server render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setValue(JSON.parse(saved));
    } catch {}
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (loaded.current) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

export function WorkoutApp() {
  const today = (new Date().getDay() + 6) % 7;
  const [tab, setTab] = useState<Tab>("home");
  const [customPlans, setCustomPlans] = useStoredState<WorkoutPlan[]>("strongweek-plans", []);
  const [activePlanId, setActivePlanId] = useStoredState("strongweek-active-plan", BUILT_IN_PLAN.id);
  const plans = [BUILT_IN_PLAN, ...customPlans];
  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? BUILT_IN_PLAN;
  const days = activePlan.days;
  const currentDayName = DAY_NAMES[today];
  const defaultDay = days.find((day) => day.day.toLowerCase() === currentDayName.toLowerCase()) ?? REST_DAY;
  const [selectedId, setSelectedId] = useState(defaultDay.id);
  const [logs, setLogs] = useStoredState<Logs>("strongweek-logs", makeInitialLogs());
  const [history, setHistory] = useStoredState<{ id: string; day: string; title: string; date: string; volume: number }[]>("strongweek-history", []);
  const [weights, setWeights] = useStoredState<{ date: string; value: number }[]>("strongweek-weight", [
    { date: "Jul 1", value: 188.4 }, { date: "Jul 8", value: 187.9 }, { date: "Jul 15", value: 187.2 },
  ]);
  const [photos, setPhotos] = useStoredState<string[]>("strongweek-photos", []);
  const [theme, setTheme] = useStoredState<Theme>("strongweek-theme", "midnight");
  const [fontStyle, setFontStyle] = useStoredState<FontStyle>("strongweek-font", "modern");
  const [performance, setPerformance] = useStoredState<Record<string, PerformanceRecord>>("strongweek-performance", {});
  const [peptideSchedules, setPeptideSchedules] = useStoredState<PeptideSchedule[]>("strongweek-peptide-schedules", []);
  const [peptideDraft, setPeptideDraft] = useState<PeptideSchedule>({ id: "", name: PEPTIDES[0].name, days: [], units: "", mg: "", notes: "" });
  const [vialMg, setVialMg] = useState("");
  const [bacMl, setBacMl] = useState("");
  const [celebration, setCelebration] = useState<{ message: string; achievement?: string } | null>(null);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [pasteName, setPasteName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [rest, setRest] = useState(0);
  const [restPreset, setRestPreset] = useStoredState("strongweek-rest-preset", 60);
  const [cardio, setCardio] = useState(0);
  const [weightInput, setWeightInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const planFileRef = useRef<HTMLInputElement>(null);
  const selected = selectedId === REST_DAY.id ? REST_DAY : days.find((d) => d.id === selectedId) ?? days[0];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.font = fontStyle;
  }, [fontStyle]);
  useEffect(() => {
    if (rest <= 0) return;
    const timer = window.setInterval(() => setRest((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [rest]);
  useEffect(() => {
    if (cardio <= 0) return;
    const timer = window.setInterval(() => setCardio((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cardio]);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const allSets = selected.exercises.flatMap((e) => logs[keyFor(selected.id, e.name)] ?? []);
  const done = allSets.filter((s) => s.done).length;
  const completion = allSets.length ? Math.round((done / allSets.length) * 100) : 0;
  const weekly = Math.min(100, Math.round((new Set(history.map((h) => h.day))).size / 6 * 100));
  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) => history.length >= achievement.threshold);
  const vialMgNumber = Number(vialMg);
  const bacMlNumber = Number(bacMl);
  const concentration = vialMgNumber > 0 && bacMlNumber > 0 ? vialMgNumber / bacMlNumber : 0;
  const mgPerUnit = concentration / 100;

  function savePeptideSchedule() {
    if (!peptideDraft.name.trim() || !peptideDraft.days.length || (!peptideDraft.units && !peptideDraft.mg)) return;
    const schedule = { ...peptideDraft, id: peptideDraft.id || crypto.randomUUID() };
    setPeptideSchedules((items) => peptideDraft.id ? items.map((item) => item.id === peptideDraft.id ? schedule : item) : [...items, schedule]);
    setPeptideDraft({ id: "", name: PEPTIDES[0].name, days: [], units: "", mg: "", notes: "" });
  }

  function repGoal(exercise: Exercise) {
    const values = exercise.target?.match(/\d+/g)?.map(Number) ?? [];
    return values.at(-1) ?? 0;
  }

  function overloadSuggestion(exercise: Exercise) {
    const last = performance[keyFor(selected.id, exercise.name)];
    if (!last) return exercise.suggestedWeight ? `Start at ${exercise.suggestedWeight} lb` : "Establish your baseline";
    if (!last.targetMet) return last.weight ? `Repeat ${last.weight} lb · own every rep` : "Repeat the target with clean form";
    if (!last.weight) return "Target met · add a small challenge";
    return `Next target · ${last.weight + 5} lb`;
  }

  function choosePlan(plan: WorkoutPlan) {
    setActivePlanId(plan.id);
    setSelectedId(plan.days[0].id);
    setTab("home");
  }

  async function importPlan(file?: File) {
    if (!file) return;
    setImportError("");
    setImportSuccess("");
    try {
      const plan = parseWorkoutPlan(await file.text(), file.name);
      setCustomPlans((current) => [...current, plan]);
      setLogs((current) => ({ ...makeInitialLogs(plan.days), ...current }));
      setActivePlanId(plan.id);
      setSelectedId(plan.days[0].id);
      setImportSuccess(`${plan.name} was added with ${plan.days.length} scheduled days.`);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "That file could not be read.");
    } finally {
      if (planFileRef.current) planFileRef.current.value = "";
    }
  }

  function addPastedPlan() {
    setImportError("");
    setImportSuccess("");
    try {
      if (!pasteText.trim()) throw new Error("Paste your workout plan into the text box first.");
      const parsed = parseWorkoutPlan(pasteText, pasteName.trim() || "Pasted Workout Plan");
      const editingCustomPlan = editingPlanId && editingPlanId !== BUILT_IN_PLAN.id;
      const plan = editingCustomPlan ? { ...parsed, id: editingPlanId } : parsed;
      setCustomPlans((current) => editingCustomPlan
        ? current.map((item) => item.id === editingPlanId ? plan : item)
        : [...current, plan]);
      setLogs((current) => ({ ...makeInitialLogs(plan.days), ...current }));
      setActivePlanId(plan.id);
      setSelectedId(plan.days[0].id);
      setPasteName("");
      setPasteText("");
      setEditingPlanId(null);
      setImportSuccess(`${plan.name} was ${editingCustomPlan ? "updated" : "created"} with ${plan.days.length} scheduled days and is now active.`);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "That workout text could not be read.");
    }
  }

  function editPlan(plan: WorkoutPlan) {
    setEditingPlanId(plan.id);
    setPasteName(plan.id === BUILT_IN_PLAN.id ? `${plan.name} Custom` : plan.name);
    setPasteText(workoutPlanToText(plan));
    setImportError("");
    setImportSuccess("");
    window.setTimeout(() => document.querySelector(".paste-import")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function cancelEdit() {
    setEditingPlanId(null);
    setPasteName("");
    setPasteText("");
  }

  function updateSet(exercise: Exercise, index: number, patch: Partial<SetLog>) {
    const key = keyFor(selected.id, exercise.name);
    setLogs((current) => {
      const base = current[key] ?? Array.from({ length: exercise.sets ?? 1 }, () => ({ weight: exercise.suggestedWeight ?? "", reps: "", done: false }));
      const next = base.map((item, i) => i === index ? { ...item, ...patch } : item);
      return { ...current, [key]: next };
    });
  }

  function completeWorkout() {
    if (completion < 100) return;
    const volume = selected.exercises.reduce((sum, e) =>
      sum + (logs[keyFor(selected.id, e.name)] ?? []).reduce((s, item) =>
        s + (Number(item.weight) || 0) * (Number(item.reps) || 0), 0), 0);
    const completedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const nextPerformance = { ...performance };
    selected.exercises.filter((exercise) => exercise.sets).forEach((exercise) => {
      const sets = logs[keyFor(selected.id, exercise.name)] ?? [];
      const weights = sets.map((item) => Number(item.weight) || 0);
      const reps = sets.map((item) => Number(item.reps) || 0);
      const goal = repGoal(exercise);
      const prescribedWeight = Number(exercise.suggestedWeight) || 0;
      nextPerformance[keyFor(selected.id, exercise.name)] = {
        weight: Math.min(...weights),
        reps: Math.min(...reps),
        targetMet: sets.length > 0 && sets.every((item, index) =>
          item.done && reps[index] >= goal && weights[index] >= prescribedWeight),
        date: completedAt,
      };
    });
    setPerformance(nextPerformance);
    const nextCount = history.length + 1;
    const earned = ACHIEVEMENTS.find((achievement) => achievement.threshold === nextCount);
    setHistory((items) => [{
      id: crypto.randomUUID(), day: selected.id, title: selected.title,
      date: completedAt, volume,
    }, ...items].slice(0, 30));
    setCelebration({
      message: MOTIVATION[nextCount % MOTIVATION.length],
      achievement: earned ? `${earned.icon} ${earned.name} unlocked` : undefined,
    });
  }

  function openWorkout(day: Day) {
    setSelectedId(day.id);
    setTab("workout");
  }

  const maxWeight = Math.max(...weights.map((w) => w.value), 1);
  const minWeight = Math.min(...weights.map((w) => w.value), maxWeight);
  const range = Math.max(maxWeight - minWeight, 1);

  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="brand"><span className="brand-mark">F</span><span>FIT<span>FKR</span></span></div>
        <nav>{(["home", "workout", "progress", "history", "peptides", "plans"] as Tab[]).map((item) =>
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            <span>{ICONS[item]}</span>{item}
          </button>)}</nav>
        <div className="rail-foot"><span className="avatar">CC</span><div><b>Christopher</b><small>Keep showing up.</small></div></div>
      </aside>

      <main>
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">F</span><b>FIT<span>FKR</span></b></div>
          <div className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <div className="top-actions">
            {rest > 0 && <button className="timer-pill" onClick={() => setRest(0)}>REST {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}</button>}
            <button className="plan-pill" onClick={() => setTab("plans")}>{activePlan.name}<span>⌄</span></button>
            <button className="icon-button" aria-label="Open themes" onClick={() => setTab("plans")}>◐</button>
          </div>
        </header>

        {tab === "home" && <div className="page">
          <section className="hero">
            <div>
              <p className="kicker">YOUR NEXT SESSION</p>
              <h1>Build the habit.<br/><span>Earn the result.</span></h1>
              <p>Six intentional days. One stronger week.</p>
            </div>
            <div className="hero-stat"><small>WEEKLY PROGRESS</small><strong>{weekly}%</strong><div className="meter"><i style={{ width: `${weekly}%` }} /></div><span>{new Set(history.map((h) => h.day)).size} of 6 workouts complete</span></div>
          </section>

          <section className="today-card">
            <div className="today-main">
              <div className="date-tile"><b>{defaultDay.short}</b><strong>{new Date().getDate()}</strong></div>
              <div><span className="status-dot">TODAY</span><h2>{defaultDay.title}</h2><p>{defaultDay.exercises.length} movements {defaultDay.finisher ? "· Cardio finisher" : ""}</p></div>
            </div>
            <button className="primary" onClick={() => openWorkout(defaultDay)}>Start workout <span>→</span></button>
          </section>

          <div className="section-heading"><div><p className="kicker">THE PLAN</p><h2>Your week</h2></div><span>Consistency over intensity.</span></div>
          <div className="week-grid">
            {days.map((day, i) => <button className={`day-card ${day.id === defaultDay.id ? "today" : ""}`} key={day.id} onClick={() => openWorkout(day)}>
              <div className="day-top"><span>0{i + 1}</span><i>→</i></div>
              <small>{day.day}</small><h3>{day.title}</h3>
              <div className="muscle-lines"><i/><i/><i/></div>
              <p>{day.exercises.length} {day.id === "wednesday" ? "recovery activities" : "movements"}</p>
            </button>)}
          </div>

          <div className="insight-grid">
            <article className="insight blue"><span className="mini-icon">↗</span><div><small>COACH&apos;S NOTE</small><h3>Small jumps. Big change.</h3><p>When you hit every target rep with clean form twice, add 5 lb next session.</p></div></article>
            <article className="insight"><span className="mini-icon">◷</span><div><small>RECOVERY</small><h3>Wednesday reset</h3><p>Walk, heat, stretch, and foam roll. Training adapts when recovery is intentional.</p></div></article>
            <article className="streak"><small>CURRENT STREAK</small><strong>{Math.max(history.length, 3)}<span>days</span></strong><div>{["M","T","W","T","F","S","S"].map((d,i)=><i key={i} className={i<Math.min(history.length,6)?"filled":""}>{d}</i>)}</div></article>
          </div>
          <div className="section-heading"><div><p className="kicker">MILESTONES</p><h2>Your achievements</h2></div><span>{unlockedAchievements.length} of {ACHIEVEMENTS.length} unlocked</span></div>
          <div className="achievement-grid">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = history.length >= achievement.threshold;
              return <article key={achievement.name} className={unlocked ? "achievement unlocked" : "achievement"}>
                <span>{unlocked ? achievement.icon : "◇"}</span><div><small>{unlocked ? "UNLOCKED" : `${achievement.threshold} WORKOUTS`}</small><h3>{achievement.name}</h3><p>{achievement.note}</p></div>
              </article>;
            })}
          </div>
        </div>}

        {tab === "workout" && <div className="page workout-page">
          <div className="workout-head">
            <div><p className="kicker">{selected.day.toUpperCase()} · SESSION</p><h1>{selected.title}</h1>{selected.note && <p>{selected.note}</p>}</div>
            <div className="completion-ring" style={{ "--p": `${completion * 3.6}deg` } as React.CSSProperties}><span>{completion}%</span></div>
          </div>
          <div className="day-tabs">{selected.id===REST_DAY.id&&<button className="active" onClick={()=>setSelectedId(REST_DAY.id)}>REST</button>}{days.map((d) => <button key={d.id} className={selected.id===d.id?"active":""} onClick={()=>setSelectedId(d.id)}>{d.short}</button>)}</div>
          <section className="rest-dock" aria-label="Rest timer">
            <div className="rest-readout"><span>REST TIMER</span><strong>{Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}</strong></div>
            <div className="rest-presets">
              {[30,60,90,120].map((seconds)=><button key={seconds} className={restPreset===seconds?"selected":""} onClick={()=>{setRestPreset(seconds);setRest(seconds)}}>{seconds<60?`${seconds}s`:`${seconds/60}m`}</button>)}
            </div>
            <div className="rest-actions">
              <button aria-label="Subtract 15 seconds" onClick={()=>setRest(value=>Math.max(0,value-15))}>−15</button>
              <button className="rest-start" onClick={()=>setRest(rest?0:restPreset)}>{rest?"Stop":"Start"}</button>
              <button aria-label="Add 15 seconds" onClick={()=>setRest(value=>value+15)}>+15</button>
            </div>
          </section>
          <div className="exercise-list">
            {selected.exercises.map((exercise, exIndex) => {
              const exerciseLogs = logs[keyFor(selected.id, exercise.name)] ?? [];
              const previous = performance[keyFor(selected.id, exercise.name)];
              return <article className="exercise-card" key={exercise.name}>
                <div className="exercise-number">{String(exIndex + 1).padStart(2, "0")}</div>
                <div className="exercise-body">
                  <div className="exercise-title"><div><h3>{exercise.name}</h3><p>{exercise.sets ? `${exercise.sets} sets · ${exercise.target}` : "Recovery checklist"}</p></div>
                  {exercise.sets && <span className="suggestion">↑ {overloadSuggestion(exercise)}</span>}</div>
                  {exercise.sets ? <div className="set-table">
                    <div className="set-row labels"><span>SET</span><span>PREVIOUS</span><span>LB</span><span>REPS / SEC</span><span>DONE</span></div>
                    {exerciseLogs.map((item, i) => <div className="set-row" key={i}>
                      <b>{i + 1}</b><span className="previous">{previous ? `${previous.weight || "BW"} × ${previous.reps}` : "—"}</span>
                      <input inputMode="decimal" aria-label={`${exercise.name} set ${i+1} weight`} value={item.weight} onChange={(e)=>updateSet(exercise,i,{weight:e.target.value})} placeholder="0"/>
                      <input inputMode="numeric" aria-label={`${exercise.name} set ${i+1} reps`} value={item.reps} onChange={(e)=>updateSet(exercise,i,{reps:e.target.value})} placeholder={exercise.target?.match(/\d+/)?.[0] ?? "0"}/>
                      <button className={item.done?"check done":"check"} aria-label="Mark set complete" onClick={()=>{updateSet(exercise,i,{done:!item.done}); if(!item.done)setRest(restPreset)}}>{item.done?"✓":""}</button>
                    </div>)}
                  </div> : <button className={exerciseLogs[0]?.done?"recovery-check done":"recovery-check"} onClick={()=>updateSet(exercise,0,{done:!exerciseLogs[0]?.done})}><span>{exerciseLogs[0]?.done?"✓":"○"}</span>{exerciseLogs[0]?.done?"Completed":"Mark complete"}</button>}
                </div>
              </article>;
            })}
          </div>
          {selected.finisher && <section className="finisher">
            <div><p className="kicker">FINISH STRONG</p><h2>{selected.finisher}</h2></div>
            <div className="timer-block"><strong>{Math.floor(cardio/60)}:{String(cardio%60).padStart(2,"0")}</strong><button onClick={()=>setCardio(cardio ? 0 : (selected.id==="saturday"?20:10)*60)}>{cardio?"Stop":"Start timer"}</button></div>
          </section>}
          <button className="complete-button" disabled={completion < 100} onClick={completeWorkout}>{completion < 100 ? `Complete all sets · ${completion}%` : `Complete ${selected.day}'s workout`} <span>→</span></button>
        </div>}

        {tab === "progress" && <div className="page">
          <div className="page-title"><p className="kicker">THE LONG GAME</p><h1>Progress</h1><p>Proof that the work is working.</p></div>
          <div className="progress-grid">
            <article className="panel weight-panel"><div className="panel-head"><div><small>BODY WEIGHT</small><h2>{weights.at(-1)?.value ?? "—"} <em>lb</em></h2></div><span>{weights.length > 1 ? `${(weights.at(-1)!.value - weights[0].value).toFixed(1)} lb` : "Start"}</span></div>
              <div className="chart">{weights.map((w,i)=><div key={i} className="chart-point" style={{left:`${weights.length===1?50:i/(weights.length-1)*92+4}%`,bottom:`${18+(w.value-minWeight)/range*62}%`}}><i/><small>{w.date}</small></div>)}</div>
              <div className="add-row"><input inputMode="decimal" placeholder="Today's weight" value={weightInput} onChange={e=>setWeightInput(e.target.value)}/><button onClick={()=>{const n=Number(weightInput);if(n){setWeights(v=>[...v,{date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),value:n}].slice(-12));setWeightInput("")}}}>Log weight</button></div>
            </article>
            <article className="panel"><div className="panel-head"><div><small>PERSONAL RECORDS</small><h2>{history.length ? Math.max(...history.map(h=>h.volume)).toLocaleString() : "Ready"} <em>{history.length ? "lb volume" : ""}</em></h2></div><span className="pr-mark">PR</span></div><p className="panel-copy">Your strongest logged session is highlighted automatically as your training history grows.</p></article>
            <article className="panel photos"><div className="panel-head"><div><small>PROGRESS PHOTOS</small><h2>Your timeline</h2></div><button onClick={()=>fileRef.current?.click()}>+ Add photo</button></div>
              <input ref={fileRef} hidden type="file" accept="image/*" onChange={(e)=>{const file=e.target.files?.[0];if(file){const r=new FileReader();r.onload=()=>setPhotos(v=>[String(r.result),...v].slice(0,6));r.readAsDataURL(file)}}}/>
              {photos.length ? <div className="photo-grid">{photos.map((src,i)=>
                // Device-local data URLs are not compatible with the image optimizer.
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`Progress ${i+1}`}/>)}</div> : <button className="photo-empty" onClick={()=>fileRef.current?.click()}><span>＋</span><b>Add your first check-in</b><small>Front, side, or back</small></button>}
            </article>
          </div>
        </div>}

        {tab === "history" && <div className="page">
          <div className="page-title"><p className="kicker">SHOWING UP COUNTS</p><h1>History</h1><p>Your completed sessions, kept on this device.</p></div>
          <div className="history-list">{history.length ? history.map((h,i)=><article key={h.id}><span>{String(i+1).padStart(2,"0")}</span><div><small>{h.date}</small><h3>{h.title}</h3></div><strong>{h.volume ? `${h.volume.toLocaleString()} lb` : "Complete"}</strong></article>) : <div className="empty-state"><span>◷</span><h2>Your first session starts here.</h2><p>Complete a workout and it will appear in your history.</p><button className="primary" onClick={()=>setTab("workout")}>Open workout</button></div>}</div>
        </div>}

        {tab === "peptides" && <div className="page">
          <div className="page-title"><p className="kicker">PRIVATE · SAVED ON THIS DEVICE</p><h1>Peptide schedule</h1><p>Record instructions you already received from a licensed prescriber or pharmacist.</p></div>
          <section className="medical-warning"><span>!</span><div><h2>Not medical advice or a dose recommendation</h2><p>Do not use this app to choose a peptide, dose, injection frequency, diluent, or route. Confirm the medication, concentration, syringe type, and every calculation with your prescriber or dispensing pharmacist before injecting. “Units” below means markings on a U-100 syringe only (100 units = 1 mL).</p></div></section>

          <div className="peptide-layout">
            <section className="peptide-panel">
              <div className="settings-title"><div><p className="kicker">SCHEDULE BUILDER</p><h2>{peptideDraft.id?"Edit schedule":"Add a prescribed schedule"}</h2></div></div>
              <label>Peptide
                <select value={peptideDraft.name} onChange={(event)=>setPeptideDraft((draft)=>({...draft,name:event.target.value}))}>
                  {PEPTIDES.map((peptide)=><option key={peptide.name}>{peptide.name}</option>)}
                </select>
              </label>
              {PEPTIDES.find((peptide)=>peptide.name===peptideDraft.name) && <div className="peptide-status"><b>{PEPTIDES.find((peptide)=>peptide.name===peptideDraft.name)?.status}</b><p>{PEPTIDES.find((peptide)=>peptide.name===peptideDraft.name)?.risk}</p></div>}
              <label>Injection days</label>
              <div className="weekday-picker">{DAY_NAMES.map((day)=><button key={day} className={peptideDraft.days.includes(day)?"selected":""} onClick={()=>setPeptideDraft((draft)=>({...draft,days:draft.days.includes(day)?draft.days.filter((item)=>item!==day):[...draft.days,day]}))}>{day.slice(0,3)}</button>)}</div>
              <div className="dose-fields">
                <label>Prescribed syringe units<input inputMode="decimal" value={peptideDraft.units} onChange={(event)=>setPeptideDraft((draft)=>({...draft,units:event.target.value}))} placeholder="From prescription"/></label>
                <label>Prescribed mg<input inputMode="decimal" value={peptideDraft.mg} onChange={(event)=>setPeptideDraft((draft)=>({...draft,mg:event.target.value}))} placeholder="From prescription"/></label>
              </div>
              <label>Label instructions or notes<textarea value={peptideDraft.notes} onChange={(event)=>setPeptideDraft((draft)=>({...draft,notes:event.target.value}))} placeholder="Optional — copy the pharmacy label exactly"/></label>
              <div className="schedule-actions"><button className="primary" onClick={savePeptideSchedule}>Save schedule <span>→</span></button>{peptideDraft.id&&<button className="secondary" onClick={()=>setPeptideDraft({id:"",name:PEPTIDES[0].name,days:[],units:"",mg:"",notes:""})}>Cancel</button>}</div>
            </section>

            <section className="peptide-panel calculator">
              <div className="settings-title"><div><p className="kicker">CONCENTRATION CONVERTER</p><h2>Vial + BAC math</h2></div></div>
              <p className="calculator-copy">For a U-100 syringe only. Enter values printed on the vial and pharmacy instructions. This calculates concentration; it does not determine a safe dose.</p>
              <div className="dose-fields">
                <label>Medication in vial (mg)<input inputMode="decimal" value={vialMg} onChange={(event)=>setVialMg(event.target.value)} placeholder="e.g. vial label"/></label>
                <label>BAC added (mL)<input inputMode="decimal" value={bacMl} onChange={(event)=>setBacMl(event.target.value)} placeholder="e.g. pharmacy instruction"/></label>
              </div>
              <div className="calc-results">
                <div><small>CONCENTRATION</small><strong>{concentration ? concentration.toFixed(4) : "—"} <em>mg/mL</em></strong></div>
                <div><small>PER U-100 UNIT</small><strong>{mgPerUnit ? mgPerUnit.toFixed(5) : "—"} <em>mg</em></strong></div>
                <div><small>UNITS PER 1 MG</small><strong>{mgPerUnit ? (1/mgPerUnit).toFixed(2) : "—"} <em>units</em></strong></div>
              </div>
              <p className="formula-note">Formula: mg ÷ mL = mg/mL. Because a U-100 syringe has 100 units per mL, mg per unit = mg/mL ÷ 100.</p>
            </section>
          </div>

          <div className="section-heading"><div><p className="kicker">YOUR WEEK</p><h2>Saved schedules</h2></div><span>{peptideSchedules.length} saved</span></div>
          {peptideSchedules.length ? <div className="peptide-schedules">{peptideSchedules.map((schedule)=><article key={schedule.id}><div><small>{schedule.days.join(" · ")}</small><h3>{schedule.name}</h3><p>{schedule.units&&`${schedule.units} U`}{schedule.units&&schedule.mg?" · ":""}{schedule.mg&&`${schedule.mg} mg`}{schedule.notes&&` · ${schedule.notes}`}</p></div><div><button onClick={()=>setPeptideDraft(schedule)}>Edit</button><button className="delete-plan" onClick={()=>setPeptideSchedules((items)=>items.filter((item)=>item.id!==schedule.id))}>×</button></div></article>)}</div>:<div className="empty-state compact"><span>◉</span><h2>No injection schedule saved.</h2><p>Add only the schedule provided by your licensed clinician or pharmacist.</p></div>}

          <section className="source-note"><h3>Safety information</h3><p>Compounded drugs are not FDA-approved and FDA does not verify their safety, effectiveness, or quality before marketing. FDA has also reported hospitalizations from compounded injectable semaglutide dosing errors involving mg-to-unit conversion.</p><div><a href="https://www.fda.gov/drugs/human-drug-compounding/compounding-and-fda-questions-and-answers" target="_blank" rel="noreferrer">FDA: Compounding questions</a><a href="https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks" target="_blank" rel="noreferrer">FDA: Peptide safety risks</a><a href="https://www.fda.gov/drugs/human-drug-compounding/fda-alerts-health-care-providers-compounders-and-patients-dosing-errors-associated-compounded" target="_blank" rel="noreferrer">FDA: Dosing-error alert</a></div></section>
        </div>}

        {tab === "plans" && <div className="page">
          <div className="page-title"><p className="kicker">MAKE IT YOURS</p><h1>Plans & themes</h1><p>Choose your look, switch schedules, or bring in a new routine.</p></div>
          <section className="settings-section">
            <div className="settings-title"><div><p className="kicker">APPEARANCE</p><h2>Choose a theme</h2></div><p>Your choice is remembered on this device.</p></div>
            <div className="theme-grid">
              {([
                { id: "midnight", name: "Midnight Blue", note: "Charcoal, black & electric blue", colors: ["#080a0e","#10141a","#2774ff"] },
                { id: "light", name: "Clean Light", note: "White, soft gray & bright blue", colors: ["#f3f5f8","#ffffff","#176bff"] },
                { id: "rose", name: "Blush Studio", note: "Warm white, blush pink & berry", colors: ["#fff8fb","#ffffff","#e94f93"] },
              ] as {id:Theme;name:string;note:string;colors:string[]}[]).map((choice) =>
                <button key={choice.id} className={`theme-card ${theme===choice.id?"selected":""}`} onClick={()=>setTheme(choice.id)}>
                  <div className="swatches">{choice.colors.map((color)=><i key={color} style={{background:color}}/>)}</div>
                  <span className="theme-check">{theme===choice.id?"✓":""}</span>
                  <h3>{choice.name}</h3><p>{choice.note}</p>
                </button>)}
            </div>
            <div className="font-heading"><p className="kicker">TYPOGRAPHY</p><h2>Choose your font style</h2><p>Soft Serif and Rounded bring a gentler, more feminine feel to every theme.</p></div>
            <div className="font-grid">
              {([
                { id: "modern", name: "Modern", sample: "Strong & focused", note: "Clean and athletic" },
                { id: "soft-serif", name: "Soft Serif", sample: "Grace in motion", note: "Elegant and feminine" },
                { id: "rounded", name: "Soft Rounded", sample: "Grow with joy", note: "Warm and approachable" },
              ] as { id: FontStyle; name: string; sample: string; note: string }[]).map((choice) =>
                <button key={choice.id} className={`font-card font-${choice.id} ${fontStyle===choice.id?"selected":""}`} onClick={()=>setFontStyle(choice.id)}>
                  <span className="font-check">{fontStyle===choice.id?"✓":""}</span><small>{choice.name}</small><strong>{choice.sample}</strong><p>{choice.note}</p>
                </button>)}
            </div>
          </section>
          <section className="settings-section">
            <div className="settings-title"><div><p className="kicker">WORKOUT LIBRARY</p><h2>Choose your plan</h2></div><p>{plans.length} {plans.length===1?"plan":"plans"} saved</p></div>
            <div className="plan-list">
              {plans.map((plan)=><article key={plan.id} className={plan.id===activePlan.id?"selected":""}>
                <div className="plan-badge">{plan.imported?"TXT":"SW"}</div>
                <div><small>{plan.imported?"IMPORTED PLAN":"BUILT-IN PLAN"}</small><h3>{plan.name}</h3><p>{plan.days.length} scheduled days · {plan.days.reduce((sum,day)=>sum+day.exercises.length,0)} movements</p></div>
                <div className="plan-actions">
                  {plan.id===activePlan.id?<span>Active</span>:<button onClick={()=>choosePlan(plan)}>Use plan</button>}
                  <button className="edit-plan" onClick={()=>editPlan(plan)}>Edit</button>
                  {plan.imported&&<button className="delete-plan" aria-label={`Delete ${plan.name}`} onClick={()=>{setCustomPlans(items=>items.filter(item=>item.id!==plan.id));if(activePlan.id===plan.id)choosePlan(BUILT_IN_PLAN)}}>×</button>}
                </div>
              </article>)}
            </div>
          </section>
          <section className="paste-import">
            <div className="settings-title"><div><p className="kicker">{editingPlanId?"EDIT PLAN":"PASTE & BUILD"}</p><h2>{editingPlanId?"Edit your workout plan":"Create a plan from copied text"}</h2></div><p>{editingPlanId===BUILT_IN_PLAN.id?"Saving creates an editable custom copy.":"No file needed."}</p></div>
            <div className="paste-layout">
              <div className="paste-fields">
                <label>Plan name<input value={pasteName} onChange={(event)=>setPasteName(event.target.value)} placeholder="My new workout plan"/></label>
                <label>Workout plan text<textarea value={pasteText} onChange={(event)=>setPasteText(event.target.value)} placeholder={"Monday – Upper Body\n\nShoulder Press – 3 × 10 @ 25 lb\nCable Row – 3 × 12, 40 lb\n\nFinish:\n15 minutes incline treadmill"}/></label>
              </div>
              <aside><span>✓</span><h3>{editingPlanId?"Ready to update":"What it understands"}</h3><p>Monday–Sunday schedules, workout titles, parenthetical notes, sets, rep ranges, seconds, starting weights in lb or kg, recovery tasks, and Finish sections.</p><div className="paste-actions"><button className="primary" onClick={addPastedPlan}>{editingPlanId?"Save workout plan":"Create workout plan"} <span>→</span></button>{editingPlanId&&<button className="secondary" onClick={cancelEdit}>Cancel</button>}</div></aside>
            </div>
          </section>
          <section className="import-card">
            <div className="import-icon">＋</div>
            <div><p className="kicker">ADD A NEW SCHEDULE</p><h2>Import a plain-text workout plan</h2><p>Use day headings such as <b>Monday – Arms & Abs</b>, then list exercises as <b>Hammer Curl – 3 × 12</b>. “Finish:” sections are supported too.</p></div>
            <input ref={planFileRef} hidden type="file" accept=".txt,text/plain" onChange={(event)=>importPlan(event.target.files?.[0])}/>
            <button className="primary" onClick={()=>planFileRef.current?.click()}>Choose .txt file <span>↑</span></button>
          </section>
          {importError&&<p className="import-message error">{importError}</p>}
          {importSuccess&&<p className="import-message success">{importSuccess}</p>}
        </div>}
      </main>

      {celebration && <div className="celebration-backdrop" role="dialog" aria-modal="true" aria-label="Workout complete">
        <div className="celebration-card"><span className="celebration-spark">✦</span><p className="kicker">WORKOUT COMPLETE</p><h2>You did it.</h2><p>{celebration.message}</p>{celebration.achievement&&<div className="achievement-toast">{celebration.achievement}</div>}<button className="primary" onClick={()=>{setCelebration(null);setTab("home")}}>Celebrate & continue <span>→</span></button></div>
      </div>}
      <nav className="bottom-nav">{(["home","workout","progress","history","peptides","plans"] as Tab[]).map(item=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}><span>{ICONS[item]}</span>{item}</button>)}</nav>
    </div>
  );
}
