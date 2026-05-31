import { BookOpen, Mail, Phone, MapPin, Github, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-primary"
            >
              <BookOpen className="h-6 w-6" />
              StudyVault
            </Link>

            <p className="mt-4 text-sm text-muted-foreground leading-6">
              Your one-stop platform for study notes, PDFs, previous year
              papers, and academic resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/resources"
                  className="hover:text-primary transition-colors"
                >
                  Resources
                </Link>
              </li>

              <li>
                <Link
                  to="/notes"
                  className="hover:text-primary transition-colors"
                >
                  Notes
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                nandkumarbirgad3@gmail.com
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>

            <div className="flex gap-4">
              <a
                href="https://github.com/NandkumarBirgad"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border hover:bg-muted transition"
              >
                <Github className="h-5 w-5" />
              </a>

              <a
                href="https://www.linkedin.com/in/nandkumar-birgad-3ba58a361/"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border hover:bg-muted transition"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} StudyVault. All rights reserved.
          </p>

          <p className="text-sm text-muted-foreground">
            Developed by{" "}
            <span className="font-semibold text-primary">
              Nandkumar Birgad
            </span>
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;