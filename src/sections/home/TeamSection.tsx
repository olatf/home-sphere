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
    <section className="bg-zinc-50 py-14">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-9">
          <AnimatedWrapper type="slideInDown">
            <h2 className="mb-4 text-4xl font-bold text-zinc-900">
              Meet Our Team
            </h2>
          </AnimatedWrapper>
          <AnimatedWrapper type="slideInUp">
            <p className="max-w-2xl text-zinc-600">
              The passionate professionals behind HomeSphere’s innovation.
            </p>
          </AnimatedWrapper>
        </div>
        <AnimatedWrapper type="slideInLeft">
          <div className="grid gap-10 md:grid-cols-3">
            {team.map((member, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:shadow-xl"
              >
                <div className="relative h-80">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-zinc-900">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
