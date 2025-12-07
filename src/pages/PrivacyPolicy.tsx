import Layout from '@/components/layout/Layout';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-4">Privacy Policy</h1>
            <p className="text-text-secondary">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="bg-bg-card rounded-lg p-8 space-y-8 text-text-secondary">
            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">1. Information We Collect</h2>
              <p className="mb-3">We collect information that you provide directly to us, including when you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create an account or profile</li>
                <li>Use our services or features</li>
                <li>Contact us for support or inquiries</li>
                <li>Subscribe to our newsletter</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="mt-4">The types of information we may collect include your name, email address, phone number, and any other information you choose to provide.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Personalize and improve your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">3. Information Sharing and Disclosure</h2>
              <p className="mb-3">We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With your consent or at your direction</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist us in operating our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">4. Data Security</h2>
              <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">5. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">6. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">7. Changes to This Privacy Policy</h2>
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
            </section>

            <section className="bg-bg-secondary rounded-lg p-6 border border-border">
              <h2 className="text-2xl font-semibold text-text mb-4">8. Contact Us</h2>
              <p className="mb-4">If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
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

export default PrivacyPolicy;
