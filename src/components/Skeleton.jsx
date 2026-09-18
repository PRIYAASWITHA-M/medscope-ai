/**
 * Skeleton — reusable shimmer loading components
 * Usage:
 *   <Skeleton.Line />           — single line
 *   <Skeleton.Card />           — stat card
 *   <Skeleton.DocItem />        — document list item
 *   <Skeleton.ApptItem />       — appointment card
 *   <Skeleton.Dashboard />      — full dashboard skeleton
 *   <Skeleton.AIResults />      — AI results page skeleton
 */

// Base shimmer animation
function Shimmer({ className = '' }) {
  return (
    <div
      className={`rounded-lg bg-slate-700/40 animate-pulse ${className}`}
      style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite, pulse 2s infinite' }}
    />
  )
}

function Line({ w = 'w-full', h = 'h-3' }) {
  return <Shimmer className={`${w} ${h}`} />
}

function Card() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 flex items-center gap-4">
      <Shimmer className="w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-7 w-16" />
        <Shimmer className="h-3 w-28" />
      </div>
    </div>
  )
}

function DocItem() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
      <Shimmer className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Shimmer className="h-3 w-48" />
        <Shimmer className="h-2.5 w-24" />
      </div>
      <Shimmer className="w-16 h-7 rounded-lg shrink-0" />
    </div>
  )
}

function ApptItem() {
  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 space-y-2">
      <div className="flex items-center gap-2">
        <Shimmer className="w-8 h-8 rounded-full shrink-0" />
        <Shimmer className="h-3.5 w-28" />
      </div>
      <Shimmer className="h-2.5 w-36" />
      <div className="flex justify-between">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

function HeroBanner() {
  return (
    <div className="rounded-3xl mb-6 p-6 sm:p-8 bg-slate-800/40 border border-slate-700/30 animate-pulse">
      <div className="flex items-center gap-5">
        <Shimmer className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-8 w-48" />
          <div className="flex gap-2 mt-2">
            <Shimmer className="h-6 w-16 rounded-full" />
            <Shimmer className="h-6 w-14 rounded-full" />
            <Shimmer className="h-6 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0d1b2a] p-6 space-y-6">
      {/* Hero */}
      <HeroBanner />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card /><Card /><Card />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 space-y-3">
          <Shimmer className="h-5 w-40 mb-2" />
          <DocItem /><DocItem /><DocItem />
        </div>
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 space-y-3">
          <Shimmer className="h-5 w-32 mb-2" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/20">
              <Shimmer className="w-8 h-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 space-y-3">
        <Shimmer className="h-5 w-44 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ApptItem /><ApptItem /><ApptItem />
        </div>
      </div>
    </div>
  )
}

function AIResults() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07111f] via-[#102a43] to-[#0b3b4c] p-4">
      <div className="max-w-2xl mx-auto pt-10 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <Shimmer className="h-8 w-48 mx-auto" />
          <Shimmer className="h-3 w-56 mx-auto" />
        </div>

        {/* Summary card */}
        <div className="bg-[#112538]/90 border border-teal-500/20 rounded-2xl p-6 space-y-3">
          <Shimmer className="h-5 w-48" />
          <Shimmer className="h-3 w-32" />
          <div className="bg-teal-900/20 rounded-xl p-3 space-y-2">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-4/5" />
          </div>
        </div>

        {/* Voice player skeleton */}
        <div className="bg-slate-800/70 border border-teal-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shimmer className="w-6 h-6 rounded-lg shrink-0" />
            <Shimmer className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Shimmer className="h-8 w-24 rounded-xl" />
            <Shimmer className="h-8 w-20 rounded-xl" />
            <Shimmer className="h-8 w-20 rounded-xl" />
          </div>
          <Shimmer className="h-10 w-full rounded-xl" />
        </div>

        {/* Result sections */}
        {['Patient Information', 'Diagnosis', 'Medicines', 'Tests'].map(label => (
          <div key={label} className="bg-[#112538]/90 border border-teal-500/10 rounded-2xl p-5 space-y-2">
            <Shimmer className="h-4 w-36 mb-3" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default { Line, Card, DocItem, ApptItem, Dashboard, AIResults, HeroBanner, Shimmer }
