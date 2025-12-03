import Layout from '@/components/layout/Layout';
import { Building2, Heart, GraduationCap, Store, Gavel, Home, Plane, Factory, Users, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Solutions = () => {
  const industries = [
    {
      icon: Building2,
      title: "Banking & Financial Services",
      description: "Secure client communication portals and internal team collaboration",
      useCases: [
        "Secure client communication portals",
        "Private banking advisory chats",
        "Internal team collaboration under bank branding"
      ],
      benefits: [
        "End-to-end encryption",
        "Regulatory compliance",
        "Audit trail capabilities",
        "White-label customization"
      ]
    },
    {
      icon: Heart,
      title: "Healthcare & Medical Providers",
      description: "HIPAA-compliant patient communication tools and secure messaging",
      useCases: [
        "HIPAA-compliant patient communication tools",
        "Doctor-patient consultations and follow-ups",
        "Staff coordination with secure messaging"
      ],
      benefits: [
        "HIPAA compliance guarantee",
        "Secure patient data handling",
        "End-to-end encryption",
        "Telemedicine integration"
      ]
    },
    {
      icon: GraduationCap,
      title: "Education & E-Learning",
      description: "Branded platforms for enhanced learning and communication",
      useCases: [
        "Branded platforms for student-teacher communication",
        "Virtual classrooms with chat, video, and file sharing",
        "Community channels for alumni and events"
      ],
      benefits: [
        "FERPA compliance",
        "Multi-language support",
        "Virtual classroom tools",
        "Custom branding options"
      ]
    },
    {
      icon: Store,
      title: "Retail & E-Commerce",
      description: "Customer service integration and branded community channels",
      useCases: [
        "Customer service chat integrated with sales platforms",
        "Branded community channels for loyal customers and VIPs"
      ],
      benefits: [
        "24/7 customer support",
        "Sales platform integration",
        "Customer loyalty programs",
        "Real-time order assistance"
      ]
    },
    {
      icon: Gavel,
      title: "Telecommunications",
      description: "Customer support and internal coordination tools",
      useCases: [
        "Customer support chat branded as the telecom company's own",
        "Internal team and field staff coordination apps"
      ],
      benefits: [
        "Brand consistency",
        "Customer service integration",
        "Field team coordination",
        "Network status updates"
      ]
    },
    {
      icon: Users,
      title: "Government & Public Sector",
      description: "Secure inter-department and public engagement platforms",
      useCases: [
        "Secure communication for inter-department coordination",
        "Public engagement platforms with controlled access"
      ],
      benefits: [
        "Government-grade security",
        "FISMA compliance",
        "Controlled access systems",
        "Inter-agency coordination"
      ]
    },
    {
      icon: Briefcase,
      title: "Professional Services & Consulting",
      description: "Client communication and project collaboration tools",
      useCases: [
        "Client communication portals with secure document sharing",
        "Project collaboration under consulting firm branding"
      ],
      benefits: [
        "Secure document sharing",
        "Professional branding",
        "Project management tools",
        "Client portal access"
      ]
    },
    {
      icon: Home,
      title: "Real Estate",
      description: "Client interaction channels and collaboration tools",
      useCases: [
        "Branded client interaction channels for property inquiries",
        "Agent collaboration and deal tracking tools"
      ],
      benefits: [
        "Lead management system",
        "Property showcase tools",
        "Agent collaboration",
        "Deal tracking features"
      ]
    },
    {
      icon: Plane,
      title: "Media & Entertainment",
      description: "Fan community and production team collaboration",
      useCases: [
        "Fan community channels and broadcast messaging",
        "Internal production team collaboration apps"
      ],
      benefits: [
        "Fan engagement tools",
        "Broadcast messaging",
        "Content collaboration",
        "Community management"
      ]
    },
    {
      icon: Heart,
      title: "Nonprofits & NGOs",
      description: "Donor communication and secure coordination platforms",
      useCases: [
        "Donor and volunteer communication platforms",
        "Secure internal coordination with branded identity"
      ],
      benefits: [
        "Donor engagement tools",
        "Volunteer coordination",
        "Secure communications",
        "Custom branding"
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
              Tailored <span className="text-gradient">Solutions</span>
              <br />for Every Industry
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              IRU Chat adapts to your industry's unique needs with specialized features,
              compliance standards, and workflow optimizations.
            </p>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {industries.map((industry, index) => {
              const IconComponent = industry.icon;

              return (
                <div key={index} className="card-interactive">
                  {/* Header */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text">
                        {industry.title}
                      </h2>
                      <p className="text-text-secondary">
                        {industry.description}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Use Cases */}
                    <div>
                      <h3 className="text-lg font-semibold text-text mb-4">
                        Key Use Cases
                      </h3>
                      <ul className="space-y-3">
                        {industry.useCases.map((useCase, useCaseIndex) => (
                          <li key={useCaseIndex} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-text-secondary text-sm">{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h3 className="text-lg font-semibold text-text mb-4">
                        Key Benefits
                      </h3>
                      <ul className="space-y-3">
                        {industry.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-brand-cyan rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-text-secondary text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <button className="btn-secondary w-full">
                      Learn More About {industry.title}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* White Label Section */}
      <section className="py-24 bg-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-text mb-6">
              <span className="text-gradient">White-Label</span> Solutions
            </h2>
            <p className="text-xl text-text-secondary mb-12 leading-relaxed">
              Transform IRU Chat into your own branded communication platform with our
              comprehensive white-label options.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-interactive text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-4">
                  Custom Branding
                </h3>
                <p className="text-text-secondary">
                  Complete customization of colors, logos, and interface to match your brand identity.
                </p>
              </div>

              <div className="card-interactive text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-4">
                  Custom Domain
                </h3>
                <p className="text-text-secondary">
                  Host on your own domain with SSL certificates and full DNS control.
                </p>
              </div>

              <div className="card-interactive text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-4">
                  API Integration
                </h3>
                <p className="text-text-secondary">
                  Seamless integration with your existing systems and workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-text mb-6">
              Ready to Transform Your
              <br />
              <span className="text-gradient">Industry Communication?</span>
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Let's discuss how IRU Chat can be tailored to your specific industry needs
              and compliance requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to='/contact'>
                <Button className="btn-hero text-lg px-8 py-4">
                  Schedule Consultation
                </Button>
              </Link>
              <Link to='/contact'>
                <Button className="btn-secondary text-lg px-8 py-4">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Solutions;