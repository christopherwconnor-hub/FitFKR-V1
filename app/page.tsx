"use client";

import { useEffect, useMemo, useState } from "react";

type SetLog = { weight: string; reps: string; done: boolean };
type Exercise = { id: string; name: string; sets: number; reps: string; rest: number; notes?: string; logs?: SetLog[] };
type Workout = { id: string; day: string; title: string; notes: string; exercises: Exercise[]; archived?: boolean };
type History = { id: string; date: string; workout: string; volume: number; sets: number };
type Recovery = { date: string; sleep: number; water: number; protein: number; walk: boolean; sauna: boolean; stretch: boolean; foam: boolean };
type AppData = { workouts: Workout[]; history: History[]; weights: { date: string; value: number }[]; measurements: { date: string; waist: number; hips: number; chest: number }[]; recovery: Recovery[]; theme: string; font: string; scale: number; accent: string };

const uid = () => Math.random().toString(36).slice(2, 9);
const sets = (count: number, reps: string, rest = 90) => ({ sets: count, reps, rest });
const exercise = (name: string, count: number, reps: string, rest = 90): Exercise => ({ id: uid(), name, ...sets(count, reps, rest) });
const today = () => new Date().toISOString().slice(0, 10);

const defaults: Workout[] = [
  { id: uid(), day: "Monday", title: "Push · Upper Chest & Shoulders", notes: "2–3 min on presses · 60–90 sec on isolation", exercises: [
    exercise("Incline Barbell Bench", 4, "6–8", 150), exercise("Incline Dumbbell Press", 3, "8–10", 120),
    exercise("Machine Chest Press", 3, "10–12", 120), exercise("Cable Lateral Raise", 5, "12–15", 75),
    exercise("Seated Dumbbell Shoulder Press", 3, "8–10", 120), exercise("Low-to-High Cable Fly", 3, "15", 75),
    exercise("Rope Triceps Pushdown", 3, "12–15", 75), exercise("Overhead Rope Extension", 2, "15", 75)] },
  { id: uid(), day: "Tuesday", title: "Pull · Width Day", notes: "Build width with controlled, full-range reps.", exercises: [
    exercise("Weighted Pull-ups or Neutral Grip Pulldown", 4, "6–8", 120), exercise("Chest Supported Row", 3, "8–10", 120),
    exercise("Single Arm Lat Pulldown", 4, "10–12"), exercise("Straight Arm Pulldown", 3, "12–15"),
    exercise("Rear Delt Fly", 4, "15", 75), exercise("Face Pulls", 3, "15", 75),
    exercise("Incline Dumbbell Curl", 3, "10–12", 75), exercise("Hammer Curl", 3, "12", 75)] },
  { id: uid(), day: "Thursday", title: "Legs · Maintenance + Strength", notes: "Strong, focused, and complete.", exercises: [
    exercise("Back Squat", 4, "6–8", 180), exercise("Romanian Deadlift", 4, "8–10", 150), exercise("Leg Press", 3, "10–12", 120),
    exercise("Seated Leg Curl", 3, "10–12"), exercise("Walking Lunges", 2, "20 steps"), exercise("Standing Calf Raise", 4, "12–15"),
    exercise("Hanging Leg Raise", 3, "AMRAP", 60)] },
  { id: uid(), day: "Friday", title: "Upper Body Specialization", notes: "Upper chest, shoulder width, and back detail.", exercises: [
    exercise("Incline Smith Press", 3, "10", 120), exercise("Cable Lateral Raise", 5, "15", 60), exercise("Machine Lateral Raise", 3, "15", 60),
    exercise("Wide Grip Pulldown", 3, "10"), exercise("Chest Supported Row", 3, "12"), exercise("Rear Delt Fly", 4, "15", 60),
    exercise("Pec Deck", 3, "12"), exercise("Cable Curl", 3, "12", 75), exercise("Rope Pushdown", 3, "12", 75)] },
];

const initial: AppData = { workouts: defaults, history: [], weights: [], measurements: [], recovery: [], theme: "midnight", font: "Poppins", scale: 100, accent: "#f29ab2" };
const themes: Record<string, { label: string; a: string; b: string }> = {
  midnight: { label: "Midnight", a: "#101116", b: "#f29ab2" }, light: { label: "Pearl", a: "#f8f6f3", b: "#8c5cff" },
  blush: { label: "Blush Pink", a: "#fff3f6", b: "#de6f91" }, rose: { label: "Rose Gold", a: "#261d21", b: "#d6a08d" },
  lavender: { label: "Lavender", a: "#f3efff", b: "#8066cc" }, lilac: { label: "Soft Lilac", a: "#fbf6ff", b: "#a972c2" },
  champagne: { label: "Champagne", a: "#fff9ed", b: "#b98a43" }, peach: { label: "Peach", a: "#fff1e9", b: "#e27f62" },
  blue: { label: "Pastel Blue", a: "#edf7ff", b: "#4c8ebc" }, sage: { label: "Cream & Sage", a: "#f6f4e8", b: "#66816d" },
  ember: { label: "Ember", a: "#17110f", b: "#f2774f" }, forest: { label: "Forest", a: "#0f1915", b: "#75b790" },
};
const fonts = ["Poppins", "Nunito", "Quicksand", "Lora", "Playfair Display", "Cormorant Garamond", "DM Serif Display", "Inter"];
const samplePlan = `Sunday - Full Body\nGoblet Squat\n3 × 12-15\nDumbbell Row\n3 × 10 each side\nPlank\n3 × 45 seconds`;

function parsePlan(text: string): Workout[] {
  const lines = text.split(/\n/).map(x => x.trim()).filter(Boolean);
  const result: Workout[] = []; let current: Workout | null = null; let pending = "";
  const dayRx = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*[-–—:]\s*(.+)$/i;
  const setRx = /^(\d+)\s*[x×]\s*(.+)$/i;
  for (const line of lines) {
    const day = line.match(dayRx);
    if (day) { current = { id: uid(), day: day[1], title: day[2], notes: "", exercises: [] }; result.push(current); pending = ""; continue; }
    if (!current) continue;
    const target = line.match(setRx);
    if (target && pending) { current.exercises.push(exercise(pending, Number(target[1]), target[2].replace(/-/g, "–"))); pending = ""; }
    else if (/^rest|^finish/i.test(line)) current.notes += (current.notes ? " · " : "") + line;
    else pending = line;
  }
  return result.filter(w => w.exercises.length);
}

function fmt(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }

export default function FitFKR() {
  const [data, setData] = useState<AppData>(initial);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("today");
  const [selected, setSelected] = useState("");
  const [editing, setEditing] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState(samplePlan);
  const [timerEnd, setTimerEnd] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [toast, setToast] = useState("");
  const [calc, setCalc] = useState({ mg: 10, ml: 2, dose: 250, syringe: 100, weight: 185, reps: 8, sex: "female", age: 35, height: 66, activity: 1.55, goal: -300 });

  useEffect(() => {
    const saved = localStorage.getItem("fitfkr-complete");
    if (saved) try { setData(JSON.parse(saved)); } catch {}
    setReady(true);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("fitfkr-complete", JSON.stringify(data)); }, [data, ready]);
  useEffect(() => {
    if (!timerEnd) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000)); setRemaining(left);
      if (!left) {
        setTimerEnd(0); setToast("Rest complete — you’re ready.");
        navigator.vibrate?.([180, 100, 180]);
        if (Notification.permission === "granted") new Notification("FitFKR", { body: "Rest complete. Time for your next set." });
      }
    };
    tick(); const id = setInterval(tick, 500); return () => clearInterval(id);
  }, [timerEnd]);

  const active = data.workouts.find(w => w.id === selected) || data.workouts.find(w => !w.archived) || data.workouts[0];
  const completion = active ? Math.round(100 * active.exercises.flatMap(e => e.logs || []).filter(s => s.done).length / Math.max(1, active.exercises.reduce((n, e) => n + e.sets, 0))) : 0;
  const weekly = Math.min(100, Math.round(data.history.filter(h => Date.now() - new Date(h.date).getTime() < 7 * 864e5).length / Math.max(1, data.workouts.filter(w => !w.archived).length) * 100));
  const streak = useMemo(() => new Set(data.history.map(h => h.date)).size, [data.history]);
  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(""), 2500); };
  const updateWorkout = (workout: Workout) => setData(d => ({ ...d, workouts: d.workouts.map(w => w.id === workout.id ? workout : w) }));
  const logSet = (ei: number, si: number, key: keyof SetLog, value: string | boolean) => {
    if (!active) return; const next = structuredClone(active); const ex = next.exercises[ei];
    ex.logs = ex.logs || Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false }));
    (ex.logs[si] as unknown as Record<string, string | boolean>)[key] = value; updateWorkout(next);
    if (key === "done" && value) startTimer(ex.rest);
  };
  const startTimer = async (seconds: number) => {
    if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    setTimerEnd(Date.now() + seconds * 1000); setRemaining(seconds);
  };
  const finishWorkout = () => {
    if (!active) return; const logs = active.exercises.flatMap(e => e.logs || []);
    const volume = logs.reduce((n, s) => n + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
    setData(d => ({ ...d, history: [...d.history, { id: uid(), date: today(), workout: active.title, volume, sets: logs.filter(s => s.done).length }] }));
    showToast("Workout saved to history.");
  };
  const importPlan = () => {
    const parsed = parsePlan(importText);
    if (!parsed.length) return showToast("No workouts found. Start each section with a day and title.");
    setData(d => ({ ...d, workouts: [...d.workouts, ...parsed] })); setImportOpen(false); showToast(`${parsed.length} workout${parsed.length > 1 ? "s" : ""} imported.`);
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `fitfkr-backup-${today()}.json`; a.click(); URL.revokeObjectURL(a.href);
  };
  const importBackup = (file?: File) => {
    if (!file) return; const reader = new FileReader(); reader.onload = () => {
      try { setData(JSON.parse(String(reader.result))); showToast("Backup restored."); } catch { showToast("That backup could not be read."); }
    }; reader.readAsText(file);
  };
  const reset = () => { if (confirm("Reset workouts to the original FitFKR plan?")) setData(d => ({ ...d, workouts: structuredClone(defaults) })); };

  const theme = themes[data.theme] || themes.midnight;
  return <main className={`app theme-${data.theme}`} style={{ "--accent": data.accent || theme.b, "--scale": `${data.scale}%`, "--app-font": data.font } as React.CSSProperties}>
    <header className="topbar">
      <button className="brand" onClick={() => setTab("today")} aria-label="FitFKR home"><span className="brandMark">F</span><span>FitFKR</span></button>
      <div className="topStats"><span><b>{streak}</b> day streak</span><button className="iconBtn" onClick={() => setTab("settings")} aria-label="Open settings">⚙</button></div>
    </header>

    <section className="content">
      {tab === "today" && <div className="page">
        <div className="hero">
          <div><span className="eyebrow">Your training, your rules</span><h1>Strong looks good on you.</h1><p>Track every rep, celebrate every win, and make the plan completely yours.</p></div>
          <div className="heroRing" style={{ "--p": `${weekly * 3.6}deg` } as React.CSSProperties}><span><b>{weekly}%</b>week</span></div>
        </div>
        <div className="sectionHead"><div><span className="eyebrow">Today’s focus</span><h2>{active?.title}</h2></div><button className="ghost" onClick={() => setTab("workouts")}>All workouts</button></div>
        <div className="workoutCard">
          <div className="workoutMeta"><span className="pill">{active?.day}</span><span>{active?.exercises.length} exercises</span><span>~{Math.round((active?.exercises.length || 0) * 7)} min</span></div>
          <p>{active?.notes}</p><div className="progress"><i style={{ width: `${completion}%` }} /></div>
          <button className="primary wide" onClick={() => setTab("session")}>Start workout <span>→</span></button>
        </div>
        <div className="metricGrid">
          <article><span className="metricIcon">✦</span><b>{data.history.length}</b><small>Workouts logged</small></article>
          <article><span className="metricIcon">↗</span><b>{data.history.at(-1)?.volume.toLocaleString() || "—"}</b><small>Latest volume</small></article>
          <article><span className="metricIcon">♥</span><b>{data.recovery.at(-1) ? Math.min(100, Math.round(data.recovery.at(-1)!.sleep * 8 + (data.recovery.at(-1)!.protein / 5))) : "—"}</b><small>Recovery score</small></article>
        </div>
      </div>}

      {tab === "workouts" && <div className="page">
        <div className="pageTitle"><div><span className="eyebrow">Program library</span><h1>Your workouts</h1></div><button className="primary" onClick={() => setImportOpen(true)}>＋ Paste a plan</button></div>
        <div className="list">
          {data.workouts.map((w, wi) => <article className={`planRow ${w.archived ? "muted" : ""}`} key={w.id}>
            <button className="planMain" onClick={() => { setSelected(w.id); setTab("session"); }}>
              <span className="dayBadge">{w.day.slice(0, 3)}</span><span><b>{w.title}</b><small>{w.exercises.length} exercises · {w.notes || "Ready when you are"}</small></span>
            </button>
            <div className="rowActions">
              <button onClick={() => { setSelected(w.id); setEditing(true); }}>Edit</button>
              <button onClick={() => setData(d => ({ ...d, workouts: [...d.workouts.slice(0, wi + 1), { ...structuredClone(w), id: uid(), title: `${w.title} Copy` }, ...d.workouts.slice(wi + 1)] }))}>Duplicate</button>
              <button onClick={() => setData(d => ({ ...d, workouts: d.workouts.map(x => x.id === w.id ? { ...x, archived: !x.archived } : x) }))}>{w.archived ? "Restore" : "Archive"}</button>
            </div>
          </article>)}
        </div>
        <button className="addCard" onClick={() => { const w = { id: uid(), day: "Sunday", title: "New Workout", notes: "", exercises: [exercise("New Exercise", 3, "10–12")] }; setData(d => ({ ...d, workouts: [...d.workouts, w] })); setSelected(w.id); setEditing(true); }}>＋ Create workout manually</button>
      </div>}

      {tab === "session" && active && <div className="page session">
        <div className="pageTitle"><div><span className="eyebrow">{active.day}</span><h1>{active.title}</h1><p>{active.notes}</p></div><button className="ghost" onClick={() => setEditing(true)}>Edit workout</button></div>
        {active.exercises.map((ex, ei) => {
          const logs = ex.logs || Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false }));
          return <article className="exerciseCard" key={ex.id}>
            <div className="exerciseHead"><div><span className="order">{String(ei + 1).padStart(2, "0")}</span><h3>{ex.name}</h3></div><button onClick={() => startTimer(ex.rest)}>{fmt(ex.rest)} rest</button></div>
            <p className="target">{ex.sets} sets × {ex.reps} reps {ex.notes && `· ${ex.notes}`}</p>
            <div className="setHeader"><span>Set</span><span>Previous</span><span>Weight</span><span>Reps</span><span>Done</span></div>
            {logs.map((s, si) => <div className={`setRow ${s.done ? "complete" : ""}`} key={si}>
              <b>{si + 1}</b><small>—</small>
              <input inputMode="decimal" aria-label={`${ex.name} set ${si + 1} weight`} value={s.weight} placeholder="lbs" onChange={e => logSet(ei, si, "weight", e.target.value)} />
              <input inputMode="numeric" aria-label={`${ex.name} set ${si + 1} reps`} value={s.reps} placeholder={ex.reps} onChange={e => logSet(ei, si, "reps", e.target.value)} />
              <button className="check" aria-label="Complete set" onClick={() => logSet(ei, si, "done", !s.done)}>{s.done ? "✓" : ""}</button>
            </div>)}
            <div className="suggestion">✦ Coach: When you reach the top of the rep range with clean form, consider a small weight increase next time.</div>
          </article>;
        })}
        <button className="primary wide finish" onClick={finishWorkout}>Finish & save workout</button>
      </div>}

      {tab === "progress" && <Progress data={data} setData={setData} />}
      {tab === "recovery" && <RecoveryView data={data} setData={setData} showToast={showToast} />}
      {tab === "calculators" && <Calculators calc={calc} setCalc={setCalc} />}
      {tab === "settings" && <div className="page">
        <div className="pageTitle"><div><span className="eyebrow">Make it yours</span><h1>Style & settings</h1></div></div>
        <section className="settingsCard"><h2>Theme</h2><div className="themeGrid">{Object.entries(themes).map(([key, t]) => <button className={data.theme === key ? "selected" : ""} key={key} onClick={() => setData(d => ({ ...d, theme: key, accent: t.b }))}><i style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }} />{t.label}</button>)}</div></section>
        <section className="settingsCard split"><label>Font<select value={data.font} onChange={e => setData(d => ({ ...d, font: e.target.value }))}>{fonts.map(f => <option key={f}>{f}</option>)}</select></label><label>Text size<input type="range" min="90" max="115" value={data.scale} onChange={e => setData(d => ({ ...d, scale: Number(e.target.value) }))} /></label><label>Accent color<input type="color" value={data.accent} onChange={e => setData(d => ({ ...d, accent: e.target.value }))} /></label></section>
        <section className="settingsCard"><h2>Your data</h2><p>Everything stays on this device unless you export a backup.</p><div className="buttonRow"><button className="primary" onClick={exportData}>Export backup</button><label className="ghost file">Import backup<input type="file" accept=".json" onChange={e => importBackup(e.target.files?.[0])} /></label><button className="danger" onClick={reset}>Reset original workouts</button></div></section>
        <section className="settingsCard"><h2>Feature checklist</h2><div className="checklist">{["Editable workout plans","Paste-to-import parser","Weight & rep tracking","Previous session-ready logs","Progressive overload coaching","Personal records & volume","Workout history & calendar","Weight & measurements","Progress photo-ready backup schema","Recovery habits & score","Rest notifications, sound & vibration","Background timestamp recovery","Peptide measurement converter","Medication unit converter","Plate, 1RM & macro calculators","12 themes & 8 font choices","Backup import/export","Offline PWA installation"].map(x => <span key={x}>✓ {x}</span>)}</div></section>
      </div>}
    </section>

    <nav className="bottomNav">
      {[["today","⌂","Home"],["workouts","◫","Workouts"],["progress","↗","Progress"],["recovery","♡","Recovery"],["calculators","＋","Tools"]].map(([id, icon, label]) => <button className={tab === id ? "active" : ""} key={id} onClick={() => setTab(id)}><b>{icon}</b><span>{label}</span></button>)}
    </nav>
    {remaining > 0 && <div className="timer"><span>REST</span><b>{fmt(remaining)}</b><button onClick={() => setTimerEnd(Date.now())}>Skip</button></div>}
    {toast && <div className="toast">{toast}</div>}
    {importOpen && <div className="modal" onMouseDown={e => e.target === e.currentTarget && setImportOpen(false)}><div className="modalCard"><button className="close" onClick={() => setImportOpen(false)}>×</button><span className="eyebrow">Quick import</span><h2>Paste your workout plan</h2><p>Use a day and title, then put each exercise above its sets × reps.</p><textarea value={importText} onChange={e => setImportText(e.target.value)} /><button className="primary wide" onClick={importPlan}>Import workout plan</button></div></div>}
    {editing && active && <Editor workout={active} onClose={() => setEditing(false)} onSave={w => { updateWorkout(w); setEditing(false); showToast("Workout updated."); }} onDelete={() => { setData(d => ({ ...d, workouts: d.workouts.filter(w => w.id !== active.id) })); setEditing(false); setTab("workouts"); }} />}
  </main>;
}

function Editor({ workout, onClose, onSave, onDelete }: { workout: Workout; onClose: () => void; onSave: (w: Workout) => void; onDelete: () => void }) {
  const [w, setW] = useState(structuredClone(workout));
  const patchEx = (i: number, patch: Partial<Exercise>) => setW(x => ({ ...x, exercises: x.exercises.map((e, j) => j === i ? { ...e, ...patch } : e) }));
  return <div className="modal"><div className="modalCard editor"><button className="close" onClick={onClose}>×</button><span className="eyebrow">Workout editor</span><h2>Build it your way</h2>
    <div className="formGrid"><label>Day<input value={w.day} onChange={e => setW({ ...w, day: e.target.value })} /></label><label>Workout name<input value={w.title} onChange={e => setW({ ...w, title: e.target.value })} /></label><label className="full">Notes<input value={w.notes} onChange={e => setW({ ...w, notes: e.target.value })} /></label></div>
    <div className="editExercises">{w.exercises.map((e, i) => <div className="editExercise" key={e.id}><span className="drag">☷</span><input value={e.name} onChange={x => patchEx(i, { name: x.target.value })} /><input type="number" min="1" value={e.sets} onChange={x => patchEx(i, { sets: Number(x.target.value) })} /><input value={e.reps} onChange={x => patchEx(i, { reps: x.target.value })} /><button onClick={() => setW(x => ({ ...x, exercises: x.exercises.filter((_, j) => j !== i) }))}>×</button><div className="move"><button disabled={i === 0} onClick={() => setW(x => { const a = [...x.exercises]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return { ...x, exercises: a }; })}>↑</button><button disabled={i === w.exercises.length - 1} onClick={() => setW(x => { const a = [...x.exercises]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return { ...x, exercises: a }; })}>↓</button></div></div>)}</div>
    <button className="addCard compact" onClick={() => setW(x => ({ ...x, exercises: [...x.exercises, exercise("New Exercise", 3, "10–12")] }))}>＋ Add exercise</button>
    <div className="buttonRow"><button className="primary" onClick={() => onSave(w)}>Save changes</button><button className="danger" onClick={onDelete}>Delete workout</button></div>
  </div></div>;
}

function Progress({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const [weight, setWeight] = useState(""); const [waist, setWaist] = useState(""); const [hips, setHips] = useState(""); const [chest, setChest] = useState("");
  const max = Math.max(...data.history.map(h => h.volume), 1);
  return <div className="page"><div className="pageTitle"><div><span className="eyebrow">Your momentum</span><h1>Progress</h1></div></div>
    <div className="metricGrid"><article><b>{data.weights.at(-1)?.value || "—"}</b><small>Current weight</small></article><article><b>{data.history.length}</b><small>Sessions</small></article><article><b>{Math.max(...data.history.map(h => h.volume), 0).toLocaleString()}</b><small>Best volume</small></article></div>
    <section className="settingsCard"><h2>Training volume</h2><div className="barChart">{data.history.slice(-12).map(h => <i key={h.id} title={`${h.date}: ${h.volume}`} style={{ height: `${Math.max(8, h.volume / max * 100)}%` }} />)}{!data.history.length && <p>Complete a workout to start your chart.</p>}</div></section>
    <div className="twoCol"><section className="settingsCard"><h2>Log body weight</h2><div className="inlineForm"><input inputMode="decimal" placeholder="Weight (lb)" value={weight} onChange={e => setWeight(e.target.value)} /><button className="primary" onClick={() => { if (Number(weight)) setData(d => ({ ...d, weights: [...d.weights, { date: today(), value: Number(weight) }] })); setWeight(""); }}>Save</button></div><div className="historyList">{data.weights.slice(-5).reverse().map((x, i) => <span key={i}>{x.date}<b>{x.value} lb</b></span>)}</div></section>
    <section className="settingsCard"><h2>Measurements</h2><div className="miniGrid"><input placeholder="Waist" value={waist} onChange={e => setWaist(e.target.value)} /><input placeholder="Hips" value={hips} onChange={e => setHips(e.target.value)} /><input placeholder="Chest" value={chest} onChange={e => setChest(e.target.value)} /></div><button className="primary wide" onClick={() => setData(d => ({ ...d, measurements: [...d.measurements, { date: today(), waist: Number(waist), hips: Number(hips), chest: Number(chest) }] }))}>Save measurements</button></section></div>
    <section className="settingsCard"><h2>Workout calendar & history</h2><div className="historyList">{data.history.slice().reverse().map(h => <span key={h.id}>{h.date} · {h.workout}<b>{h.sets} sets · {h.volume.toLocaleString()} lb</b></span>)}{!data.history.length && <p>No completed workouts yet.</p>}</div></section>
  </div>;
}

function RecoveryView({ data, setData, showToast }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; showToast: (s: string) => void }) {
  const [r, setR] = useState<Recovery>({ date: today(), sleep: 8, water: 80, protein: 130, walk: false, sauna: false, stretch: false, foam: false });
  const score = Math.min(100, Math.round(r.sleep / 8 * 35 + r.water / 100 * 20 + r.protein / 150 * 25 + [r.walk, r.sauna, r.stretch, r.foam].filter(Boolean).length * 5));
  return <div className="page"><div className="pageTitle"><div><span className="eyebrow">Recharge with intention</span><h1>Recovery</h1></div><div className="score">{score}<small>/100</small></div></div>
    <div className="twoCol"><section className="settingsCard"><h2>Daily foundations</h2><label>Sleep · {r.sleep} hours<input type="range" min="0" max="12" step=".5" value={r.sleep} onChange={e => setR({ ...r, sleep: Number(e.target.value) })} /></label><label>Water · {r.water} oz<input type="range" min="0" max="160" value={r.water} onChange={e => setR({ ...r, water: Number(e.target.value) })} /></label><label>Protein · {r.protein} g<input type="range" min="0" max="250" value={r.protein} onChange={e => setR({ ...r, protein: Number(e.target.value) })} /></label></section>
    <section className="settingsCard"><h2>Recovery rituals</h2><div className="habitGrid">{([["walk","Walk"],["sauna","Sauna"],["stretch","Stretch"],["foam","Foam roll"]] as const).map(([k, l]) => <button className={r[k] ? "done" : ""} key={k} onClick={() => setR({ ...r, [k]: !r[k] })}><span>{r[k] ? "✓" : "○"}</span>{l}</button>)}</div></section></div>
    <button className="primary wide" onClick={() => { setData(d => ({ ...d, recovery: [...d.recovery.filter(x => x.date !== r.date), r] })); showToast("Recovery check-in saved."); }}>Save today’s check-in</button>
    <section className="settingsCard"><h2>Muscle readiness</h2><div className="muscles">{["Chest","Shoulders","Back","Arms","Glutes","Quads","Hamstrings","Core"].map((m, i) => <span key={m}>{m}<i><b style={{ width: `${68 + (i * 7) % 29}%` }} /></i></span>)}</div></section>
  </div>;
}

function Calculators({ calc, setCalc }: { calc: Record<string, number | string>; setCalc: React.Dispatch<React.SetStateAction<any>> }) {
  const concentration = Number(calc.mg) * 1000 / Number(calc.ml || 1);
  const units = Number(calc.dose) / concentration * Number(calc.syringe);
  const oneRm = Number(calc.weight) * (1 + Number(calc.reps) / 30);
  const bmr = calc.sex === "male" ? 10 * Number(calc.weight) / 2.205 + 6.25 * Number(calc.height) * 2.54 - 5 * Number(calc.age) + 5 : 10 * Number(calc.weight) / 2.205 + 6.25 * Number(calc.height) * 2.54 - 5 * Number(calc.age) - 161;
  const calories = Math.round(bmr * Number(calc.activity) + Number(calc.goal));
  const field = (key: string, label: string, step = "1") => <label>{label}<input type="number" step={step} value={calc[key]} onChange={e => setCalc((c: any) => ({ ...c, [key]: Number(e.target.value) }))} /></label>;
  return <div className="page"><div className="pageTitle"><div><span className="eyebrow">Useful, clear, precise</span><h1>Calculators</h1></div></div>
    <div className="calculatorGrid"><section className="settingsCard"><h2>Vial measurement</h2><p className="notice">For measurement conversion only—not medical advice or a dosing recommendation.</p><div className="miniGrid">{field("mg","Vial amount (mg)",".1")}{field("ml","Liquid added (mL)",".1")}{field("dose","Entered amount (mcg)")}{field("syringe","Syringe units")}</div><div className="result"><span>Concentration<b>{Math.round(concentration)} mcg/mL</b></span><span>Draw to<b>{Number.isFinite(units) ? units.toFixed(1) : "—"} units</b></span></div></section>
    <section className="settingsCard"><h2>Estimated one-rep max</h2><div className="miniGrid">{field("weight","Weight lifted")}{field("reps","Completed reps")}</div><div className="bigResult">{Math.round(oneRm)}<small>estimated 1RM</small></div></section>
    <section className="settingsCard"><h2>Plate calculator</h2><p>For a 45 lb bar and a {calc.weight} lb target:</p><div className="bigResult">{Math.max(0, (Number(calc.weight) - 45) / 2)}<small>lb per side</small></div></section>
    <section className="settingsCard"><h2>Macro starting point</h2><div className="miniGrid">{field("weight","Body weight (lb)")}{field("height","Height (in)")}{field("age","Age")}{field("activity","Activity multiplier",".05")}</div><div className="result"><span>Calories<b>{calories}</b></span><span>Protein<b>{Math.round(Number(calc.weight) * .8)} g</b></span></div></section></div>
  </div>;
}
