import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, FilePen, FileVideo, Eye, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api, Resource } from '@/lib/api.ts';

const iconMap = { note: FileText, paper: FilePen, video: FileVideo };

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const { data: results = [], isLoading, isError } = useQuery({
    queryKey: ['search', q],
    queryFn: () => api.search(q),
    enabled: q.trim().length > 0,
  });

  const handleDownload = async (resource: Resource) => {
    try {
      const result = await api.trackDownload(resource._id);
      window.open(result.fileUrl, '_blank');
    } catch {
      window.open(resource.fileUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Search Results</h1>
      <p className="mt-1 text-muted-foreground">
        {isLoading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`}
      </p>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="font-medium text-destructive">Search failed. Make sure the backend is running.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mt-6 space-y-3">
          {results.map((item) => {
            const Icon = iconMap[item.type];
            const yearName = typeof item.yearId === 'object' ? item.yearId.name : '';
            const semName = typeof item.semesterId === 'object' ? item.semesterId.name : '';
            const subjName = typeof item.subjectId === 'object' ? item.subjectId.name : '';

            return (
              <div key={item._id} className="animate-fade-in flex flex-col gap-3 rounded-xl border bg-card p-5 card-shadow sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-card-foreground">{item.title}</h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {subjName}{yearName ? ` • ${yearName}` : ''}{semName ? ` • ${semName}` : ''}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">{item.type}</Badge>
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
                    onClick={() => window.open(item.previewUrl || item.fileUrl, '_blank')}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button size="sm" onClick={() => handleDownload(item)}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </div>
            );
          })}
          {!isLoading && results.length === 0 && q.trim().length > 0 && (
            <div className="rounded-xl border border-dashed bg-muted/40 p-12 text-center">
              <p className="font-medium text-muted-foreground">No results found for "{q}"</p>
              <p className="mt-1 text-sm text-muted-foreground/70">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
