import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, FileVideo, FilePen, Eye, Loader2, FolderOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api, Resource, Branch, Year, Semester, Subject } from '@/lib/api.ts';
import Breadcrumb from '@/components/Breadcrumb';

const typeConfig = {
  note:  { icon: FileText,  label: 'Notes',               color: 'bg-blue-100 text-blue-700' },
  paper: { icon: FilePen,   label: 'Previous Year Papers', color: 'bg-amber-100 text-amber-700' },
  video: { icon: FileVideo, label: 'Video Lectures',       color: 'bg-emerald-100 text-emerald-700' },
} as const;

const SubjectPage = () => {
  const { branchId, yearId, semesterId, subjectId: subjectIdParam } = useParams<{
    branchId?: string;
    yearId?: string;
    semesterId?: string;
    subjectId?: string;
  }>();

  // subjectId might come from /subject/:subjectId or nested route
  const subjectId = subjectIdParam;

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

  // Fetch subjects in this semester to find subject name
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', semesterId],
    queryFn: () => api.getSubjects(semesterId!),
    enabled: !!semesterId,
  });
  const subject = (subjects as Subject[]).find((s) => s._id === subjectId);

  // Fetch resources for this subject
  const { data: resources = [], isLoading, isError } = useQuery({
    queryKey: ['resources', subjectId],
    queryFn: () => api.getResources(subjectId!),
    enabled: !!subjectId,
  });

  const notes  = resources.filter((m) => m.type === 'note');
  const papers = resources.filter((m) => m.type === 'paper');
  const videos = resources.filter((m) => m.type === 'video');

  const branchObj   = branch as Branch | undefined;
  const yearObj     = year as Year | undefined;
  const semesterObj = semester;

  // Build back link
  const backUrl = branchId && yearId && semesterId
    ? `/branch/${branchId}/year/${yearId}/semester/${semesterId}`
    : '/';
  const backLabel = semesterObj?.name ?? 'Semester';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              ...(branchId ? [{ label: branchObj?.name ?? 'Branch', href: `/branch/${branchId}` }] : []),
              ...(yearId && branchId ? [{ label: yearObj?.name ?? 'Year', href: `/branch/${branchId}/year/${yearId}` }] : []),
              ...(semesterId && branchId && yearId ? [{ label: semesterObj?.name ?? 'Semester', href: `/branch/${branchId}/year/${yearId}/semester/${semesterId}` }] : []),
              { label: subject?.name ?? 'Subject' },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {backLabel}
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex items-center gap-3">
            {branchObj?.icon && <span className="text-2xl">{branchObj.icon}</span>}
            <div>
              {branchObj && (
                <p className="text-sm text-muted-foreground font-medium">
                  {branchObj.name} › {yearObj?.name} › {semesterObj?.name}
                </p>
              )}
              <h1 className="font-display text-3xl font-bold">{subject?.name ?? 'Loading...'}</h1>
            </div>
          </div>
          {subject?.code && (
            <p className="mt-1 text-sm text-muted-foreground ml-10">Subject Code: <span className="font-mono font-semibold">{subject.code}</span></p>
          )}
          <p className="mt-1 text-sm text-muted-foreground ml-10">{resources.length} resource{resources.length !== 1 ? 's' : ''} available</p>
        </motion.div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="mt-8 rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
            <p className="font-medium text-destructive">Failed to load resources.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Tabs defaultValue="notes" className="mt-8">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="notes" className="gap-1.5">
                  <FileText className="h-4 w-4" /> Notes ({notes.length})
                </TabsTrigger>
                <TabsTrigger value="papers" className="gap-1.5">
                  <FilePen className="h-4 w-4" /> Papers ({papers.length})
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-1.5">
                  <FileVideo className="h-4 w-4" /> Videos ({videos.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes">
                <MaterialList items={notes} type="note" />
              </TabsContent>
              <TabsContent value="papers">
                <MaterialList items={papers} type="paper" />
              </TabsContent>
              <TabsContent value="videos">
                <MaterialList items={videos} type="video" />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
};

function MaterialList({ items, type }: { items: Resource[]; type: 'note' | 'paper' | 'video' }) {
  const config = typeConfig[type];
  const navigate = useNavigate();

  const handleDownload = async (resource: Resource) => {
    try {
      const result = await api.trackDownload(resource._id);
      window.open(result.fileUrl, '_blank');
    } catch {
      window.open(resource.fileUrl, '_blank');
    }
  };

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed bg-muted/40 p-12 text-center">
        <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="font-medium text-muted-foreground">No {config.label.toLowerCase()} available yet</p>
        <p className="mt-1 text-sm text-muted-foreground/70">Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <div
          key={item._id}
          className="animate-fade-in flex flex-col gap-3 rounded-xl border bg-card p-5 card-shadow transition-all duration-300 hover:translate-x-1 hover:card-shadow-hover sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
              <config.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-card-foreground">{item.title}</h4>
              {item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
              <div className="mt-2 flex items-center gap-2">
                {item.fileType && <Badge variant="secondary" className="text-xs uppercase">{item.fileType}</Badge>}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Download className="h-3 w-3" /> {item.downloads}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="transition-transform duration-200 hover:scale-105"
              onClick={() => navigate(`/view/${item._id}`)}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
            </Button>
            <Button
              size="sm"
              className="transition-transform duration-200 hover:scale-105"
              onClick={() => handleDownload(item)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SubjectPage;
