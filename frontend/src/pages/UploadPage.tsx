import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api.ts';

const UploadPage = () => {
  const { toast } = useToast();
  const [branchId, setBranchId] = useState('');
  const [yearId, setYearId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [fileType, setFileType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: api.getBranches,
  });

  // Fetch years for selected branch
  const { data: years = [] } = useQuery({
    queryKey: ['years', branchId],
    queryFn: () => api.getYears(branchId),
    enabled: !!branchId,
  });

  // Fetch semesters for selected year
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', yearId],
    queryFn: () => api.getSemesters(yearId),
    enabled: !!yearId,
  });

  // Fetch subjects for selected semester
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', semesterId],
    queryFn: () => api.getSubjects(semesterId),
    enabled: !!semesterId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) { toast({ title: 'Error', description: 'Please select a file.', variant: 'destructive' }); return; }
    if (!branchId) { toast({ title: 'Error', description: 'Please select a Branch.', variant: 'destructive' }); return; }
    if (!yearId) { toast({ title: 'Error', description: 'Please select an Academic Year.', variant: 'destructive' }); return; }
    if (!semesterId) { toast({ title: 'Error', description: 'Please select a Semester.', variant: 'destructive' }); return; }
    if (!subjectId) { toast({ title: 'Error', description: 'Please select a Subject.', variant: 'destructive' }); return; }
    if (!fileType) { toast({ title: 'Error', description: 'Please select a File Type.', variant: 'destructive' }); return; }
    if (!adminKey) { toast({ title: 'Error', description: 'Admin API key is required.', variant: 'destructive' }); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', fileType);
      formData.append('yearId', yearId);
      formData.append('semesterId', semesterId);
      formData.append('subjectId', subjectId);
      formData.append('file', file);

      await api.adminUpload(formData, adminKey);
      toast({ title: 'Upload successful!', description: 'Your material has been uploaded.' });

      // Reset form (keep branch/year/semester selected for convenience)
      setTitle('');
      setDescription('');
      setFile(null);
      setFileType('');
      setSubjectId('');
    } catch (err) {
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

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

      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border bg-card p-8 card-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Upload Material</h1>
              <p className="text-sm text-muted-foreground">Share study resources with fellow students</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Admin Key */}
            <div>
              <Label className="text-sm font-semibold">Admin API Key</Label>
              <Input
                type="password"
                placeholder="Enter your admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

            {/* Title */}
            <div>
              <Label className="text-sm font-semibold">Title</Label>
              <Input
                placeholder="e.g. Linear Algebra Complete Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea
                placeholder="Brief description of the material..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5"
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs text-muted-foreground uppercase tracking-widest">
                <span className="bg-card px-3">Academic Classification</span>
              </div>
            </div>

            {/* Branch + Year */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold">
                  Branch <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={branchId}
                  onValueChange={(v) => { setBranchId(v); setYearId(''); setSemesterId(''); setSubjectId(''); }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.icon} {b.name} ({b.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">
                  Year <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={yearId}
                  onValueChange={(v) => { setYearId(v); setSemesterId(''); setSubjectId(''); }}
                  disabled={!branchId}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={branchId ? 'Select year' : 'Select branch first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y._id} value={y._id}>{y.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Semester + Subject */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold">
                  Semester <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={semesterId}
                  onValueChange={(v) => { setSemesterId(v); setSubjectId(''); }}
                  disabled={!yearId}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={yearId ? 'Select semester' : 'Select year first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((s) => (
                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={subjectId}
                  onValueChange={setSubjectId}
                  disabled={!semesterId}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={semesterId ? 'Select subject' : 'Select semester first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Type */}
            <div>
              <Label className="text-sm font-semibold">
                Resource Type <span className="text-destructive">*</span>
              </Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">📝 Note (PDF/DOC/PPT)</SelectItem>
                  <SelectItem value="paper">📄 Previous Year Paper</SelectItem>
                  <SelectItem value="video">🎬 Video Lecture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File */}
            <div>
              <Label className="text-sm font-semibold">
                File <span className="text-destructive">*</span>
              </Label>
              <Input
                type="file"
                className="mt-1.5"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
              {file && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={uploading}>
              {uploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Upload Material</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
