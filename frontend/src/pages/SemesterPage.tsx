import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookMarked, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api.ts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
};

const SemesterPage = () => {
  const { yearId, semesterId } = useParams<{ yearId: string; semesterId: string }>();

  // Fetch year name for breadcrumb
  const { data: years = [] } = useQuery({
    queryKey: ['years'],
    queryFn: api.getYears,
  });
  const year = years.find((y) => y._id === yearId);

  // Fetch semesters to get current semester name
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', yearId],
    queryFn: () => api.getSemesters(yearId!),
    enabled: !!yearId,
  });
  const semester = semesters.find((s) => s._id === semesterId);

  // Fetch subjects
  const { data: subjects = [], isLoading, isError } = useQuery({
    queryKey: ['subjects', semesterId],
    queryFn: () => api.getSubjects(semesterId!),
    enabled: !!semesterId,
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link to={`/year/${yearId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to {year?.name ?? 'Year'}
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4">
        <h1 className="font-display text-3xl font-bold">{year?.name ?? ''} — {semester?.name ?? 'Loading...'}</h1>
        <p className="mt-1 text-muted-foreground">{subjects.length} subjects available</p>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="font-medium text-destructive">Failed to load subjects. Make sure the backend is running.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <motion.div variants={container} initial="hidden" animate="show" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subj) => (
            <motion.div key={subj._id} variants={item} whileHover={{ x: 4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={`/year/${yearId}/semester/${semesterId}/subject/${subj._id}`}
                className="group flex items-center gap-4 rounded-xl border bg-card p-5 card-shadow transition-all duration-300 hover:card-shadow-hover"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-card-foreground">{subj.name}</h3>
                  {subj.code && <p className="text-xs text-muted-foreground">{subj.code}</p>}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            </motion.div>
          ))}

          {subjects.length === 0 && (
            <div className="col-span-3 rounded-xl border border-dashed bg-muted/40 p-12 text-center">
              <p className="font-medium text-muted-foreground">No subjects found for this semester.</p>
              <p className="mt-1 text-sm text-muted-foreground/70">Add subjects via the admin API.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SemesterPage;
