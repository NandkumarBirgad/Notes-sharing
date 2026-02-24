import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
            <BookOpen className="h-5 w-5 text-accent" />
            StudyVault
          </Link>
          <p className="text-sm text-muted-foreground">
            Your one-stop hub for college study materials.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Created with <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" /> by{' '}
            <span className="font-semibold text-foreground">Nandkumar Birgad</span>
          </div>
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} StudyVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
