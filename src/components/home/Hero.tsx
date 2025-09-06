import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Hero = () => {
  const message = "Hi! My name is Iru Anna";
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(120);

  useEffect(() => {
    const handleTyping = () => {
      if (!isDeleting) {
        setText(message.substring(0, text.length + 1));
        setTypingSpeed(120);
        if (text === message) {
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        setText(message.substring(0, text.length - 1));
        setTypingSpeed(60);
        if (text === "") {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, message]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-green-200/50 via-white to-gray-100">
      {/* Hexagon Pattern Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
        >
          <defs>
            <pattern
              id="hexPattern"
              width="40"
              height="35"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="20,0 40,10 40,25 20,35 0,25 0,10"
                fill="none"
                stroke="#fff"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexPattern)" />
        </svg>
      </div>

      {/* Avatar + Speech Bubble */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full shadow-2xl ring-4 ring-white/50">
          <img
            src="/Girl.png" // replace with your avatar image
            alt="AI Assistant"
            width={320}
            height={320}
            className="rounded-full object-cover shadow-2xl"
          />

          {/* Animated Speech Bubble */}
          <div className="absolute -left-36 top-1/3 bg-white shadow-lg px-6 py-3 rounded-2xl border border-gray-200 animate-bounce">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-semibold">
              {text}
            </span>
            <span className="animate-pulse text-indigo-500">|</span>
          </div>
        </div>
      </div>

      {/* Animated Title */}
      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative mt-10 text-4xl md:text-5xl font-extrabold text-center"
      >
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text animate-gradient-x bg-[length:200%_200%]">
          Smart, Secure & AI-Powered Communication
        </span>
        <br />
        <span className="text-gray-800">for Teams, Clients & Communities</span>
      </motion.h1>
    </section>
  );
};

export default Hero;
