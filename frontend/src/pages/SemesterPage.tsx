import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookMarked, Loader2, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api, Branch, Subject, Year, Semester } from '@/lib/api.ts';
import Breadcrumb from '@/components/Breadcrumb';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
};

const SemesterPage = () => {
  const { branchId, yearId, semesterId } = useParams<{
    branchId?: string;
    yearId?: string;
    semesterId: string;
  }>();

  // Fetch branch
  const { data: branch } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => api.getBranch(branchId!),
    enabled: !!branchId,
  });

  // Fetch year
  const { data: year } = useQuery({
    queryKey: ['year', yearId],
    queryFn: () => api.getYear(yearId!),
    enabled: !!yearId,
  });

  // Fetch semesters to get current semester name
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', yearId],
    queryFn: () => api.getSemesters(yearId!),
    enabled: !!yearId,
  });
  const semester = (semesters as Semester[]).find((s) => s._id === semesterId);

  // Fetch subjects
  const { data: subjects = [], isLoading, isError } = useQuery({
    queryKey: ['subjects', semesterId],
    queryFn: () => api.getSubjects(semesterId!),
    enabled: !!semesterId,
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
              ...(branchId ? [{ label: branchObj?.name ?? 'Branch', href: `/branch/${branchId}` }] : []),
              ...(yearId && branchId ? [{ label: yearObj?.name ?? 'Year', href: `/branch/${branchId}/year/${yearId}` }] : []),
              { label: semester?.name ?? 'Semester' },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Page heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            {branchObj?.icon && <span className="text-2xl">{branchObj.icon}</span>}
            <div>
              {branchObj && (
                <p className="text-sm text-muted-foreground font-medium">
                  {branchObj.name} › {yearObj?.name}
                </p>
              )}
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {semester?.name ?? 'Loading...'}
              </h1>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground ml-10">
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''} available
          </p>
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
          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(subjects as Subject[]).map((subj) => {
              const subjectUrl = branchId && yearId && semesterId
                ? `/branch/${branchId}/year/${yearId}/semester/${semesterId}/subject/${subj._id}`
                : `/subject/${subj._id}`;
              return (
                <motion.div key={subj._id} variants={item} whileHover={{ x: 4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={subjectUrl}
                    className="group flex items-center gap-4 rounded-xl border bg-card p-5 card-shadow transition-all duration-300 hover:card-shadow-hover hover:border-primary/40"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                      <BookMarked className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-card-foreground truncate">{subj.name}</h3>
                      {subj.code && <p className="text-xs text-muted-foreground">{subj.code}</p>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent shrink-0" />
                  </Link>
                </motion.div>
              );
            })}

            {subjects.length === 0 && (
              <div className="col-span-3 rounded-xl border border-dashed bg-muted/40 p-12 text-center">
                <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="font-medium text-muted-foreground">No subjects found.</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Add subjects via the admin API.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SemesterPage;
