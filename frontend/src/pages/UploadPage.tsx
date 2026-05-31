import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
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
  const [yearId, setYearId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [fileType, setFileType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch years
  const { data: years = [] } = useQuery({
    queryKey: ['years'],
    queryFn: api.getYears,
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

    if (!file) {
      toast({ title: 'Error', description: 'Please select a file.', variant: 'destructive' });
      return;
    }
    if (!yearId) {
      toast({ title: 'Error', description: 'Please select an Academic Year.', variant: 'destructive' });
      return;
    }
    if (!semesterId) {
      toast({ title: 'Error', description: 'Please select a Semester or Topic.', variant: 'destructive' });
      return;
    }
    if (!subjectId) {
      toast({ title: 'Error', description: 'Please select a Subject.', variant: 'destructive' });
      return;
    }
    if (!fileType) {
      toast({ title: 'Error', description: 'Please select a File Type.', variant: 'destructive' });
      return;
    }
    if (!adminKey) {
      toast({ title: 'Error', description: 'Admin API key is required.', variant: 'destructive' });
      return;
    }

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

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setFileType('');
    } catch (err) {
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="mt-6 rounded-xl border bg-card p-8 card-shadow">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Upload Material</h1>
            <p className="text-sm text-muted-foreground">Share study resources with fellow students</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <Label>Admin API Key</Label>
            <Input
              type="password"
              placeholder="Enter your admin key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label>Title</Label>
            <Input
              placeholder="e.g. Linear Algebra Complete Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Brief description of the material..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Year</Label>
              <Select value={yearId} onValueChange={(v) => { setYearId(v); setSemesterId(''); setSubjectId(''); }}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => <SelectItem key={y._id} value={y._id}>{y.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Semester</Label>
              <Select value={semesterId} onValueChange={(v) => { setSemesterId(v); setSubjectId(''); }} disabled={!yearId}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select semester" /></SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={!semesterId}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>File Type</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note (PDF/DOC/PPT)</SelectItem>
                  <SelectItem value="paper">Previous Year Paper</SelectItem>
                  <SelectItem value="video">Video Lecture</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>File</Label>
            <Input
              type="file"
              className="mt-1.5"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
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
  );
};

export default UploadPage;
