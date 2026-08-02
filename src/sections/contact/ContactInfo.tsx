import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

const INFO = [
  {
    icon: MapPin,
    title: 'Office',
    lines: ['12 Adeola Odeku Street', 'Ikeja, Lagos, Nigeria'],
  },
  {
    icon: Mail,
    title: 'Email',
    lines: ['hello@homesphere.com', 'support@homesphere.com'],
  },
  {
    icon: Phone,
    title: 'Phone',
    lines: ['+234 800 000 0000'],
  },
  {
    icon: Clock,
    title: 'Working Hours',
    lines: ['Mon – Fri: 9am – 6pm', 'Sat: 10am – 2pm'],
  },
];

export const ContactInfo = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {INFO.map(({ icon: Icon, title, lines }, index) => (
        <AnimatedWrapper key={title} type="fadeUp" delay={index * 0.1}>
          <div className="h-full rounded-2xl bg-gray-50 p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10">
              <Icon className="h-5 w-5 text-brand-primary" />
            </div>
            <h3 className="mb-1 font-primary font-semibold text-gray-900">
              {title}
            </h3>
            {lines.map(line => (
              <p key={line} className="font-secondary text-gray-600 text-sm">
                {line}
              </p>
            ))}
          </div>
        </AnimatedWrapper>
      ))}
    </div>
  );
};
