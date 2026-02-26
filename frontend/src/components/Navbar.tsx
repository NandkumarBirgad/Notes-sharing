import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Upload, Shield, Menu, X, Brain, Code, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api.ts';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch years to find DSA, Programming, Aptitude links
  const { data: years = [] } = useQuery({
    queryKey: ['years'],
    queryFn: api.getYears,
  });

  const skillCategories = years.filter((y) => y.order >= 5);
  const skillIcons: Record<string, typeof Brain> = { DSA: Brain, Programming: Code, Aptitude: Target };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary transition-transform duration-200 hover:scale-105">
          <motion.div
            whileHover={{ rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <BookOpen className="h-6 w-6 text-accent" />
          </motion.div>
          <span>StudyVault</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
            <Input
              placeholder="Search notes, papers, videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 transition-shadow duration-300 focus:shadow-md"
            />
          </div>
        </form>

        <div className="hidden items-center gap-2 md:flex">
          {skillCategories.map((cat) => {
            const Icon = skillIcons[cat.name] ?? BookOpen;
            return (
              <Button key={cat._id} variant="ghost" size="sm" asChild className="transition-all duration-200 hover:bg-accent/10 hover:text-accent">
                <Link to={`/year/${cat._id}`}>
                  <Icon className="mr-1.5 h-4 w-4" />
                  {cat.name}
                </Link>
              </Button>
            );
          })}
          <Button variant="ghost" size="sm" asChild className="transition-all duration-200 hover:bg-accent/10 hover:text-accent">
            <Link to="/upload">
              <Upload className="mr-1.5 h-4 w-4" />
              Upload
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="transition-all duration-200 hover:bg-accent/10 hover:text-accent">
            <Link to="/admin">
              <Shield className="mr-1.5 h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t bg-card md:hidden"
          >
            <div className="container mx-auto space-y-3 px-4 py-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>
              {skillCategories.map((cat) => {
                const Icon = skillIcons[cat.name] ?? BookOpen;
                return (
                  <Link key={cat._id} to={`/year/${cat._id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10">
                    <Icon className="h-4 w-4" /> {cat.name}
                  </Link>
                );
              })}
              <Link to="/upload" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10">
                <Upload className="h-4 w-4" /> Upload
              </Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10">
                <Shield className="h-4 w-4" /> Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
