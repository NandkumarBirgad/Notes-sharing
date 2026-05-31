import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Download, FileText, Video, Sparkles, GraduationCap, Search, BookOpen, Upload, Loader2, Cpu, Globe, Brain, Radio, Cog, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api, Branch } from '@/lib/api.ts';

// Branch config – icon, gradient, colors
const branchConfig: Record<string, {
  LucideIcon: React.ComponentType<{ className?: string }>;
  gradient: string;
  border: string;
  iconBg: string;
  iconColor: string;
  badge: string;
}> = {
  CE:    { LucideIcon: Cpu,       gradient: 'from-blue-600 to-indigo-700',    border: 'hover:border-blue-300/60',   iconBg: 'bg-blue-500/15',   iconColor: 'text-blue-500',   badge: 'bg-blue-500/10 text-blue-600' },
  IT:    { LucideIcon: Globe,     gradient: 'from-teal-500 to-emerald-600',   border: 'hover:border-teal-300/60',   iconBg: 'bg-teal-500/15',   iconColor: 'text-teal-500',   badge: 'bg-teal-500/10 text-teal-600' },
  AIDS:  { LucideIcon: Brain,     gradient: 'from-violet-600 to-purple-700',  border: 'hover:border-violet-300/60', iconBg: 'bg-violet-500/15', iconColor: 'text-violet-500', badge: 'bg-violet-500/10 text-violet-600' },
  ENTC:  { LucideIcon: Radio,     gradient: 'from-pink-500 to-rose-600',      border: 'hover:border-pink-300/60',   iconBg: 'bg-pink-500/15',   iconColor: 'text-pink-500',   badge: 'bg-pink-500/10 text-pink-600' },
  MECH:  { LucideIcon: Cog,       gradient: 'from-orange-500 to-amber-600',   border: 'hover:border-orange-300/60', iconBg: 'bg-orange-500/15', iconColor: 'text-orange-500', badge: 'bg-orange-500/10 text-orange-600' },
  CIVIL: { LucideIcon: Building2, gradient: 'from-stone-500 to-slate-600',    border: 'hover:border-stone-300/60',  iconBg: 'bg-stone-500/15',  iconColor: 'text-stone-500',  badge: 'bg-stone-500/10 text-stone-600' },
};

const statItems = [
  { icon: FileText, label: 'Study Notes', value: '500+' },
  { icon: Download, label: 'Downloads',   value: '12K+' },
  { icon: Video,    label: 'Video Lectures', value: '150+' },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
};

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: branches = [], isLoading, isError } = useQuery({
    queryKey: ['branches'],
    queryFn: api.getBranches,
  });

  const { data: statsMap = {} } = useQuery({
    queryKey: ['branch-stats-all'],
    queryFn: api.getAllBranchStats,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />

        <div className="container relative mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">

            {/* Left: Copy & Actions */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeUpItem} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Your Ultimate Academic Resource Hub</span>
              </motion.div>

              <motion.h1 variants={fadeUpItem} className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                Study Smarter,{' '}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  By Branch.
                </span>
              </motion.h1>

              <motion.p variants={fadeUpItem} className="text-lg text-muted-foreground mb-8 max-w-xl">
                Access curated study notes, previous year papers, and video lectures. Organized by your engineering branch, year, and semester.
              </motion.p>

              {/* Search Bar */}
              <motion.form variants={fadeUpItem} onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subjects, topics, or papers..."
                    className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
                >
                  Search <ArrowRight className="h-4 w-4" />
                </button>
              </motion.form>

              {/* Quick branch jump */}
              <motion.div variants={fadeUpItem} className="flex flex-wrap gap-2">
                {(branches as Branch[]).slice(0, 3).map((b) => {
                  const cfg = branchConfig[b.code];
                  return (
                    <Link
                      key={b._id}
                      to={`/branch/${b._id}`}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all hover:scale-105 ${cfg?.badge ?? 'bg-muted text-foreground'}`}
                    >
                      {b.icon} {b.code}
                    </Link>
                  );
                })}
                <span className="inline-flex items-center text-xs text-muted-foreground px-1">
                  + {Math.max(0, (branches as Branch[]).length - 3)} more branches ↓
                </span>
              </motion.div>
            </motion.div>

            {/* Right: Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center h-[500px]"
            >
              <div className="flex h-48 w-48 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="h-24 w-24" />
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 top-1/4 rounded-xl bg-background/90 backdrop-blur-md border border-border p-4 shadow-lg flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Free Access</p>
                  <p className="text-sm font-bold">All Resources</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-4 bottom-1/3 rounded-xl bg-background/90 backdrop-blur-md border border-border p-4 shadow-lg"
              >
                <p className="text-xs text-muted-foreground font-medium">Branches</p>
                <p className="text-2xl font-extrabold text-primary">{(branches as Branch[]).length || 6}</p>
                <p className="text-xs text-muted-foreground">Engineering Streams</p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="container mx-auto px-4 relative z-10 -mt-16 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl rounded-2xl bg-card border border-border shadow-lg p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
            {statItems.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-center gap-4 pt-4 md:pt-0 first:pt-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold font-display">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3. BROWSE BY BRANCH */}
      <section id="branches-section" className="container mx-auto px-4 py-16 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-3">
              <Sparkles className="h-4 w-4" />
              <span>Choose Your Stream</span>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Browse by Engineering Branch</h2>
            <p className="text-muted-foreground max-w-2xl">
              Select your branch to find semester-wise notes, previous year papers, and video lectures tailored for your curriculum.
            </p>
          </motion.div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
            <p className="font-medium text-destructive">Failed to load branches. Make sure the backend is running on port 5000.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {(branches as Branch[]).map((branch) => {
              const cfg = branchConfig[branch.code] ?? {
                LucideIcon: BookOpen,
                gradient: 'from-gray-600 to-slate-700',
                border: 'hover:border-gray-300/60',
                iconBg: 'bg-gray-500/15',
                iconColor: 'text-gray-500',
                badge: 'bg-muted text-foreground',
              };
              const Icon = cfg.LucideIcon;
              const resourceCount = (statsMap as Record<string, number>)[branch._id] ?? 0;

              return (
                <motion.div key={branch._id} variants={fadeUpItem} whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={`/branch/${branch._id}`}
                    className={`group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:shadow-xl ${cfg.border}`}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none`} />

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Icon + badge */}
                      <div className="flex items-start justify-between mb-5">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${cfg.iconBg}`}>
                          <Icon className={`h-7 w-7 ${cfg.iconColor}`} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-2xl">{branch.icon}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.badge}`}>
                            {branch.code}
                          </span>
                        </div>
                      </div>

                      {/* Name + Description */}
                      <h3 className="font-display text-xl font-bold mb-2 leading-tight">{branch.name}</h3>
                      <p className="text-sm text-muted-foreground flex-grow mb-5 leading-relaxed">{branch.description}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/60">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <FileText className="h-3.5 w-3.5" />
                          {resourceCount > 0 ? `${resourceCount}+ Resources` : 'Resources available'}
                        </span>
                        <span className={`flex items-center gap-1 text-sm font-semibold ${cfg.iconColor}`}>
                          View Branch
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight mb-3">How It Works</h2>
          <p className="text-muted-foreground">Navigate from your branch all the way to the resources you need.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto"
        >
          {[
            { step: '01', label: 'Choose Branch', desc: 'Select your engineering branch (CE, IT, AIDS...)', emoji: '🎓' },
            { step: '02', label: 'Pick Year', desc: 'Select your current academic year', emoji: '📅' },
            { step: '03', label: 'Select Semester', desc: 'Choose the semester you need resources for', emoji: '📖' },
            { step: '04', label: 'Browse Resources', desc: 'Access notes, papers, and video lectures', emoji: '📥' },
          ].map((s) => (
            <motion.div key={s.step} variants={fadeUpItem} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="text-3xl mb-3">{s.emoji}</div>
              <div className="text-xs font-bold text-primary/60 tracking-widest mb-1">{s.step}</div>
              <h4 className="font-display font-bold mb-2">{s.label}</h4>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. BOTTOM CTA */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
              <Upload className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Empower Your Peers
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-300 mb-8">
              Got great notes or a previous year paper? Upload them and help build the ultimate knowledge base for your branch.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-slate-900 transition-all hover:bg-slate-100 hover:scale-105 shadow-lg"
            >
              Contribute Materials <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Index;