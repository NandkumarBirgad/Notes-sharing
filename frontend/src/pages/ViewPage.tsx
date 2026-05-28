import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Send, Loader2, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { api, Resource } from '@/lib/api.ts';

const ViewPage = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('summary');
  const [summarizing, setSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  
  // Chat States
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model'; content: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all resources to find this one (quick fallback since we don't have a single-resource GET endpoint)
  const { data: years = [] } = useQuery({
    queryKey: ['years'],
    queryFn: api.getYears,
  });

  const [resource, setResource] = useState<Resource | null>(null);
  const [loadingResource, setLoadingResource] = useState(true);

  // Fetch resource details directly by ID
  useEffect(() => {
    const fetchTargetResource = async () => {
      if (!resourceId) return;
      try {
        setLoadingResource(true);
        const data = await api.getSingleResource(resourceId);
        if (data) {
          setResource(data);
          if (data.aiSummary) setAiSummary(data.aiSummary);
        }
      } catch (err: any) {
        console.error('Error fetching resource details:', err.message);
      } finally {
        setLoadingResource(false);
      }
    };

    fetchTargetResource();
  }, [resourceId]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  // Call Summarize API
  const handleSummarize = async () => {
    if (!resourceId) return;
    setSummarizing(true);
    try {
      const data = await api.summarize(resourceId);
      setAiSummary(data.aiSummary);
      toast({
        title: 'Summary Ready! ✨',
        description: 'Gemini has successfully summarized your document.',
      });
    } catch (err: any) {
      toast({
        title: 'AI Summary Failed',
        description: err.message || 'Could not connect to Gemini AI.',
        variant: 'destructive',
      });
    } finally {
      setSummarizing(false);
    }
  };

  // Call Chat API
  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !resourceId || chatLoading) return;

    const userMsg = { role: 'user' as const, content: question };
    setChatHistory(prev => [...prev, userMsg]);
    setQuestion('');
    setChatLoading(true);

    try {
      const data = await api.chat(resourceId, userMsg.content, chatHistory);
      setChatHistory(prev => [...prev, { role: 'model' as const, content: data.answer }]);
    } catch (err: any) {
      toast({
        title: 'AI Assistant Error',
        description: err.message || 'Could not generate answer.',
        variant: 'destructive',
      });
    } finally {
      setChatLoading(false);
    }
  };

  // Custom Markdown Formatter for beautiful rendering
  const renderSummaryText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h4 key={index} className="text-md font-bold mt-5 mb-2 text-violet-600 font-display flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-violet-500" /> {line.substring(4)}</h4>;
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        const cleanText = line.startsWith('## ') ? line.substring(3) : line.substring(2);
        return <h3 key={index} className="text-lg font-extrabold mt-7 mb-3 text-primary border-b border-border/80 pb-1.5 font-display tracking-tight">{cleanText}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="ml-5 list-disc text-sm text-muted-foreground my-1.5 leading-relaxed">{line.substring(2)}</li>;
      }
      
      // Inline Bold formatting (**text**)
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="text-sm my-2 leading-relaxed text-muted-foreground">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part)}
          </p>
        );
      }
      
      return line.trim() ? <p key={index} className="text-sm my-2 leading-relaxed text-muted-foreground">{line}</p> : <div key={index} className="h-2" />;
    });
  };

  if (loadingResource) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Entering study room...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive/80 mb-4" />
        <h1 className="font-display text-2xl font-bold text-destructive">Study Material Not Found</h1>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">This file might have been deleted or the backend server is resting.</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl min-h-[90vh]">
      {/* 1. Header Breadcrumbs */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Exit Study Room
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-md tracking-wider">{resource.fileType || 'PDF'}</span>
          <span className="text-xs text-muted-foreground font-medium">Downloads: {resource.downloads}</span>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{resource.title}</h1>
        {resource.description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{resource.description}</p>}
      </div>

      {/* 2. Main Workspace Split-Screen */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Side: Native PDF Document Viewer */}
        <div className="lg:col-span-7 flex flex-col h-[75vh] rounded-2xl border bg-card/60 backdrop-blur-md shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-violet-500" /> Interactive Document Reader
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
                src={resource.fileUrl}
                title={resource.title}
                className="w-full h-full border-none"
                loading="lazy"
              />
            )}
          </div>
        </div>

        {/* Right Side: Gemini AI Assistant Panel */}
        <div className="lg:col-span-5 flex flex-col h-[75vh] rounded-2xl border bg-card shadow-md overflow-hidden relative">
          
          {/* Glassmorphic Glowing Background element for AI panel */}
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

          {/* AI Header tabs */}
          <div className="border-b px-4 py-1.5 bg-muted/20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-transparent p-0 gap-4">
                <TabsTrigger 
                  value="summary" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 py-3 text-sm font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-violet-500" /> Professor Gemini
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  disabled={!aiSummary}
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 py-3 text-sm font-semibold flex items-center gap-1.5"
                >
                  Chat with PDF
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab contents */}
          <div className="flex-1 overflow-y-auto p-5">
            
            {/* Tab: Summary */}
            {activeTab === 'summary' && (
              <div className="h-full flex flex-col justify-between">
                {aiSummary ? (
                  <div className="space-y-4 animate-fade-in pr-1">
                    <div className="flex items-center justify-between bg-violet-500/5 border border-violet-100 rounded-xl p-3 mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-violet-600" />
                        <span className="text-xs font-bold text-violet-700">Cached Study Guide Ready</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSummarize} 
                        disabled={summarizing} 
                        className="h-8 text-xs font-semibold text-violet-600 hover:bg-violet-100/50"
                      >
                        {summarizing ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />} Re-generate
                      </Button>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      {renderSummaryText(aiSummary)}
                    </div>
                  </div>
                ) : (
                  <div className="my-auto flex flex-col items-center justify-center text-center p-6">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 border border-violet-200 text-violet-600">
                        <Sparkles className="h-10 w-10 animate-pulse" />
                      </div>
                    </div>
                    
                    <h3 className="font-display text-xl font-bold mb-2">Study Guide Generator</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                      Let Professor Gemini analyze this study material and build a comprehensive study guide, equations list, and practice questions for you!
                    </p>

                    <Button 
                      onClick={handleSummarize} 
                      disabled={summarizing}
                      size="lg"
                      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 font-bold text-white shadow-md transition-all hover:scale-[1.03] active:scale-[0.98]"
                    >
                      {summarizing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Professor is reading...</>
                      ) : (
                        <><Sparkles className="mr-2 h-4 w-4" /> Summarize with Gemini AI</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Chat with PDF */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col justify-between">
                
                {/* Chat Message List */}
                <div className="flex-grow space-y-4 pr-1 mb-4 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 py-12 my-auto">
                      <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-3 border border-violet-100">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <p className="font-display font-bold text-base mb-1">Elite AI Academic Tutor</p>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        Ask any questions about this PDF! E.g. "Explain the algorithm on page 3" or "Give me a practical example of this concept".
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role !== 'user' && (
                          <div className="h-8 w-8 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-600 shrink-0 font-bold text-sm">
                            🎓
                          </div>
                        )}
                        <div 
                          className={`rounded-xl px-4 py-2.5 max-w-[82%] text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                              : 'bg-muted border text-foreground rounded-tl-none prose prose-sm max-w-none'
                          }`}
                        >
                          {msg.role === 'user' ? msg.content : renderSummaryText(msg.content)}
                        </div>
                        {msg.role === 'user' && (
                          <div className="h-8 w-8 rounded-lg bg-slate-100 border flex items-center justify-center text-slate-600 shrink-0 font-bold text-xs">
                            👤
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {chatLoading && (
                    <div className="flex items-start gap-2.5 justify-start">
                      <div className="h-8 w-8 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-600 shrink-0 font-bold text-sm">
                        🎓
                      </div>
                      <div className="rounded-xl px-4 py-2.5 bg-muted border text-sm text-muted-foreground flex items-center gap-2 rounded-tl-none shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                        <span>Tutor is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Question Input Form */}
                <form onSubmit={handleSendQuestion} className="flex gap-2 border-t pt-3 mt-auto">
                  <input
                    type="text"
                    placeholder="Ask Professor Gemini about this PDF..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={chatLoading}
                    className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  />
                  <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={chatLoading || !question.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewPage;
