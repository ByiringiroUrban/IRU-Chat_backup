import Layout from '@/components/layout/Layout';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-4">Terms of Service</h1>
            <p className="text-text-secondary">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="bg-bg-card rounded-lg p-8 space-y-8 text-text-secondary">
            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using IRU Chat ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">2. Use License</h2>
              <p className="mb-3">Permission is granted to temporarily use IRU Chat for personal and commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained in IRU Chat</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">3. User Accounts</h2>
              <p className="mb-3">When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account and password</li>
                <li>Restricting access to your computer and account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">4. Acceptable Use</h2>
              <p className="mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful, offensive, or illegal content</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Collect or store personal data about other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">5. Intellectual Property</h2>
              <p>The Service and its original content, features, and functionality are and will remain the exclusive property of IRU Business Group and its licensors. The Service is protected by copyright, trademark, and other laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">6. Termination</h2>
              <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">7. Disclaimer</h2>
              <p>The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, IRU Business Group excludes all representations, warranties, and conditions relating to our Service and the use of this Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">8. Limitation of Liability</h2>
              <p>In no event shall IRU Business Group, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">9. Governing Law</h2>
              <p>These Terms shall be interpreted and governed by the laws of Rwanda, without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">10. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>
            </section>

            <section className="bg-bg-secondary rounded-lg p-6 border border-border">
              <h2 className="text-2xl font-semibold text-text mb-4">11. Contact Information</h2>
              <p className="mb-4">If you have any questions about these Terms of Service, please contact us:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-blue" />
                  <a 
                    href="mailto:irubusinessgroup@gmail.com" 
                    className="text-brand-blue hover:text-brand-cyan transition-colors"
                  >
                    irubusinessgroup@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-blue" />
                  <a 
                    href="tel:+250795381733" 
                    className="text-brand-blue hover:text-brand-cyan transition-colors"
                  >
                    +250 795 381 733 / +250 736 318 111
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-brand-blue" />
                  <span className="text-text-secondary">Gahanga, Kicukiro, Kigali, Rwanda</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <Link 
                  to="/contact" 
                  className="inline-block px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-cyan transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
