import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Calendar, BookOpen, Loader2, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api, Branch, Semester, Year } from '@/lib/api.ts';
import Breadcrumb from '@/components/Breadcrumb';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
};

const semesterColors = [
  { border: 'hover:border-blue-300', icon: 'bg-blue-100 text-blue-600', accent: 'text-blue-600' },
  { border: 'hover:border-emerald-300', icon: 'bg-emerald-100 text-emerald-600', accent: 'text-emerald-600' },
];

const BranchYearPage = () => {
  const { branchId, yearId } = useParams<{ branchId: string; yearId: string }>();

  const { data: branch } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => api.getBranch(branchId!),
    enabled: !!branchId,
  });

  const { data: year } = useQuery({
    queryKey: ['year', yearId],
    queryFn: () => api.getYear(yearId!),
    enabled: !!yearId,
  });

  const { data: semesters = [], isLoading, isError } = useQuery({
    queryKey: ['semesters', yearId],
    queryFn: () => api.getSemesters(yearId!),
    enabled: !!yearId,
  });

  const branchObj = branch as Branch | undefined;
  const yearObj = year as Year | undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: branchObj?.name ?? 'Branch', href: `/branch/${branchId}` },
              { label: yearObj?.name ?? 'Year' },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{branchObj?.icon ?? '📚'}</span>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {branchObj?.name ?? ''} — {branchObj?.code ?? ''}
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {yearObj?.name ?? 'Loading...'}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-12 text-sm">
            {yearObj?.description ?? ''}
          </p>
        </motion.div>

        {/* Section heading */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Select Semester</h2>
          {!isLoading && (
            <span className="ml-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {semesters.length}
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
            <p className="font-medium text-destructive">Failed to load semesters. Make sure the backend is running.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {semesters.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/40 p-16 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="font-medium text-muted-foreground">No semesters found for this year.</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Add semesters via the admin panel.</p>
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-5 sm:grid-cols-2"
              >
                {(semesters as Semester[]).map((sem, idx) => {
                  const colors = semesterColors[idx % semesterColors.length];
                  return (
                    <motion.div key={sem._id} variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to={`/branch/${branchId}/year/${yearId}/semester/${sem._id}`}
                        className={`group relative flex items-center gap-5 overflow-hidden rounded-2xl border bg-card p-7 transition-all duration-300 hover:shadow-lg ${colors.border}`}
                      >
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${colors.icon}`}>
                          <BookOpen className="h-7 w-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-xl font-bold">{sem.name}</h3>
                          {sem.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 truncate">{sem.description}</p>
                          )}
                        </div>
                        <ArrowRight className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-2 ${colors.accent}`} />
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

export default BranchYearPage;
