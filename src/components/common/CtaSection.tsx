import Link from 'next/link';
import { BrandButton } from '@/components/common/BrandButton';

export const CtaSection = ({
  title,
  description,
  buttonLabel = 'Browse Properties',
  buttonHref = '/properties',
}: {
  title: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
}) => {
  return (
    <section className="bg-brand-primary py-20 text-white">
      <div className="container mx-auto px-6 text-center lg:px-16">
        <h2 className="mb-4 font-bold font-primary text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mb-8 max-w-xl font-secondary text-white/80">
          {description}
        </p>
        <BrandButton asChild variant="primaryDark" size="lg">
          <Link href={buttonHref}>{buttonLabel}</Link>
        </BrandButton>
      </div>
    </section>
  );
};
