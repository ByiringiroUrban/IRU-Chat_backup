import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Home, Zap, Briefcase, DollarSign, User, Mail, MessageSquare, Shield, FileText, Map } from 'lucide-react';

const Sitemap = () => {
  const mainPages = [
    { name: 'Home', path: '/', icon: Home, description: 'Main landing page' },
    { name: 'Features', path: '/features', icon: Zap, description: 'Explore all our features' },
    { name: 'Solutions', path: '/solutions', icon: Briefcase, description: 'Business solutions' },
    { name: 'Pricing', path: '/pricing', icon: DollarSign, description: 'View pricing plans' },
    { name: 'About', path: '/about', icon: User, description: 'Learn about us' },
    { name: 'Contact', path: '/contact', icon: Mail, description: 'Get in touch' },
  ];

  const userPages = [
    { name: 'Chat', path: '/chat', icon: MessageSquare, description: 'Community chat interface' },
    { name: 'Account', path: '/account', icon: User, description: 'Manage your account' },
    { name: 'Sign In / Sign Up', path: '/auth', icon: Shield, description: 'Authentication' },
  ];

  const legalPages = [
    { name: 'Privacy Policy', path: '/privacy-policy', icon: FileText, description: 'Our privacy policy' },
    { name: 'Terms of Service', path: '/terms-of-service', icon: FileText, description: 'Terms and conditions' },
    { name: 'Sitemap', path: '/sitemap', icon: Map, description: 'Site navigation map' },
  ];

  const PageCard = ({ page }: { page: typeof mainPages[0] }) => {
    const Icon = page.icon;
    return (
      <Link
        to={page.path}
        className="block p-6 bg-bg-card rounded-lg border border-border hover:border-brand-blue hover:shadow-lg transition-all duration-300 group"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-blue/10 rounded-lg group-hover:bg-brand-blue/20 transition-colors">
            <Icon className="w-6 h-6 text-brand-blue" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text mb-1 group-hover:text-brand-blue transition-colors">
              {page.name}
            </h3>
            <p className="text-sm text-text-secondary">{page.description}</p>
            <span className="text-xs text-brand-blue mt-2 inline-block group-hover:underline">
              Visit page →
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-text mb-4">Sitemap</h1>
            <p className="text-text-secondary text-lg">
              Navigate through all pages of IRU Chat
            </p>
          </div>

          <div className="space-y-12">
            {/* Main Pages */}
            <section>
              <h2 className="text-2xl font-semibold text-text mb-6 flex items-center gap-2">
                <Home className="w-6 h-6 text-brand-blue" />
                Main Pages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainPages.map((page) => (
                  <PageCard key={page.path} page={page} />
                ))}
              </div>
            </section>

            {/* User Pages */}
            <section>
              <h2 className="text-2xl font-semibold text-text mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-brand-blue" />
                User Pages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPages.map((page) => (
                  <PageCard key={page.path} page={page} />
                ))}
              </div>
            </section>

            {/* Legal Pages */}
            <section>
              <h2 className="text-2xl font-semibold text-text mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-brand-blue" />
                Legal & Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {legalPages.map((page) => (
                  <PageCard key={page.path} page={page} />
                ))}
              </div>
            </section>

            {/* Quick Links */}
            <section className="bg-bg-card rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-semibold text-text mb-6">Quick Links</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...mainPages, ...userPages, ...legalPages].map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="text-brand-blue hover:text-brand-cyan hover:underline transition-colors text-sm"
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-bg-secondary rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-semibold text-text mb-4">Need Help?</h2>
              <p className="text-text-secondary mb-6">
                If you can't find what you're looking for, feel free to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/contact"
                  className="inline-block px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-cyan transition-colors text-center"
                >
                  Contact Us
                </Link>
                <a
                  href="mailto:irubusinessgroup@gmail.com"
                  className="inline-block px-6 py-3 bg-bg-card border border-border text-text rounded-lg hover:border-brand-blue transition-colors text-center"
                >
                  Email Us
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sitemap;
