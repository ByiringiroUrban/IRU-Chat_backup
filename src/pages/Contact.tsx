import Layout from '@/components/layout/Layout';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Contact = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      content: "0795 381 733 / 0736 318 111",
      description: "Available for support",
      link: "tel:+250795381733"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      content: "0795381733",
      description: "Chat with us on WhatsApp",
      link: "https://wa.me/250795381733"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "Gahanga, Kicukiro",
      description: "Kigali, Rwanda - IRU BUSINESS GROUP Ltd"
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon - Sun",
      description: "08:00 AM - 8:00 PM"
    }
  ];

  const offices = [
    {
      city: "Kigali",
      country: "Rwanda",
      address: "Gahanga, Kicukiro, Kigali, Rwanda",
      phone: "0795 381 733 / 0736 318 111",
      whatsapp: "0795381733",
      email: "info@irubusinessgroup.com"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-bg py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              Have questions about IRU Chat? Want to discuss enterprise solutions?
              Our team is here to help you transform your communication experience.
            </p>
          </div>
        </div>
      </section>



      {/* Contact Form */}
      <section className="py-24 bg-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form */}
              <div className="card-interactive">
                <h2 className="text-3xl font-bold text-text mb-6">
                  Send us a Message
                </h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="John"
                        className="bg-bg-secondary border-border text-text"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-text text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Doe"
                        className="bg-bg-secondary border-border text-text"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      className="bg-bg-secondary border-border text-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-text text-sm font-medium mb-2">
                      Company
                    </label>
                    <Input
                      type="text"
                      placeholder="Your Company"
                      className="bg-bg-secondary border-border text-text"
                    />
                  </div>

                  <div>
                    <label className="block text-text text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <Input
                      type="text"
                      placeholder="How can we help you?"
                      className="bg-bg-secondary border-border text-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-text text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      placeholder="Tell us more about your needs..."
                      rows={6}
                      className="bg-bg-secondary border-border text-text resize-none"
                      required
                    />
                  </div>

                  <Button className="btn-hero w-full">
                    Send Message
                    <Send className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </div>

              {/* Info */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-text mb-6">
                    Why Choose IRU Chat?
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "30-day free trial with full features",
                      "24/7 customer support and onboarding",
                      "Enterprise-grade security and compliance",
                      "Custom integrations and white-label options",
                      "Scalable solutions for teams of any size"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-text-secondary">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-interactive bg-bg-card/50">
                  <h4 className="text-lg font-semibold text-text mb-4">
                    Need Immediate Help?
                  </h4>
                  <p className="text-text-secondary mb-4">
                    For urgent support requests or technical issues, reach out to our support team directly.
                  </p>
                  <Button className="btn-secondary w-full">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              const contentElement = info.link ? (
                <a
                  href={info.link}
                  target={info.link.startsWith('http') ? '_blank' : undefined}
                  rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-xl font-bold text-gradient mb-2 hover:text-brand-cyan transition-colors"
                >
                  {info.content}
                </a>
              ) : (
                <p className="text-xl font-bold text-gradient mb-2">
                  {info.content}
                </p>
              );
              
              return (
                <div key={index} className="card-interactive text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2">
                    {info.title}
                  </h3>
                  {contentElement}
                  <p className="text-text-secondary text-sm">
                    {info.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;