import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

const MovingWords = () => {
  const words = ["Innovation", "Technology", "Learning", "Future", "Growth", "Success"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 500);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden h-12 md:h-16 mb-6">
      <div className="relative h-full flex items-center justify-center">
        {words.map((word, index) => (
          <span
            key={index}
            className={`absolute text-xl md:text-3xl font-bold transition-all duration-700 ease-in-out ${index === currentIndex
                ? `opacity-100 transform-none ${isAnimating ? "blur-sm scale-105" : ""}`
                : "opacity-0 translate-y-16"
              }`}
          >
            <span className="text-white"> Smart, Secure & AI-Powered </span>
            <span className="bg-gradient-to-r from-techblue-300 via-techblue to-techpurple-light text-transparent bg-clip-text">
              {word}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-techdark to-techblue-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-15 pointer-events-none">
        <div
          className="absolute w-40 h-40 bg-techblue-400 rounded-full -top-10 -left-10 animate-pulse"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute w-60 h-60 bg-techblue-500 rounded-full top-40 right-20 animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
        <div
          className="absolute w-20 h-20 bg-techpurple-light rounded-full bottom-10 left-1/4 animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-16 pb-8 relative z-10">
        <MovingWords />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="transform transition-transform duration-500 hover:-translate-y-2">
            <h3 className="text-xl md:text-2xl font-bold mb-4 relative inline-block">
              Tech<span className="text-techblue-300">Rise</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-techblue to-techpurple-light transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <p className="text-gray-300 mb-6">
              Developed by IRU BUSINESS GROUP Ltd. Smart, secure, and scalable communication
              for modern organizations worldwide.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://www.youtube.com/@irutv-2060"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-techblue hover:scale-110 transition-all duration-300"
              >
                <Youtube size={20} />
              </a>
              <a
                href="https://x.com/IRUBUSINESSES?t=QHreTJ4D1GtZfix4tQIpyw&s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-techblue hover:scale-110 transition-all duration-300"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/iru-business-group-571ba3334?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-techblue hover:scale-110 transition-all duration-300"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://www.instagram.com/techriserwanda/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-techblue hover:scale-110 transition-all duration-300"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.instagram.com/irubusinessgroup?igsh=Y2s1N25qY2xzM2Zu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-techblue hover:scale-110 transition-all duration-300"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="transform transition-transform duration-500 hover:-translate-y-2">
            <h4 className="font-semibold text-lg mb-4 relative inline-block">
              Company
              <span className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-gradient-to-r from-techblue to-techpurple-light"></span>
            </h4>
            <ul className="space-y-2">
              {["About Us", "Career", "", "Contact"].map((item, index) => (
                <li
                  key={index}
                  className="transform hover:translate-x-2 transition-transform duration-300"
                >
                  <Link to={`/about`} className="text-gray-300 hover:text-white flex items-center">
                    <span className="hover:text-techblue-300">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="transform transition-transform duration-500 hover:-translate-y-2">
            <h4 className="font-semibold text-lg mb-4 relative inline-block">
              Solutions
              <span className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-gradient-to-r from-techblue to-techpurple-light"></span>
            </h4>
            <ul className="space-y-2">
              {["Features", "Solutions", "How it Works", "Pricing", ""].map((item, index) => (
                <li
                  key={index}
                  className="transform hover:translate-x-2 transition-transform duration-300"
                >
                  <Link
                    to={`/features`}
                    className="text-gray-300 hover:text-white flex items-center"
                  >
                    <span className="hover:text-techblue-300">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="transform transition-transform duration-500 hover:-translate-y-2">
            <h4 className="font-semibold text-lg mb-4 relative inline-block">
              Newsletter
              <span className="absolute -bottom-1 left-0 w-1/3 h-0.5 bg-gradient-to-r from-techblue to-techpurple-light"></span>
            </h4>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <div className="flex space-x-2 group">
              <Input
                type="email"
                placeholder="Your Email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-techblue-300 transition-all duration-300"
              />
              <Button className="bg-techblue hover:bg-techblue-700 group-hover:animate-pulse transition-all duration-300 button-glow">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm hover:text-white transition-colors duration-300">
              &copy; {new Date().getFullYear()} IRU Business Group. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {["Privacy Policy", "Terms of Service", "Sitemap"].map((item, index) => (
                <Link
                  key={index}
                  to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-400 text-sm hover:text-white hover:underline transition-all duration-300"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
