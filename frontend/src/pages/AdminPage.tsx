import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Download, Search, Loader2, KeyRound, GitBranch, Plus, Pencil, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Resource, Branch } from '@/lib/api.ts';

const AdminPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Branch form state
  const [branchForm, setBranchForm] = useState({ name: '', code: '', description: '', icon: '📚', order: '' });
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Fetch all branches
  const { data: branches = [], refetch: refetchBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: api.getBranches,
  });

  // Fetch all resources (admin)
  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-resources', adminKey, branchFilter],
    queryFn: () => api.adminListAll(adminKey, branchFilter ? { branchId: branchFilter } : {}),
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

  const createBranchMutation = useMutation({
    mutationFn: (data: typeof branchForm) =>
      api.adminCreateBranch({ ...data, order: Number(data.order) || 0 }, adminKey),
    onSuccess: () => {
      toast({ title: 'Branch created!', description: 'New branch added successfully.' });
      setBranchForm({ name: '', code: '', description: '', icon: '📚', order: '' });
      refetchBranches();
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (err) => {
      toast({ title: 'Failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Branch> }) =>
      api.adminUpdateBranch(id, data, adminKey),
    onSuccess: () => {
      toast({ title: 'Branch updated!' });
      setEditingBranch(null);
      refetchBranches();
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: (id: string) => api.adminDeleteBranch(id, adminKey),
    onSuccess: () => {
      toast({ title: 'Branch deleted' });
      refetchBranches();
      queryClient.invalidateQueries({ queryKey: ['branches'] });
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
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </div>
        </div>
        <div className="container mx-auto max-w-md px-4 py-16">
          <div className="rounded-2xl border bg-card p-8 card-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-6 w-6" />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-500/10 text-green-600 px-3 py-1 rounded-full font-medium">
            ✓ Authenticated
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold">Admin Panel</h1>
          <p className="mt-1 text-muted-foreground">Manage branches, resources, and platform settings</p>
        </div>

        <Tabs defaultValue="resources">
          <TabsList className="mb-6">
            <TabsTrigger value="resources" className="gap-2">
              <BookOpen className="h-4 w-4" /> Resources
            </TabsTrigger>
            <TabsTrigger value="branches" className="gap-2">
              <GitBranch className="h-4 w-4" /> Branch Management
            </TabsTrigger>
          </TabsList>

          {/* ─── RESOURCES TAB ────────────────────────────────────────────── */}
          <TabsContent value="resources">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">All Branches</option>
                {(branches as Branch[]).map((b) => (
                  <option key={b._id} value={b._id}>{b.icon} {b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            {isLoading && (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
                <p className="font-medium text-destructive">Failed to load resources. Check your admin key and ensure the backend is running.</p>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="overflow-x-auto rounded-xl border bg-card card-shadow">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left font-semibold">Title</th>
                      <th className="p-4 text-left font-semibold">Branch</th>
                      <th className="p-4 text-left font-semibold">Subject</th>
                      <th className="p-4 text-left font-semibold">Type</th>
                      <th className="p-4 text-left font-semibold">Year / Sem</th>
                      <th className="p-4 text-right font-semibold">Downloads</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item: Resource) => {
                      const subjName   = typeof item.subjectId === 'object' ? item.subjectId.name : '-';
                      const yearName   = typeof item.yearId === 'object' ? item.yearId.name : '-';
                      const semName    = typeof item.semesterId === 'object' ? item.semesterId.name : '-';
                      const branchData = typeof item.branchId === 'object' ? item.branchId : null;

                      return (
                        <tr key={item._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium max-w-[200px] truncate">{item.title}</td>
                          <td className="p-4">
                            {branchData ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {branchData.icon} {branchData.code}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="p-4 text-muted-foreground max-w-[150px] truncate">{subjName}</td>
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
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No materials found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* ─── BRANCHES TAB ─────────────────────────────────────────────── */}
          <TabsContent value="branches">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Create / Edit Form */}
              <div className="rounded-xl border bg-card p-6 card-shadow">
                <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  {editingBranch ? <><Pencil className="h-4 w-4" /> Edit Branch</> : <><Plus className="h-4 w-4" /> Create New Branch</>}
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingBranch) {
                      updateBranchMutation.mutate({ id: editingBranch._id, data: { ...branchForm, order: Number(branchForm.order) || 0 } });
                    } else {
                      createBranchMutation.mutate(branchForm);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">Branch Name *</label>
                      <Input
                        placeholder="e.g. Computer Engineering"
                        value={branchForm.name}
                        onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">Code *</label>
                      <Input
                        placeholder="e.g. CE"
                        value={branchForm.code}
                        onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Description</label>
                    <Input
                      placeholder="Short description of the branch"
                      value={branchForm.description}
                      onChange={(e) => setBranchForm({ ...branchForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">Icon (emoji)</label>
                      <Input
                        placeholder="e.g. 💻"
                        value={branchForm.icon}
                        onChange={(e) => setBranchForm({ ...branchForm, icon: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">Display Order</label>
                      <Input
                        type="number"
                        placeholder="e.g. 1"
                        value={branchForm.order}
                        onChange={(e) => setBranchForm({ ...branchForm, order: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={createBranchMutation.isPending || updateBranchMutation.isPending}>
                      {(createBranchMutation.isPending || updateBranchMutation.isPending) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : editingBranch ? (
                        <Pencil className="mr-2 h-4 w-4" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      {editingBranch ? 'Update Branch' : 'Create Branch'}
                    </Button>
                    {editingBranch && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => { setEditingBranch(null); setBranchForm({ name: '', code: '', description: '', icon: '📚', order: '' }); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              {/* Branches List */}
              <div className="rounded-xl border bg-card p-6 card-shadow">
                <h2 className="font-display text-lg font-bold mb-4">All Branches ({(branches as Branch[]).length})</h2>
                <div className="space-y-3">
                  {(branches as Branch[]).map((b) => (
                    <div key={b._id} className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-2xl">{b.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{b.name}</span>
                          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold">{b.code}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{b.description}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingBranch(b);
                            setBranchForm({ name: b.name, code: b.code, description: b.description, icon: b.icon, order: String(b.order) });
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteBranchMutation.mutate(b._id)}
                          disabled={deleteBranchMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(branches as Branch[]).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-6">No branches found. Create one above.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
