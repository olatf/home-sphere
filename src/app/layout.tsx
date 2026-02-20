import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from 'sonner';
import { Cardo, Hanken_Grotesk } from 'next/font/google';

const cardo = Cardo({
  variable: '--font-cardo',
  weight: ['400', '700'],
  subsets: ['latin'],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Homesphere',
  description:
    'Homesphere - Your one stop solution for all your real estate needs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${hankenGrotesk.variable} ${cardo.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
