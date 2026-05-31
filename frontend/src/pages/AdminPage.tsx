import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Download, Search, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Resource } from '@/lib/api.ts';

const AdminPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all resources (admin)
  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-resources', adminKey],
    queryFn: () => api.adminListAll(adminKey),
    enabled: authenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.adminDelete(id, adminKey),
    onSuccess: () => {
      toast({ title: 'Deleted', description: 'Material removed successfully.' });
      refetch();
    },
    onError: (err) => {
      toast({ title: 'Delete failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    },
  });

  const filtered = items.filter((i: Resource) =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    (typeof i.subjectId === 'object' ? i.subjectId.name : '').toLowerCase().includes(search.toLowerCase())
  );

  const typeColor = { note: 'default', paper: 'secondary', video: 'outline' } as const;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      toast({ title: 'Error', description: 'Please enter admin key.', variant: 'destructive' });
      return;
    }
    setAuthenticated(true);
  };

  if (!authenticated) {
    return (
      <div className="container mx-auto max-w-md px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="mt-6 rounded-xl border bg-card p-8 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Login</h1>
              <p className="text-sm text-muted-foreground">Enter your admin API key to continue</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Admin API Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              <KeyRound className="mr-2 h-4 w-4" /> Authenticate
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold">Admin Panel</h1>
      <p className="mt-1 text-muted-foreground">Manage all uploaded study materials</p>

      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="font-medium text-destructive">Failed to load resources. Check your admin key and ensure the backend is running.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mt-6 overflow-x-auto rounded-xl border bg-card card-shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-semibold">Title</th>
                <th className="p-4 text-left font-semibold">Subject</th>
                <th className="p-4 text-left font-semibold">Type</th>
                <th className="p-4 text-left font-semibold">Year / Sem</th>
                <th className="p-4 text-right font-semibold">Downloads</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: Resource) => {
                const subjName = typeof item.subjectId === 'object' ? item.subjectId.name : '-';
                const yearName = typeof item.yearId === 'object' ? item.yearId.name : '-';
                const semName = typeof item.semesterId === 'object' ? item.semesterId.name : '-';

                return (
                  <tr key={item._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{item.title}</td>
                    <td className="p-4 text-muted-foreground">{subjName}</td>
                    <td className="p-4">
                      <Badge variant={typeColor[item.type]}>{item.type}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{yearName} / {semName}</td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" />{item.downloads}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item._id)}
                        className="text-destructive hover:text-destructive"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No materials found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
