import { Link } from 'react-router-dom';
import { ArrowRight, Download, FileText, Video, Sparkles, GraduationCap, Search, BookOpen, Upload, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api, Year } from '@/lib/api.ts';

const yearIcons: Record<number, string> = { 0: '📘', 1: '📗', 2: '📙', 3: '📕' };

const statItems = [
  { icon: FileText, label: 'Study Notes', value: '500+' },
  { icon: Download, label: 'Downloads', value: '12K+' },
  { icon: Video, label: 'Video Lectures', value: '150+' },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const Index = () => {
  const { data: years = [], isLoading, isError } = useQuery({
    queryKey: ['years'],
    queryFn: api.getYears,
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-40">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />

        <div className="container relative mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">

            {/* Left Column: Copy & Actions */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeUpItem} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Your Ultimate Academic Resource</span>
              </motion.div>

              <motion.h1 variants={fadeUpItem} className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                Master Your Curriculum with <span className="text-primary">Ease.</span>
              </motion.h1>

              <motion.p variants={fadeUpItem} className="text-lg text-muted-foreground mb-8 max-w-xl">
                Access curated study notes, previous year papers, and high-quality video lectures. Organized seamlessly by year, semester, and subject.
              </motion.p>

              {/* Quick Search / Action Bar */}
              <motion.div variants={fadeUpItem} className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search subjects, topics, or papers..."
                    className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                  />
                </div>
                <Link to="#years-section" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md">
                  Explore Years <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column: Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center h-[500px]"
            >
              <div className="flex h-48 w-48 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="h-24 w-24" />
              </div>

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 top-1/4 rounded-xl bg-background/90 backdrop-blur-md border border-border p-4 shadow-lg flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Free Access</p>
                  <p className="text-sm font-bold">All Resources</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="container mx-auto px-4 relative z-10 -mt-16 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl rounded-2xl bg-card border border-border shadow-lg p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
            {statItems.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-center gap-4 pt-4 md:pt-0 first:pt-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold font-display">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3. BROWSE BY YEAR SECTION */}
      <section id="years-section" className="container mx-auto px-4 py-16 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Browse by Academic Year</h2>
            <p className="text-muted-foreground max-w-2xl">Navigate through your specific curriculum to find targeted notes, past papers, and video explanations.</p>
          </motion.div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
            <p className="font-medium text-destructive">Failed to load years. Make sure the backend is running on port 5000.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {years.map((year: Year, idx: number) => (
              <motion.div key={year._id} variants={fadeUpItem} className="h-full">
                <Link
                  to={`/year/${year._id}`}
                  className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/5 text-3xl transition-colors group-hover:bg-primary/10">
                    {yearIcons[idx] ?? '📘'}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{year.name}</h3>
                  <p className="text-sm text-muted-foreground flex-grow mb-6">{year.description}</p>

                  <div className="mt-auto flex items-center text-sm font-semibold text-primary">
                    View Resources
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 4. BOTTOM CTA */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
              <Upload className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Empower Your Peers
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-300 mb-8">
              The best learning happens together. Got great notes or a previous year paper? Upload them and help build the ultimate knowledge base.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-slate-900 transition-all hover:bg-slate-100 hover:scale-105 shadow-lg"
            >
              Contribute Materials <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Index;