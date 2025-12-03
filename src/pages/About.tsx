import Layout from '@/components/layout/Layout';
import { Target, Eye, Heart, Shield, Zap, Users, Award, Globe } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously pushing the boundaries of technology."
    },
    {
      icon: Shield,
      title: "Security",
      description: "Protecting every conversation with uncompromising privacy."
    },
    {
      icon: Heart,
      title: "Excellence",
      description: "Delivering a premium user experience at every level."
    },
    {
      icon: Users,
      title: "Customer Focus",
      description: "Designing solutions that truly serve user needs."
    }
  ];

  const highlights = [
    {
      icon: Shield,
      title: "End-to-End Encrypted Messaging",
      description: "Protect your conversations from unauthorized access"
    },
    {
      icon: Zap,
      title: "AI Chat Assistants",
      description: "Automate responses, analyze interactions, and boost efficiency"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Instant translation for global communications"
    },
    {
      icon: Award,
      title: "Seamless Integrations",
      description: "Connect with IRU ecosystem products & third-party tools"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Organizations" },
    { number: "1M+", label: "Messages Sent Daily" },
    { number: "99.99%", label: "Uptime Guarantee" },
    { number: "50+", label: "Countries Served" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-bg py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
              About <span className="text-gradient">IRU Chat</span>
              <br />Where Communication Meets Intelligence
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              IRU Chat is a next-generation, AI powered messaging platform designed for seamless, secure,
              and intelligent communication. Developed by IRU BUSINESS GROUP Ltd, we transform every conversation
              into a productive experience with real-time messaging, smart automation, and advanced data privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Vision */}
            <div className="card-interactive">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-text">Our Vision</h2>
              </div>
              <p className="text-lg text-text-secondary leading-relaxed">
                To become the <strong className="text-text">global leader</strong> in intelligent,
                secure, and integrated communication systems that empower people and businesses to
                connect, collaborate, and grow without barriers.
              </p>
            </div>

            {/* Mission */}
            <div className="card-interactive">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-text">Our Mission</h2>
              </div>
              <p className="text-lg text-text-secondary leading-relaxed">
                To provide a <strong className="text-text">smart, secure, and scalable communication solution</strong>
                that enhances productivity, strengthens relationships, and drives business success
                through AI-powered features and uncompromising data privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-bg">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-text mb-6">
              Our Core <span className="text-gradient">Values</span>
            </h2>
            <p className="text-xl text-text-secondary">
              The principles that guide everything we do and shape our culture of excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-text mb-4">
                    {value.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Highlights */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-text mb-6">
              Key <span className="text-gradient">Highlights</span>
            </h2>
            <p className="text-xl text-text-secondary">
              What makes IRU Chat the preferred choice for modern businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((highlight, index) => {
              const IconComponent = highlight.icon;
              return (
                <div key={index} className="card-interactive text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-cyan/20 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-brand-blue" />
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-3">
                    {highlight.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {highlight.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-bg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Profile */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-text mb-6">
                Company <span className="text-gradient">Profile</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-interactive">
                <h3 className="text-xl font-semibold text-text mb-4">Company Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Company Name:</span>
                    <span className="text-text font-medium">IRU BUSINESS GROUP Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Headquarters:</span>
                    <span className="text-text font-medium">Gahanga, Kicukiro, Kigali, Rwanda</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Industry:</span>
                    <span className="text-text font-medium">Technology, AI Solutions, Enterprise Communication</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Founded:</span>
                    <span className="text-text font-medium">2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Phone:</span>
                    <a href="tel:+250795381733" className="text-text font-medium hover:text-brand-blue transition-colors">0795 381 733 / 0736 318 111</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">WhatsApp:</span>
                    <a href="https://wa.me/250795381733" target="_blank" rel="noopener noreferrer" className="text-text font-medium hover:text-brand-blue transition-colors">0795381733</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Address:</span>
                    <span className="text-text font-medium">Gahanga, Kicukiro, Kigali, Rwanda</span>
                  </div>
                </div>
              </div>

              <div className="card-interactive">
                <h3 className="text-xl font-semibold text-text mb-4">Our Focus</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-secondary">Real-time, secure messaging</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-cyan rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-secondary">AI-powered assistants & chatbots</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-secondary">Multi-language instant translation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-cyan rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-secondary">Team collaboration & file sharing</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-secondary">Integration with the IRU ecosystem and third-party apps</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-cyan rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-secondary">Scalable for businesses of any size</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;