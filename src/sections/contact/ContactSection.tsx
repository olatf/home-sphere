import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { ContactForm } from './ContactForm';
import { ContactInfo } from './ContactInfo';

export const ContactSection = () => {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto grid gap-12 px-6 lg:grid-cols-5 lg:px-16">
        <div className="lg:col-span-2">
          <AnimatedWrapper type="slideInLeft">
            <h2 className="mb-3 font-bold font-primary text-3xl text-gray-900">
              Contact Information
            </h2>
            <p className="mb-8 font-secondary text-gray-600">
              Reach us directly, or fill out the form and our team will get back
              to you.
            </p>
          </AnimatedWrapper>
          <ContactInfo />
        </div>

        <div className="lg:col-span-3">
          <AnimatedWrapper type="slideInRight">
            <ContactForm />
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
};
