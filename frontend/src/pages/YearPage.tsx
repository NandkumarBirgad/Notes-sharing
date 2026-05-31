import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, BookOpen, Code, Brain, Target, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api.ts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
};

// Config for skill categories
const skillPageConfig: Record<string, { emoji: string; icon: typeof BookOpen; gradient: string; accentBg: string; accentText: string; label: string }> = {
  DSA: { emoji: '🧠', icon: Brain, gradient: 'from-violet-500/10 to-purple-500/5', accentBg: 'bg-violet-100 group-hover:bg-violet-500', accentText: 'text-violet-600 group-hover:text-white', label: 'Topics' },
  Programming: { emoji: '💻', icon: Code, gradient: 'from-cyan-500/10 to-blue-500/5', accentBg: 'bg-cyan-100 group-hover:bg-cyan-500', accentText: 'text-cyan-600 group-hover:text-white', label: 'Languages & Concepts' },
  Aptitude: { emoji: '🎯', icon: Target, gradient: 'from-amber-500/10 to-orange-500/5', accentBg: 'bg-amber-100 group-hover:bg-amber-500', accentText: 'text-amber-600 group-hover:text-white', label: 'Categories' },
};

const YearPage = () => {
  const { yearId } = useParams<{ yearId: string }>();

  // Fetch year details (from the years list)
  const { data: years = [] } = useQuery({
    queryKey: ['years'],
    queryFn: api.getYears,
  });
  const year = years.find((y) => y._id === yearId);

  // Check if this is a skill category (DSA / Programming / Aptitude)
  const isSkillCategory = year && year.order >= 5;
  const skillCfg = year ? skillPageConfig[year.name] : undefined;

  // Fetch semesters / topics for this year
  const { data: semesters = [], isLoading, isError } = useQuery({
    queryKey: ['semesters', yearId],
    queryFn: () => api.getSemesters(yearId!),
    enabled: !!yearId,
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4">
        <h1 className="font-display text-3xl font-bold">
          {isSkillCategory ? (skillCfg?.emoji ?? '📚') : '📘'} {year?.name ?? 'Loading...'}
        </h1>
        <p className="mt-1 text-muted-foreground">{year?.description ?? ''}</p>
        {isSkillCategory && skillCfg && (
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {semesters.length} {skillCfg.label.toLowerCase()} available
          </p>
        )}
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="font-medium text-destructive">Failed to load {isSkillCategory ? 'topics' : 'semesters'}. Make sure the backend is running.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <motion.div variants={container} initial="hidden" animate="show" className={`mt-8 grid gap-6 ${isSkillCategory ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {semesters.map((sem) => {
            const IconComponent = isSkillCategory && skillCfg ? skillCfg.icon : Calendar;
            return (
              <motion.div key={sem._id} variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/year/${yearId}/semester/${sem._id}`}
                  className="group relative block overflow-hidden rounded-xl border bg-card p-8 card-shadow transition-shadow duration-300 hover:card-shadow-hover"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${isSkillCategory && skillCfg ? skillCfg.gradient : 'from-accent/5 to-transparent'} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${isSkillCategory && skillCfg ? `${skillCfg.accentBg} ${skillCfg.accentText}` : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground'}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-card-foreground">{sem.name}</h2>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {semesters.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-muted/40 p-12 text-center">
              <p className="font-medium text-muted-foreground">No {isSkillCategory ? 'topics' : 'semesters'} found.</p>
              <p className="mt-1 text-sm text-muted-foreground/70">Add {isSkillCategory ? 'topics' : 'semesters'} via the admin API.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default YearPage;
