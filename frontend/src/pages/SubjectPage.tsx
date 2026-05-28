import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, FileVideo, FilePen, Eye, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api, Resource } from '@/lib/api.ts';

const typeConfig = {
  note: { icon: FileText, label: 'Notes', color: 'bg-blue-100 text-blue-700' },
  paper: { icon: FilePen, label: 'Previous Year Papers', color: 'bg-amber-100 text-amber-700' },
  video: { icon: FileVideo, label: 'Video Lectures', color: 'bg-emerald-100 text-emerald-700' },
} as const;

const SubjectPage = () => {
  const { yearId, semesterId, subjectName: subjectId } = useParams<{
    yearId: string;
    semesterId: string;
    subjectName: string; // actually subjectId now
  }>();

  // Fetch year name for breadcrumb
  const { data: years = [] } = useQuery({
    queryKey: ['years'],
    queryFn: api.getYears,
  });
  const year = years.find((y) => y._id === yearId);
  const isSkillCategory = year && year.order >= 5;

  // Fetch subject name
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', semesterId],
    queryFn: () => api.getSubjects(semesterId!),
    enabled: !!semesterId,
  });
  const subject = subjects.find((s) => s._id === subjectId);

  // Fetch resources for this subject
  const { data: resources = [], isLoading, isError } = useQuery({
    queryKey: ['resources', subjectId],
    queryFn: () => api.getResources(subjectId!),
    enabled: !!subjectId,
  });

  const notes = resources.filter((m) => m.type === 'note');
  const papers = resources.filter((m) => m.type === 'paper');
  const videos = resources.filter((m) => m.type === 'video');

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          to={`/year/${yearId}/semester/${semesterId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {isSkillCategory ? 'Topic' : 'Semester'}
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4">
        <h1 className="font-display text-3xl font-bold">{subject?.name ?? 'Loading...'}</h1>
        <p className="mt-1 text-muted-foreground">
          {year?.name ?? ''} • {resources.length} resources
        </p>
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
  );
};

const containerAnim = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const itemAnim = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
};

function MaterialList({ items, type }: { items: Resource[]; type: 'note' | 'paper' | 'video' }) {
  const config = typeConfig[type];
  const navigate = useNavigate();

  const handleDownload = async (resource: Resource) => {
    try {
      const result = await api.trackDownload(resource._id);
      // Open the file URL for download
      window.open(result.fileUrl, '_blank');
    } catch {
      // Fallback: open fileUrl directly
      window.open(resource.fileUrl, '_blank');
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-6 rounded-xl border border-dashed bg-muted/40 p-12 text-center"
      >
        <config.icon className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium text-muted-foreground">No {config.label.toLowerCase()} available yet</p>
        <p className="mt-1 text-sm text-muted-foreground/70">Be the first to upload!</p>
      </motion.div>
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
