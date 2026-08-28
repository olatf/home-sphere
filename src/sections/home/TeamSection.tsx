import Image from 'next/image';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

type TeamMember = {
  name: string;
  role: string;
  image: string;
};

const team: TeamMember[] = [
  {
    name: 'John Doe',
    role: 'CEO & Founder',
    image: '/images/team_2.webp',
  },
  {
    name: 'Jane Smith',
    role: 'Head of Operations',
    image: '/images/team_3.webp',
  },
  {
    name: 'Michael Brown',
    role: 'Product Manager',
    image: '/images/team_4.webp',
  },
];

export const TeamSection = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="mb-14 text-center">
          <AnimatedWrapper type="slideInDown">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-white px-4 py-1.5 font-medium font-secondary text-brand-primary text-sm">
              The people behind Homesphere
            </span>
          </AnimatedWrapper>
          <AnimatedWrapper type="slideInUp" delay={0.1}>
            <h2 className="mb-4 font-bold font-primary text-4xl text-gray-900">
              Meet Our Team
            </h2>
          </AnimatedWrapper>
          <AnimatedWrapper type="slideInUp" delay={0.2}>
            <p className="mx-auto max-w-2xl font-secondary text-gray-600">
              The passionate professionals behind Homesphere&apos;s innovation.
            </p>
          </AnimatedWrapper>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {team.map((member, index) => (
            <AnimatedWrapper
              key={member.name}
              type="slideInUp"
              delay={index * 0.1}
            >
              <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:shadow-xl">
                <div className="relative h-80">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-6 text-center">
                  <h3 className="font-primary font-semibold text-gray-900 text-xl">
                    {member.name}
                  </h3>
                  <p className="mt-2 font-secondary text-gray-500 text-sm">
                    {member.role}
                  </p>
                </div>
              </div>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};
