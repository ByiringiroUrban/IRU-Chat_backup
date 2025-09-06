import Layout from '@/components/layout/Layout';
import { Check, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';


const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "RWF 3,500",
      period: "per user/month",
      description: "Ideal for Small Teams & Startups",
      popular: false,
      features: [
        "Secure messaging, group chats",
        "Up to 50 participants per channel",
        "File sharing"
      ]
    },
    {
      name: "Professional",
      price: "RWF 7,500",
      period: "per user/month",
      description: "Ideal for Growing Businesses",
      popular: true,
      features: [
        "All Starter features",
        "AI-powered chat assistant",
        "Live translation",
        "Up to 200 participants per channel",
        "10GB file storage"
      ]
    },
    {
      name: "Business",
      price: "RWF 14,500",
      period: "per user/month",
      description: "Ideal for Enterprises & Institutions",
      popular: false,
      features: [
        "All Professional features",
        "Live meetings",
        "Space hosting",
        "Unlimited channels",
        "Broadcast messaging",
        "50GB file storage"
      ]
    },
    {
      name: "Enterprise",
      price: "From RWF 25,000",
      period: "per user/month (or custom per project)",
      description: "Ideal for Large-Scale Organizations",
      popular: false,
      features: [
        "All Business features",
        "On-premises hosting",
        "Custom AI bots",
        "Dedicated account manager",
        "Unlimited storage",
        "Priority support"
      ]
    }
  ];

  const addOns = [
    {
      name: "Verified User Badge",
      price: "RWF 5,000",
      period: "per year",
      description: "Enhanced credibility, exclusive badge on profile"
    },
    {
      name: "Extra Storage",
      price: "RWF 500",
      period: "per GB/month",
      description: "Add additional file storage"
    },
    {
      name: "Custom AI Bot Development",
      price: "From RWF 250,000",
      period: "",
      description: "Custom AI chatbots for your specific needs"
    },
    {
      name: "White-Label Branding",
      price: "From RWF 1,500,000",
      period: "per year",
      description: "Full customization with your corporate identity"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-bg py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
              Simple, <span className="text-gradient">Transparent</span>
              <br />Pricing
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed mb-8">
              Choose the perfect plan for your team. Start free, scale as you grow,
              and unlock the full potential of AI-powered communication.
            </p>
            <div className="inline-flex items-center space-x-2 bg-bg-card/30 backdrop-blur-sm border border-border/20 rounded-full px-6 py-3">
              <span className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse"></span>
              <span className="text-sm text-text-secondary">30-day free trial • No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative card-interactive ${plan.popular ? 'ring-2 ring-brand-blue glow' : ''
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-brand-blue to-brand-cyan text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-text mb-2">{plan.name}</h3>
                  <p className="text-text-secondary text-sm mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gradient">{plan.price}</span>
                    {plan.price !== "Custom" && (
                      <span className="text-text-secondary ml-2">{plan.period}</span>
                    )}
                  </div>
                  <Button
                    className={`w-full ${plan.popular ? 'btn-hero' : 'btn-secondary'
                      }`}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-Ons Section */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-text mb-6">
              Available <span className="text-gradient">Add-Ons</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {addOns.map((addOn, index) => (
              <div key={index} className="card-interactive">
                <h3 className="text-xl font-bold text-text mb-2">{addOn.name}</h3>
                <p className="text-text-secondary text-sm mb-4">{addOn.description}</p>
                <div className="mb-6">
                  <span className="text-2xl font-bold text-gradient">{addOn.price}</span>
                  {addOn.period && (
                    <span className="text-text-secondary ml-2">{addOn.period}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-text mb-6">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                question: "Can I change my plan anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and you'll be billed prorated amounts."
              },
              {
                question: "Is there a free trial?",
                answer: "All plans include a 30-day free trial with full access to features. No credit card required to start."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans. Enterprise customers can also pay by invoice."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use end-to-end encryption, comply with international security standards, and undergo regular security audits."
              },
              {
                question: "Do you offer discounts for annual billing?",
                answer: "Yes, annual billing provides a 20% discount on all plans. Contact sales for custom enterprise pricing."
              }
            ].map((faq, index) => (
              <div key={index} className="card-interactive">
                <h3 className="text-xl font-semibold text-text mb-4">{faq.question}</h3>
                <p className="text-text-secondary">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-bg">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-text mb-6">
              Ready to Get <span className="text-gradient">Started?</span>
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Join thousands of teams already using IRU Chat to revolutionize their communication.
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

export default Pricing;