import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api.ts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
};

const YearPage = () => {
  const { yearId } = useParams<{ yearId: string }>();

  // Fetch year details (from the years list)
  const { data: years = [] } = useQuery({
    queryKey: ['years'],
    queryFn: api.getYears,
  });
  const year = years.find((y) => y._id === yearId);

  // Fetch semesters for this year
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
        <h1 className="font-display text-3xl font-bold">📘 {year?.name ?? 'Loading...'}</h1>
        <p className="mt-1 text-muted-foreground">{year?.description ?? ''}</p>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="font-medium text-destructive">Failed to load semesters. Make sure the backend is running.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <motion.div variants={container} initial="hidden" animate="show" className="mt-8 grid gap-6 sm:grid-cols-2">
          {semesters.map((sem) => (
            <motion.div key={sem._id} variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={`/year/${yearId}/semester/${sem._id}`}
                className="group relative block overflow-hidden rounded-xl border bg-card p-8 card-shadow transition-shadow duration-300 hover:card-shadow-hover"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-card-foreground">{sem.name}</h2>
                    <p className="mt-1 text-muted-foreground">View all subjects and study materials</p>
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium text-accent">
                      View Subjects <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {semesters.length === 0 && (
            <div className="col-span-2 rounded-xl border border-dashed bg-muted/40 p-12 text-center">
              <p className="font-medium text-muted-foreground">No semesters found for this year.</p>
              <p className="mt-1 text-sm text-muted-foreground/70">Add semesters via the admin API.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default YearPage;
