import { useState } from 'react'
import { motion } from 'framer-motion'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartLine, Dumbbell, Medal, Table2, TrendingUp, Trophy } from 'lucide-react'
import { lifts, personalRecords, strengthHistory, user } from '../data/mock'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import useChartTheme from '../hooks/useChartTheme'

// Secondary encoding so series identity never relies on colour alone
const shapes = ['circle', 'square', 'diamond']

function Marker({ shape, cx, cy, size = 9, fill, ring }) {
  const h = size / 2
  if (shape === 'square') return <rect x={cx - h} y={cy - h} width={size} height={size} rx={2} fill={fill} stroke={ring} strokeWidth={2} />
  if (shape === 'diamond')
    return <path d={`M${cx} ${cy - h - 1}L${cx + h + 1} ${cy}L${cx} ${cy + h + 1}L${cx - h - 1} ${cy}Z`} fill={fill} stroke={ring} strokeWidth={2} />
  return <circle cx={cx} cy={cy} r={h} fill={fill} stroke={ring} strokeWidth={2} />
}

function LegendSwatch({ shape, color }) {
  return (
    <svg width="14" height="14" aria-hidden="true">
      <Marker shape={shape} cx={7} cy={7} size={9} fill={color} ring="transparent" />
    </svg>
  )
}

function StrengthTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass min-w-36 rounded-xl px-3 py-2.5 text-sm">
      <p className="mb-1.5 font-semibold text-ink">Week {label.replace('W', '')}</p>
      {lifts.map((l, i) => {
        const p = payload.find((x) => x.dataKey === l.key)
        if (!p) return null
        return (
          <p key={l.key} className="flex items-center justify-between gap-4 text-ink-2">
            <span className="flex items-center gap-1.5"><LegendSwatch shape={shapes[i]} color={colors[i]} />{l.label}</span>
            <span className="font-semibold text-ink tabular-nums">{p.value} kg</span>
          </p>
        )
      })}
    </div>
  )
}

const tierStyle = {
  gold: { badge: 'from-amber-300 to-amber-500', label: 'Gold', text: 'text-amber-400' },
  silver: { badge: 'from-slate-200 to-slate-400', label: 'Silver', text: 'text-slate-400' },
  bronze: { badge: 'from-orange-300 to-orange-600', label: 'Bronze', text: 'text-orange-400' },
}

export default function Progress() {
  const c = useChartTheme()
  const [range, setRange] = useState(12)
  const [view, setView] = useState('chart')
  const data = strengthHistory.slice(-range)
  const last = data.length - 1
  const first = data[0]
  const latest = data[last]

  const gains = lifts.map((l) => ({ ...l, gain: latest[l.key] - first[l.key], pct: ((latest[l.key] - first[l.key]) / first[l.key]) * 100 }))

  return (
    <div>
      <PageHeader eyebrow="Progress" title="Stronger every week" subtitle="Estimated one-rep max (kg) for your main lifts" />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { icon: TrendingUp, label: 'Total gain', value: gains.reduce((s, g) => s + g.gain, 0), suffix: ' kg', decimals: 1 },
          { icon: Dumbbell, label: 'Workouts logged', value: user.totalWorkouts },
          { icon: Trophy, label: 'PRs this month', value: 4 },
          { icon: Medal, label: 'Training hours', value: user.totalHours },
        ].map((t, i) => (
          <GlassCard key={t.label} delay={i * 0.05} className="p-4! sm:p-5!">
            <t.icon size={18} className="text-accent-text" />
            <p className="mt-3 font-display text-3xl font-bold text-ink">
              <AnimatedCounter value={t.value} suffix={t.suffix} decimals={t.decimals ?? 0} />
            </p>
            <p className="text-sm text-ink-3">{t.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Chart */}
      <GlassCard hover={false} delay={0.15} className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">Strength gains</h2>
            <p className="text-sm text-ink-3">Last {range} weeks</p>
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-xl bg-surface-2 p-1" role="group" aria-label="Time range">
              {[6, 12].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  aria-pressed={range === r}
                  className={`h-8 rounded-lg px-3 text-xs font-semibold transition ${range === r ? 'bg-bg text-ink shadow' : 'text-ink-3 hover:text-ink'}`}
                >
                  {r}W
                </button>
              ))}
            </div>
            <div className="flex rounded-xl bg-surface-2 p-1" role="group" aria-label="View">
              {[
                ['chart', ChartLine],
                ['table', Table2],
              ].map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  aria-label={`${v} view`}
                  className={`grid h-8 w-9 place-items-center rounded-lg transition ${view === v ? 'bg-bg text-ink shadow' : 'text-ink-3 hover:text-ink'}`}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {gains.map((g, i) => (
            <li key={g.key} className="flex items-center gap-2 text-sm text-ink-2">
              <LegendSwatch shape={shapes[i]} color={c.series[i]} />
              {g.label}
              <span className="text-xs font-semibold text-accent-text">+{g.pct.toFixed(0)}%</span>
            </li>
          ))}
        </ul>

        {view === 'chart' ? (
          <div className="mt-4 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={`${range}-${c.surface}`} data={data} margin={{ top: 12, right: 104, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} dy={6} interval="preserveStartEnd" />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip content={<StrengthTooltip colors={c.series} />} cursor={{ stroke: c.axis, strokeDasharray: '4 4' }} />
                {lifts.map((l, i) => (
                  <Line
                    key={l.key}
                    type="monotone"
                    dataKey={l.key}
                    name={l.label}
                    stroke={c.series[i]}
                    strokeWidth={2}
                    animationDuration={1400}
                    animationBegin={i * 150}
                    dot={(p) =>
                      p.index === last ? (
                        <Marker key={`d-${l.key}`} shape={shapes[i]} cx={p.cx} cy={p.cy} fill={c.series[i]} ring={c.surface} />
                      ) : (
                        <g key={`d-${l.key}-${p.index}`} />
                      )
                    }
                    activeDot={(p) => <Marker key={`a-${l.key}`} shape={shapes[i]} cx={p.cx} cy={p.cy} size={11} fill={c.series[i]} ring={c.surface} />}
                    label={(p) =>
                      p.index === last ? (
                        <text key={`l-${l.key}`} x={p.x + 10} y={p.y} dy={4} fill={c.ink2} fontSize={12} fontWeight={600}>
                          {l.label} {p.value}
                        </text>
                      ) : null
                    }
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4 max-h-80 overflow-auto rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-2 text-left text-xs uppercase tracking-wider text-ink-3 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-semibold">Week</th>
                  {lifts.map((l) => <th key={l.key} className="px-4 py-3 text-right font-semibold">{l.label} (kg)</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.week} className="border-t border-line">
                    <td className="px-4 py-2.5 text-ink-2">{row.week}</td>
                    {lifts.map((l) => <td key={l.key} className="px-4 py-2.5 text-right font-medium text-ink tabular-nums">{row[l.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* PRs */}
      <h2 className="mt-10 mb-4 flex items-center gap-2 text-2xl font-bold text-ink">
        <Trophy size={22} className="text-amber-400" /> Personal records
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {personalRecords.map((pr, i) => {
          const t = tierStyle[pr.tier]
          return (
            <motion.div
              key={pr.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -5 }}
              className="glass group flex items-center gap-4 rounded-3xl p-4"
            >
              <motion.span
                whileHover={{ rotate: [0, -12, 12, 0] }}
                className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.badge} text-black/80 shadow-lg`}
              >
                <Trophy size={26} />
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-3">{pr.lift}</p>
                <p className="font-display text-2xl font-bold text-ink">
                  {pr.value}
                  {pr.unit && <span className="ml-1 text-base font-medium text-ink-3">{pr.unit}</span>}
                </p>
                <p className="text-xs text-ink-3">
                  {pr.date} · <span className={`font-semibold ${t.text}`}>{t.label}</span>
                </p>
              </div>
              <span className="self-start rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-text">{pr.delta}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
