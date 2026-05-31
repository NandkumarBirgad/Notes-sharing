import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, BookOpen, Upload, Shield, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api, Branch } from '@/lib/api.ts';

const Navbar = () => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch branches for quick navigation
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: api.getBranches,
  });

  // Only render on home page
  if (location.pathname !== '/') {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  // Show only top 3 branches in navbar to avoid overflow
  const quickBranches = (branches as Branch[]).slice(0, 3);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary transition-transform duration-200 hover:scale-105 shrink-0">
          <motion.div
            whileHover={{ rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <BookOpen className="h-6 w-6 text-accent" />
          </motion.div>
          <span>StudyVault</span>
        </Link>

        {/* Search bar */}
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

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {quickBranches.map((b) => (
            <Button key={b._id} variant="ghost" size="sm" asChild className="transition-all duration-200 hover:bg-accent/10 hover:text-accent">
              <Link to={`/branch/${b._id}`}>
                <span className="mr-1">{b.icon}</span>
                {b.code}
              </Link>
            </Button>
          ))}
          <Button variant="ghost" size="sm" asChild className="transition-all duration-200 hover:bg-accent/10 hover:text-accent">
            <Link to="/upload">
              <Upload className="mr-1.5 h-4 w-4" /> Upload
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="transition-all duration-200 hover:bg-accent/10 hover:text-accent">
            <Link to="/admin">
              <Shield className="mr-1.5 h-4 w-4" /> Admin
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

              {/* Branch quick links */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-3">Branches</p>
                {(branches as Branch[]).map((b) => (
                  <Link
                    key={b._id}
                    to={`/branch/${b._id}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10"
                  >
                    <span>{b.icon}</span> {b.name} <span className="ml-auto text-xs text-muted-foreground">{b.code}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t pt-2">
                <Link to="/upload" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10">
                  <Upload className="h-4 w-4" /> Upload
                </Link>
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10">
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
