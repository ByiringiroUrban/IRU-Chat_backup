import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import ProcessSection from '@/components/home/ProcessSection';
import AiServicesSection from '@/components/home/AiServicesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import Chat from '@/components/home/ChatInterface';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Chat />
      <Features />
      <ProcessSection />
      <AiServicesSection />
      <TestimonialsSection />
    </Layout>
  );
};

export default Index;
