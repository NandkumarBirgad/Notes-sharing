import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, FileText } from 'lucide-react';
import { api, Resource } from '@/lib/api.ts';

const ViewPage = () => {
  const { resourceId } = useParams<{ resourceId: string }>();

  const [resource, setResource] = useState<Resource | null>(null);
  const [loadingResource, setLoadingResource] = useState(true);

  useEffect(() => {
    const fetchTargetResource = async () => {
      if (!resourceId) return;

      try {
        setLoadingResource(true);
        const data = await api.getSingleResource(resourceId);

        if (data) {
          setResource(data);
        }
      } catch (err) {
        console.error('Error fetching resource details:', err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingResource(false);
      }
    };

    fetchTargetResource();
  }, [resourceId]);

  if (loadingResource) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Loading document...
        </p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive/80 mb-4" />

        <h1 className="font-display text-2xl font-bold text-destructive">
          Study Material Not Found
        </h1>

        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          This file might have been deleted or the backend server is unavailable.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl min-h-[90vh]">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit Study Room
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-md tracking-wider">
            {resource.fileType || 'PDF'}
          </span>

          <span className="text-xs text-muted-foreground font-medium">
            Downloads: {resource.downloads}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {resource.title}
        </h1>

        {resource.description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {resource.description}
          </p>
        )}
      </div>

      {/* Full Width Document Viewer */}
      <div className="w-full flex flex-col h-[85vh] rounded-2xl border bg-card/60 backdrop-blur-md shadow-md overflow-hidden">

        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-violet-500" />
            Document Viewer
          </span>

          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Open Original
          </a>
        </div>

        <div className="flex-1 w-full h-full bg-slate-900/10">

          {resource.type === 'video' ? (
            <video
              src={resource.fileUrl}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <iframe
              src={
                resource.fileUrl.includes('localhost')
                  ? resource.fileUrl
                  : `https://docs.google.com/viewer?url=${encodeURIComponent(
                      resource.fileUrl
                    )}&embedded=true`
              }
              title={resource.title}
              className="w-full h-full border-none"
              loading="lazy"
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default ViewPage;