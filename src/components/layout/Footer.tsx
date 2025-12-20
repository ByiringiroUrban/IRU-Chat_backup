import { Link } from "react-router-dom";
import { Twitter, Linkedin, Youtube, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

const Footer = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["Innovation", "Future"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-[#0a0e1a]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
        {/* Animated Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            <span className="inline-block animate-slide-in">
              Smart,Secure&AI-Powered
            </span>
            <span className="inline-block min-w-[200px] ml-2 relative h-[1.2em] overflow-hidden">
              <span
                key={currentWord}
                className="absolute inset-0 flex items-center justify-center animate-slide-in"
              >
                {words[currentWord]}
              </span>
            </span>
          </h2>
        </div>

        {/* Four Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - IRU Chat */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">
              IRU Chat
            </h3>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Developed by IRU BUSINESS GROUP Ltd. Smart, secure, and scalable communication for modern organizations worldwide.
            </p>
            {/* Social Links */}
            <div className="flex space-x-3">
              <a
                href="https://www.instagram.com/irubusinessgroup?igsh=Y2s1N25qY2xzM2Zu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} className="text-white" />
              </a>
              <a
                href="https://x.com/IRUBUSINESSES?t=QHreTJ4D1GtZfix4tQIpyw&s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                aria-label="X (Twitter)"
              >
                <Twitter size={18} className="text-white" />
              </a>
              <a
                href="https://www.linkedin.com/in/iru-business-group-571ba3334?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} className="text-white" />
              </a>
              <a
                href="https://www.youtube.com/@IRUTV-2060"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                aria-label="YouTube"
              >
                <Youtube size={18} className="text-white" />
              </a>
            </div>
          </div>

          {/* Column 2 - Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Solutions */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">
              Solutions
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">
              Newsletter
            </h4>
            <p className="text-gray-300 mb-4 text-sm">
              Subscribe to our newsletter for the latest updates.
            </p>
            <Input
              type="email"
              placeholder="Your Email"
              className="bg-white/10 border-white/20 text-gray-300 placeholder:text-gray-500 focus:border-techblue-300 transition-all duration-300 w-full"
            />
          </div>
        </div>

        {/* Footer Bottom - Separated by line */}
        <div className="border-t border-gray-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300 text-sm">
              © {new Date().getFullYear()} IRU Business Group. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy-policy"
                className="text-gray-300 text-sm hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-gray-300 text-sm hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                to="/sitemap"
                className="text-gray-300 text-sm hover:text-white transition-colors duration-300"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
