import type { Metadata } from 'next';
import { SITE_URL } from '@/config/constants';
import { safeStr } from '@/helpers/data.helpers';

type BuildMetadataOptions = {
  title: string;
  description?: string;
  image?: string;
  url?: string;
};

export function buildMetadata({
  title,
  description,
  image,
  url,
}: BuildMetadataOptions): Metadata {
  const canonical = safeStr(url, SITE_URL);
  const baseTitle = safeStr(title, 'Chapters and Courses');
  const isStandardTitle =
    baseTitle.includes('|') || baseTitle === 'Chapters and Courses';
  const fullTitle = isStandardTitle
    ? baseTitle
    : `${baseTitle} | Chapters and Courses`;
  const imageUrl = safeStr(image, `${SITE_URL}/images/logo.webp`);
  const metaDescription = safeStr(
    description,
    'Official Chapters and Courses website.'
  );

  return {
    title: fullTitle,
    description: metaDescription,
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url: canonical,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      siteName: 'Chapters and Courses',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical,
    },
  };
}
