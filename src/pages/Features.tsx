import { useEffect, useRef, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Brain, Shield, MessageSquare, Users, Zap, Settings, Globe, BarChart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Feature Card Component with animations
const FeatureCard = ({ 
  category, 
  index, 
  isReversed,
  onFeatureClick 
}: { 
  category: any; 
  index: number; 
  isReversed: boolean;
  onFeatureClick: (featureName: string, featureDescription: string) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const IconComponent = category.icon;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-12'
      } ${isReversed ? 'lg:grid-flow-col-dense' : ''}`}
      style={{
        transitionDelay: `${index * 150}ms`,
      }}
    >
      {/* Content */}
      <div className={isReversed ? 'lg:col-start-2' : ''}>
        <div className="flex items-center space-x-4 mb-6 group">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center transition-all duration-500 ${
              isHovered ? 'scale-110 rotate-6 shadow-lg shadow-brand-blue/50' : 'scale-100 rotate-0'
            }`}
          >
            <IconComponent className="w-8 h-8 text-white transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-text transition-colors duration-300 group-hover:text-brand-blue">
              {category.title}
            </h2>
          </div>
        </div>
        <p className="text-lg text-text-secondary mb-8 leading-relaxed">
          {category.description}
        </p>
        <ul className="space-y-4">
          {category.features.map((feature: string, featureIndex: number) => {
            // Extract feature name (text before the dash)
            const featureName = feature.split('–')[0].trim();
            const featureDescription = feature;
            
            return (
              <li
                key={featureIndex}
                onClick={() => onFeatureClick(category.title, featureDescription)}
                className="flex items-start space-x-3 group/feature transition-all duration-300 hover:translate-x-2 cursor-pointer p-2 rounded-lg hover:bg-bg-card"
                style={{
                  animationDelay: `${(index * 150) + (featureIndex * 100)}ms`,
                }}
              >
                <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0 transition-all duration-300 group-hover/feature:scale-150 group-hover/feature:bg-brand-cyan"></div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-text-secondary transition-colors duration-300 group-hover/feature:text-text">
                    {feature}
                  </span>
                  <ArrowRight className="w-4 h-4 text-brand-blue opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300 flex-shrink-0 ml-2" />
                </div>
              </li>
            );
          })}
        </ul>
        {/* Learn More Button */}
        <button
          onClick={() => onFeatureClick(category.title, category.description)}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-cyan text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2 group"
        >
          <span>Learn More About {category.title}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Visual Card */}
      <div
        className={`${isReversed ? 'lg:col-start-1' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative group">
          <div
            onClick={() => onFeatureClick(category.title, category.description)}
            className={`card-interactive p-8 text-center transition-all duration-700 cursor-pointer ${
              isHovered
                ? 'scale-105 rotate-1 shadow-2xl shadow-brand-blue/20 border-brand-blue/50'
                : 'scale-100 rotate-0'
            }`}
            style={{
              transform: isHovered
                ? 'perspective(1000px) rotateY(2deg) rotateX(-2deg) scale(1.05)'
                : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)',
            }}
          >
            <div
              className={`w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-brand-blue/20 to-brand-cyan/20 flex items-center justify-center transition-all duration-700 ${
                isHovered
                  ? 'scale-110 rotate-12 shadow-xl shadow-brand-blue/30'
                  : 'scale-100 rotate-0'
              }`}
            >
              <IconComponent
                className={`w-16 h-16 text-brand-blue transition-all duration-700 ${
                  isHovered ? 'scale-125 rotate-12' : 'scale-100 rotate-0'
                }`}
              />
            </div>
            <h3 className="text-xl font-semibold text-text mb-4 transition-colors duration-300 group-hover:text-brand-blue">
              {category.title}
            </h3>
            <div className="flex items-center justify-center space-x-2">
              <span
                className={`text-2xl font-bold text-gradient transition-all duration-500 ${
                  isHovered ? 'scale-125' : 'scale-100'
                }`}
              >
                {category.features.length}
              </span>
              <span className="text-text-secondary">Features</span>
            </div>
            <div className="mt-4 text-sm text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
              Click to learn more →
            </div>
          </div>
          {/* Animated Decorative elements */}
          <div
            className={`absolute -top-4 -right-4 w-8 h-8 bg-brand-cyan/20 rounded-full blur-sm transition-all duration-700 ${
              isHovered ? 'scale-150 opacity-100 animate-pulse' : 'scale-100 opacity-60'
            }`}
          ></div>
          <div
            className={`absolute -bottom-4 -left-4 w-12 h-12 bg-brand-blue/20 rounded-full blur-sm transition-all duration-700 ${
              isHovered ? 'scale-150 opacity-100 animate-pulse' : 'scale-100 opacity-60'
            }`}
            style={{ animationDelay: '0.3s' }}
          ></div>
          {/* Glow effect on hover */}
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br from-brand-blue/0 to-brand-cyan/0 transition-all duration-700 pointer-events-none ${
              isHovered ? 'from-brand-blue/10 to-brand-cyan/10 blur-xl' : ''
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const [heroVisible, setHeroVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeroVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const ctaObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCtaVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (ctaRef.current) ctaObserver.observe(ctaRef.current);

    return () => {
      if (heroRef.current) heroObserver.unobserve(heroRef.current);
      if (ctaRef.current) ctaObserver.unobserve(ctaRef.current);
    };
  }, []);

  const handleFeatureClick = (featureName: string, featureDescription: string) => {
    // Store feature info in localStorage for chatbot page to access
    localStorage.setItem('chatbot-feature-query', JSON.stringify({
      name: featureName,
      description: featureDescription,
      timestamp: Date.now()
    }));

    // Redirect to chatbot page
    window.location.href = '/chatbot';
  };

  const featureCategories = [
    {
      title: "AI-Powered Conversation Intelligence",
      description: "Smart assistants that enhance your communication experience",
      icon: Brain,
      features: [
        "Context Memory AI – Remembers conversation history for smarter responses",
        "Smart Meeting Summaries – Automatic recaps with action points",
        "Sentiment Insights – Detects customer mood in real time for better engagement"
      ]
    },
    {
      title: "Multi-Layer Privacy & Security",
      description: "Uncompromising data protection with advanced security features",
      icon: Shield,
      features: [
        "Self-Destructing Confidential Rooms – Temporary encrypted spaces for sensitive talks",
        "On-Device AI Processing – Keeps data local for maximum privacy",
        "Stealth Mode – Disguises the app for private communication"
      ]
    },
    {
      title: "Built-in Business & Collaboration Tools",
      description: "Everything you need for seamless teamwork",
      icon: Users,
      features: [
        "Space Hosting – Create virtual 'spaces' for projects, events, or departments, each with its own chat, file storage, and tools",
        "Live Meetings – High-quality video/audio meetings directly inside IRU Chat without third-party apps",
        "Contract & Document Signing – Legally sign files right in the chat",
        "Voice-to-Task Conversion – Turn voice messages into trackable tasks automatically"
      ]
    },
    {
      title: "Community & Broadcast Messaging",
      description: "Advanced tools for community engagement and broadcasting",
      icon: MessageSquare,
      features: [
        "Community Channels – Large-scale discussion areas with topic threads",
        "Broadcast Messaging – Send updates to unlimited subscribers without them being able to reply directly",
        "Interest-Based Communities – Public or private spaces where people connect around shared topics"
      ]
    },
    {
      title: "Real-Time Multilingual Collaboration",
      description: "Break down language barriers with instant translation",
      icon: Globe,
      features: [
        "Live Chat Translation – Instant text or voice translation for global teams",
        "Group Translation Mode – Mixed-language groups communicate seamlessly"
      ]
    },
    {
      title: "Advanced Media & File Features",
      description: "Powerful media handling and file management capabilities",
      icon: BarChart,
      features: [
        "AI Search in Files & Media – Find exact details inside images, audio, or documents instantly",
        "Smart Document Scanner – Scan and share without leaving the chat"
      ]
    },
    {
      title: "Productivity-First Experience",
      description: "Features designed to maximize your efficiency",
      icon: Zap,
      features: [
        "Topic Threads Inside Chats – Organise discussions without creating new groups",
        "AI Meeting Scheduler – Sets up meetings from chat context",
        "Focus Mode – AI blocks non-essential notifications during work hours"
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero Section with Animation */}
      <section className="hero-bg py-24 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-blue/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div
            ref={heroRef}
            className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
              heroVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
              Innovative <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-cyan">Features</span>
              <br />Built for the Future
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              Discover the comprehensive suite of AI-powered features that make IRU Chat
              the most advanced communication platform for modern businesses.
            </p>
            <p className="text-lg text-brand-blue mt-4 font-medium">
              💡 Click on any feature to learn more in Chat Now!
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid with Staggered Animations */}
      <section className="py-24 bg-bg-secondary relative">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {featureCategories.map((category, index) => (
              <FeatureCard
                key={index}
                category={category}
                index={index}
                isReversed={index % 2 === 1}
                onFeatureClick={handleFeatureClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Animation */}
      <section className="py-24 bg-bg relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-cyan/5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div
            ref={ctaRef}
            className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${
              ctaVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-10 scale-95'
            }`}
          >
            <h2 className="text-4xl font-bold text-text mb-6">
              Experience All Features
              <br />
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-cyan">Risk-Free</span>
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Start your 30-day free trial and discover how IRU Chat can transform
              your team's communication and productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="auth">
                <Button className="btn-hero text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-blue/40">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="contact">
                <Button className="btn-secondary text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:bg-brand-blue/10">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Features;
