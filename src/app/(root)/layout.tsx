import BackToTop from '@/components/common/Back2top';
import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
