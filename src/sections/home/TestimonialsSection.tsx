import { Star } from 'lucide-react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

type Testimonial = {
  name: string;
  role: string;
  message: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    role: 'Tenant, Lagos',
    message:
      'Homesphere made renting my apartment stress-free. The process was seamless and transparent from start to finish.',
  },
  {
    name: 'David Williams',
    role: 'Landlord, Abuja',
    message:
      'As a landlord, I love how easy it is to manage tenants, track leases, and get paid on time.',
  },
  {
    name: 'Amaka Obi',
    role: 'Tenant, Ibadan',
    message:
      'The inspection scheduling alone saved me weeks of back-and-forth with agents. Genuinely a better way to find a home.',
  },
  {
    name: 'Chinedu Eze',
    role: 'Landlord, Port Harcourt',
    message:
      'Verified tenants, secure payments, and a dashboard that actually makes sense. Exactly what I needed.',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="bg-white py-18">
      <div className="container mx-auto px-3">
        <div className="mb-14 text-center">
          <AnimatedWrapper type="slideInDown">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-4 py-1.5 font-medium font-secondary text-brand-primary text-sm">
              Testimonials
            </span>
          </AnimatedWrapper>
          <AnimatedWrapper type="slideInUp" delay={0.1}>
            <h2 className="font-bold font-primary text-4xl text-gray-900">
              What Our Users Say
            </h2>
          </AnimatedWrapper>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {testimonials.map((item, index) => (
            <AnimatedWrapper
              key={item.name}
              type="slideInUp"
              delay={index * 0.1}
            >
              <div className="flex h-full flex-col rounded-2xl bg-gray-50 p-6 shadow-sm transition hover:shadow-lg">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={`${item.name}-star-${i.toString()}`}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="mb-6 flex-1 font-secondary text-gray-600 leading-relaxed">
                  {item.message}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 font-primary font-semibold text-brand-primary text-sm">
                    {item.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h4 className="font-primary font-semibold text-gray-900 text-sm">
                      {item.name}
                    </h4>
                    <p className="font-secondary text-gray-500 text-xs">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};
