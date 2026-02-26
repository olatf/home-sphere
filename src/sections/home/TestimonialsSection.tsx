import { Star } from 'lucide-react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

type Testimonial = {
  name: string;
  message: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    message:
      'HomeSphere made renting my apartment stress-free. The process was seamless and transparent.',
  },
  {
    name: 'David Williams',
    message:
      'As a landlord, I love how easy it is to manage tenants and track leases.',
  },
  {
    name: 'David Williams',
    message:
      'As a landlord, I love how easy it is to manage tenants and track leases.',
  },
  {
    name: 'David Williams',
    message:
      'As a landlord, I love how easy it is to manage tenants and track leases.',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="bg-white py-14">
      <div className="container mx-auto px-3 lg:px-10">
        <div className="mb-9">
          <AnimatedWrapper type="slideInDown">
            <h2 className="text-4xl font-bold text-zinc-900">
              What Our Users Say
            </h2>
          </AnimatedWrapper>
        </div>

        <AnimatedWrapper type="slideInUp">
          <div className="grid gap-5 md:grid-cols-4">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl bg-zinc-50 px-4 py-8 shadow-sm transition hover:shadow-lg"
              >
                <div className="mb-4 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="mb-6 leading-relaxed text-zinc-600">
                  {item.message}
                </p>

                <h4 className="font-semibold text-zinc-900">— {item.name}</h4>
              </div>
            ))}
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
