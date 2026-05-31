import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Loader2, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api, Branch, Year } from '@/lib/api.ts';
import Breadcrumb from '@/components/Breadcrumb';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
};

const yearColors = [
  { bg: 'from-blue-500/10 to-indigo-500/5', border: 'hover:border-blue-300', icon: 'bg-blue-100 text-blue-600', accent: 'text-blue-600' },
  { bg: 'from-emerald-500/10 to-teal-500/5', border: 'hover:border-emerald-300', icon: 'bg-emerald-100 text-emerald-600', accent: 'text-emerald-600' },
  { bg: 'from-violet-500/10 to-purple-500/5', border: 'hover:border-violet-300', icon: 'bg-violet-100 text-violet-600', accent: 'text-violet-600' },
  { bg: 'from-orange-500/10 to-amber-500/5', border: 'hover:border-orange-300', icon: 'bg-orange-100 text-orange-600', accent: 'text-orange-600' },
];

const BranchPage = () => {
  const { branchId } = useParams<{ branchId: string }>();

  const { data: branch } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => api.getBranch(branchId!),
    enabled: !!branchId,
  });

  const { data: years = [], isLoading, isError } = useQuery({
    queryKey: ['years', branchId],
    queryFn: () => api.getYears(branchId!),
    enabled: !!branchId,
  });

  const branchObj = branch as Branch | undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb items={[{ label: branchObj?.name ?? 'Branch' }]} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Branch Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl shadow-sm">
              {branchObj?.icon ?? '📚'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-1">
                {branchObj?.code}
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {branchObj?.name ?? 'Loading...'}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl ml-20 text-sm">
            {branchObj?.description ?? ''}
          </p>
        </motion.div>

        {/* Section heading */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Select Academic Year</h2>
          {!isLoading && (
            <span className="ml-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {years.length}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
            <p className="font-medium text-destructive">Failed to load years. Make sure the backend is running.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {years.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/40 p-16 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="font-medium text-muted-foreground">No years found for this branch.</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Add years via the admin panel.</p>
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
              >
                {years.map((year: Year, idx: number) => {
                  const colors = yearColors[idx % yearColors.length];
                  return (
                    <motion.div key={year._id} variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to={`/branch/${branchId}/year/${year._id}`}
                        className={`group relative flex flex-col h-full overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg ${colors.border}`}
                      >
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`} />

                        <div className="relative z-10">
                          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${colors.icon}`}>
                            <BookOpen className="h-6 w-6" />
                          </div>

                          <h3 className="font-display text-xl font-bold mb-1">{year.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4 flex-grow">{year.description}</p>

                          <div className={`flex items-center gap-1 text-sm font-semibold ${colors.accent}`}>
                            View Semesters
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BranchPage;
