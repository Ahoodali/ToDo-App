import { useState, useRef, useEffect } from 'react'

type Filter = 'all' | 'active' | 'done'

interface Task {
  id: string
  text: string
  done: boolean
  date: string // YYYY-MM-DD
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
function offsetDate(base: string, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
function formatHeader(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const t = today()
  const y = offsetDate(t, -1)
  if (dateStr === t) return { label: 'Today', sub: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }
  if (dateStr === y) return { label: 'Yesterday', sub: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }
  return {
    label: d.toLocaleDateString('en-US', { weekday: 'long' }),
    sub: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  }
}

function uid() { return Math.random().toString(36).slice(2, 10) }

const t = today()
const d1 = offsetDate(t, -1)
const d2 = offsetDate(t, -2)
const d3 = offsetDate(t, -4)

const SEED: Task[] = [

]

/* ── Icons ── */
const CheckIcon = () => (
  <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
    <path d="M1.5 5l3.5 3.5 6.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 4h11M5 4V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1M6 7v4M9 7v4M3 4l.8 8a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9L13 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M11 5l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3" width="13" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)

/* ── Filter Tab ── */
function Tab({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: ()
   => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '8px 4px', borderRadius: 14, border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: active ? 700 : 500, fontFamily: 'Nunito, sans-serif',
        transition: 'all 0.2s',
        background: active ? '#fff' : 'transparent',
        color: active ? '#5b8a75' : '#a89f94',
        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
      }}
    >
      {label}
      <span style={{
        marginLeft: 4, fontSize: 11, fontWeight: 700,
        background: active ? '#e8f5ef' : '#ede9e3',
        color: active ? '#5b8a75' : '#b0a99e',
        borderRadius: 99, padding: '1px 6px',
      }}>
        <span translate="no">{count}</span>
      </span>
    </button>
  )
}

/* ── Task Row ── */
function TaskRow({ task, onToggle, onDelete, onEdit, isPast }: {
  task: Task; onToggle: () => void; onDelete: () => void; onEdit: () => void; isPast: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#fff', borderRadius: 18, padding: '14px 16px',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      opacity: task.done ? 0.55 : 1,
      transition: 'opacity 0.2s',
    }}>
      <button
        onClick={onToggle}
        disabled={isPast}
        style={{
          width: 26, height: 26, borderRadius: 8, cursor: isPast ? 'default' : 'pointer',
          border: task.done ? '2px solid #7bb89e' : '2px solid #d9d3cb',
          background: task.done ? '#7bb89e' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.2s', color: '#fff',
        }}
      >
        {task.done && <CheckIcon />}
      </button>
      <span style={{
        flex: 1, fontSize: 15, fontWeight: 600,
        color: task.done ? '#b0a89e' : '#4a433c',
        textDecorationLine: task.done ? 'line-through' : 'none',
        textDecorationColor: task.done ? '#c4b9ae' : 'transparent',
        lineHeight: 1.4,
      }}>
        {task.text}
      </span>
      {!isPast && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={onEdit} style={{
            width: 30, height: 30, borderRadius: 10, border: 'none',
            background: '#f5f0eb', color: '#9b8f84',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <EditIcon />
          </button>
          <button onClick={onDelete} style={{
            width: 30, height: 30, borderRadius: 10, border: 'none',
            background: '#fdf0f0', color: '#e08080',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Task Modal ── */
function TaskModal({ initial, onSave, onClose }: { initial: string; onSave: (t: string) => void; onClose: () => void }) {
  const [text, setText] = useState(initial)
  const ref = useRef<HTMLTextAreaElement>(null)
  const isEdit = initial !== ''

  useEffect(() => { ref.current?.focus(); ref.current?.select() }, [])

  function handleSave() { if (text.trim()) { onSave(text.trim()); onClose() } }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(60,50,40,0.35)',
      backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'center', zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420, background: '#fff',
        borderRadius: '28px 28px 0 0', padding: '28px 24px 36px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: '#e8e2da', margin: '0 auto 24px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#4a433c', marginBottom: 16 }}>
          {isEdit ? '✏️ Edit Task' : '✨ New Task'}
        </h3>
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() } }}
          placeholder="What needs to be done?"
          rows={3}
          style={{
            width: '100%', border: '2px solid #eae5de', borderRadius: 16,
            padding: '14px 16px', fontSize: 15, fontFamily: 'Nunito, sans-serif',
            fontWeight: 600, color: '#4a433c', resize: 'none', outline: 'none',
            background: '#faf8f5', lineHeight: 1.5, transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = '#7bb89e' }}
          onBlur={e => { e.target.style.borderColor = '#eae5de' }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '14px', borderRadius: 16, border: 'none',
            background: '#f0ece6', color: '#9b8f84',
            fontSize: 15, fontWeight: 700, fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={!text.trim()} style={{
            flex: 2, padding: '14px', borderRadius: 16, border: 'none',
            background: text.trim() ? '#7bb89e' : '#d9d4cc', color: '#fff',
            fontSize: 15, fontWeight: 800, fontFamily: 'Nunito, sans-serif',
            cursor: text.trim() ? 'pointer' : 'default', transition: 'background 0.2s',
          }}>
            {isEdit ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Day Picker Modal ── */
function DayPickerModal({ tasks, currentDate, onSelect, onClose }: {
  tasks: Task[]; currentDate: string; onSelect: (d: string) => void; onClose: () => void
}) {
  const dates = [...new Set(tasks.map(t => t.date))].sort((a, b) => b.localeCompare(a))
  const t0 = today()

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(60,50,40,0.35)',
      backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'center', zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420, background: '#fff',
        borderRadius: '28px 28px 0 0', padding: '28px 24px 36px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
        maxHeight: '70vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: '#e8e2da', margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#4a433c', marginBottom: 16 }}>
          📅 Pick a Day
        </h3>
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dates.map(d => {
            const info = formatHeader(d)
            const count = tasks.filter(tk => tk.date === d).length
            const done  = tasks.filter(tk => tk.date === d && tk.done).length
            const pct   = count ? Math.round((done / count) * 100) : 0
            const isActive = d === currentDate
            const isToday  = d === t0

            return (
              <button key={d} onClick={() => { onSelect(d); onClose() }} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 18, border: 'none',
                background: isActive ? '#e8f5ef' : '#faf8f5',
                cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.15s',
                outline: isActive ? '2px solid #7bb89e' : 'none',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: isToday ? '#7bb89e' : '#ede9e3',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: isToday ? '#fff' : '#6b6159', lineHeight: 1 }}>
                    {new Date(d + 'T00:00:00').getDate()}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isToday ? 'rgba(255,255,255,0.8)' : '#a09488' }}>
                    {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#4a433c' }}>{info.label}</span>
                    <span style={{ fontSize: 11, color: '#b0a99e', fontWeight: 600 }}>{done}/{count} done</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: '#e0dbd4' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: pct === 100 ? '#7bb89e' : '#b8d8cb',
                      width: `${pct}%`, transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── App ── */
export default function App() {
  const [tasks, setTasks]           = useState<Task[]>(SEED)
  const [filter, setFilter]         = useState<Filter>('all')
  const [activeDate, setActiveDate] = useState(today())
  const [modal, setModal]           = useState<{ type: 'add' } | { type: 'edit'; id: string; text: string } | null>(null)
  const [showDayPicker, setShowDayPicker] = useState(false)

  const isToday = activeDate === today()
  const isPast  = activeDate < today()
  const info    = formatHeader(activeDate)

  const dateTasks = tasks.filter(t => t.date === activeDate)
  const counts = {
    all:    dateTasks.length,
    active: dateTasks.filter(t => !t.done).length,
    done:   dateTasks.filter(t => t.done).length,
  }
  const visible = dateTasks.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done
  )
  const completionPct = counts.all ? Math.round((counts.done / counts.all) * 100) : 0

  function goDay(delta: number) {
    setActiveDate(prev => {
      const next = offsetDate(prev, delta)
      return next > today() ? prev : next
    })
    setFilter('all')
  }

  function toggle(id: string) { setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t)) }
  function remove(id: string) { setTasks(ts => ts.filter(t => t.id !== id)) }
  function addTask(text: string) { setTasks(ts => [{ id: uid(), text, done: false, date: today() }, ...ts]) }
  function editTask(id: string, text: string) { setTasks(ts => ts.map(t => t.id === id ? { ...t, text } : t)) }

  return (
    <div style={{ width: '100%', maxWidth: 420, minHeight: '100vh', background: '#f5f1ec', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* ── Header ── */}
      <div style={{
        background: isPast
          ? 'linear-gradient(145deg, #8ec5a8 0%, #a8d4bd 100%)'
          : 'linear-gradient(145deg, #8ec5a8 0%, #a8d4bd 100%)',
        padding: '52px 24px 28px',
        borderRadius: '0 0 32px 32px',
        boxShadow: isPast ? '0 4px 20px rgba(100,130,160,0.2)' : '0 4px 20px rgba(100,160,130,0.2)',
        transition: 'background 0.4s',
      }}>
        {/* Nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => goDay(-1)} style={{
            width: 36, height: 36, borderRadius: 12, border: 'none',
            background: 'rgba(255,255,255,0.25)', color: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ChevronLeft />
          </button>

          <button onClick={() => setShowDayPicker(true)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.2)', border: 'none',
            borderRadius: 14, padding: '6px 14px', cursor: 'pointer', color: '#111111',
          }}>
            <CalendarIcon />
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Nunito, sans-serif' }}>{info.label}</span>
          </button>

          <button onClick={() => goDay(1)} disabled={isToday} style={{
            width: 36, height: 36, borderRadius: 12, border: 'none',
            background: isToday ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.25)',
            color: isToday ? 'rgba(255,255,255,0.3)' : '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isToday ? 'default' : 'pointer',
          }}>
            <ChevronRight />
          </button>
        </div>

        {/* Title */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(15, 13, 13, 0.75)', marginBottom: 3 }}>{info.sub}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a', lineHeight: 1.2 }}>
            {isPast ? 'Past Tasks' : 'My Daily Tasks'}
          </h1>
          {isPast && (
            <button onClick={() => { setActiveDate(today()); setFilter('all') }} style={{
              fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 99,
              background: 'rgba(255,255,255,0.25)', border: 'none', color: '#111111', cursor: 'pointer',
            }}>
            Today  → 
            </button>
          )}
        </div>

        {/* Progress */}
        {counts.all > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>
                {counts.done} of {counts.all} completed
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#111111' }}>{completionPct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.3)' }}>
              <div style={{
                height: '100%', borderRadius: 99, background: '#111111',
                width: `${completionPct}%`, transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', gap: 4, background: '#eae5de', borderRadius: 18, padding: 4 }}>
          <Tab label="All"        active={filter === 'all'}    count={counts.all}    onClick={() => setFilter('all')}    />
          <Tab label="In Progress" active={filter === 'active'} count={counts.active} onClick={() => setFilter('active')} />
          <Tab label="Completed"  active={filter === 'done'}   count={counts.done}   onClick={() => setFilter('done')}   />
        </div>
      </div>

      {/* ── Task List ── */}
      <div style={{ flex: 1, padding: '14px 20px 100px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {isPast && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f0ece6', borderRadius: 14, padding: '10px 14px',
          }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#9b8f84', lineHeight: 1.4 }}>
              Past day — view only
            </p>
          </div>
        )}

        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 0', color: '#b5ada4' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>
              {filter === 'done' ? '🎉' : counts.all === 0 ? '📅' : '📝'}
            </div>
            <p style={{ fontSize: 15, fontWeight: 700 }}>
              {counts.all === 0
                ? 'No tasks for this day'
                : filter === 'done'
                  ? 'No completed tasks'
                  : 'No tasks in progress'}
            </p>
          </div>
        ) : (
          visible.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              isPast={isPast}
              onToggle={() => toggle(task.id)}
              onDelete={() => remove(task.id)}
              onEdit={() => setModal({ type: 'edit', id: task.id, text: task.text })}
            />
          ))
        )}
      </div>

      {/* ── FAB (today only) ── */}
      {isToday && (
        <button
          onClick={() => setModal({ type: 'add' })}
          style={{
            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            width: 60, height: 60, borderRadius: 20, border: 'none',
            background: 'linear-gradient(135deg, #7bb89e, #5ea387)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 6px 24px rgba(94,163,135,0.45)',
            transition: 'transform 0.15s', zIndex: 50,
          }}
        >
          <PlusIcon />
        </button>
      )}

      {/* ── Modals ── */}
      {modal && (
        <TaskModal
          initial={modal.type === 'edit' ? modal.text : ''}
          onSave={text => { modal.type === 'add' ? addTask(text) : editTask(modal.id, text) }}
          onClose={() => setModal(null)}
        />
      )}
      {showDayPicker && (
        <DayPickerModal
          tasks={tasks}
          currentDate={activeDate}
          onSelect={d => { setActiveDate(d); setFilter('all') }}
          onClose={() => setShowDayPicker(false)}
        />
      )}
    </div>
  )
}
