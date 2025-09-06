import Layout from '@/components/layout/Layout';
import { Brain, Shield, MessageSquare, Users, Zap, Settings, Globe, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Features = () => {
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
      {/* Hero Section */}
      <section className="hero-bg py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
              Innovative <span className="text-gradient">Features</span>
              <br />Built for the Future
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              Discover the comprehensive suite of AI-powered features that make IRU Chat
              the most advanced communication platform for modern businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {featureCategories.map((category, index) => {
              const IconComponent = category.icon;
              const isReversed = index % 2 === 1;

              return (
                <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isReversed ? 'lg:grid-flow-col-dense' : ''}`}>
                  {/* Content */}
                  <div className={isReversed ? 'lg:col-start-2' : ''}>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-text">
                          {category.title}
                        </h2>
                      </div>
                    </div>
                    <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                      {category.description}
                    </p>
                    <ul className="space-y-4">
                      {category.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual */}
                  <div className={`${isReversed ? 'lg:col-start-1' : ''}`}>
                    <div className="relative">
                      <div className="card-interactive p-8 text-center">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-brand-blue/20 to-brand-cyan/20 flex items-center justify-center">
                          <IconComponent className="w-16 h-16 text-brand-blue" />
                        </div>
                        <h3 className="text-xl font-semibold text-text mb-4">
                          {category.title}
                        </h3>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-2xl font-bold text-gradient">
                            {category.features.length}
                          </span>
                          <span className="text-text-secondary">Features</span>
                        </div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-brand-cyan/20 rounded-full blur-sm"></div>
                      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-brand-blue/20 rounded-full blur-sm"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-bg">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-text mb-6">
              Experience All Features
              <br />
              <span className="text-gradient">Risk-Free</span>
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Start your 30-day free trial and discover how IRU Chat can transform
              your team's communication and productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to='auth'>
                <Button className="btn-hero text-lg px-8 py-4">
                  Start Free Trial
                </Button>
              </Link>
              <Link to='contact'>
                <Button className="btn-secondary text-lg px-8 py-4">
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