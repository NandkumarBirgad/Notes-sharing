import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap" aria-label="Breadcrumb">
      <Link
        to="/"
        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="transition-colors hover:text-foreground truncate max-w-[120px] sm:max-w-none"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`truncate max-w-[120px] sm:max-w-none ${isLast ? 'text-foreground font-medium' : ''}`}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
