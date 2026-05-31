import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, FilePen, FileVideo, Eye, Loader2, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Resource, Branch } from '@/lib/api.ts';

const iconMap = { note: FileText, paper: FilePen, video: FileVideo };

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [branchFilter, setBranchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: api.getBranches,
  });

  const { data: results = [], isLoading, isError } = useQuery({
    queryKey: ['search', q, branchFilter, typeFilter],
    queryFn: () => api.search(q, {
      branch: branchFilter || undefined,
      type: typeFilter || undefined,
    }),
    enabled: q.trim().length > 0 || !!branchFilter || !!typeFilter,
  });

  const handleDownload = async (resource: Resource) => {
    try {
      const result = await api.trackDownload(resource._id);
      window.open(result.fileUrl, '_blank');
    } catch {
      window.open(resource.fileUrl, '_blank');
    }
  };

  const activeFilterCount = [branchFilter, typeFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold">Search Results</h1>
            <p className="mt-1 text-muted-foreground">
              {isLoading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} ${q ? `for "${q}"` : ''}`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 rounded-xl border bg-card p-5 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">Branch</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">All Branches</option>
                {(branches as Branch[]).map((b) => (
                  <option key={b._id} value={b._id}>{b.icon} {b.name} ({b.code})</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">Resource Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="note">📝 Notes</option>
                <option value="paper">📄 Previous Year Papers</option>
                <option value="video">🎬 Videos</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={() => { setBranchFilter(''); setTypeFilter(''); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
            <p className="font-medium text-destructive">Search failed. Make sure the backend is running.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {results.map((item) => {
              const Icon = iconMap[item.type];
              const branchData = typeof item.branchId === 'object' ? item.branchId : null;
              const yearName   = typeof item.yearId === 'object' ? item.yearId.name : '';
              const semName    = typeof item.semesterId === 'object' ? item.semesterId.name : '';
              const subjName   = typeof item.subjectId === 'object' ? item.subjectId.name : '';

              return (
                <div key={item._id} className="animate-fade-in flex flex-col gap-3 rounded-xl border bg-card p-5 card-shadow sm:flex-row sm:items-center sm:justify-between hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-card-foreground">{item.title}</h4>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                        {branchData && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {branchData.icon} {branchData.code}
                          </span>
                        )}
                        {subjName && <span>{subjName}</span>}
                        {yearName && <span className="text-muted-foreground/60">·</span>}
                        {yearName && <span>{yearName}</span>}
                        {semName && <span className="text-muted-foreground/60">·</span>}
                        {semName && <span>{semName}</span>}
                      </div>
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
            {!isLoading && results.length === 0 && (
              <div className="rounded-xl border border-dashed bg-muted/40 p-12 text-center">
                <p className="font-medium text-muted-foreground">No results found {q ? `for "${q}"` : 'with these filters'}</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Try different keywords or adjust your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
