// import { Footer, Navbar } from "@/components/navigation";
import BackToTop from '@/components/common/Back2top';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {/* <Navbar /> */}
      {/* @to-do: try mt-32 */}
      <main className="mt-0">{children}</main>
      {/* <Footer /> */}
      <BackToTop />
    </div>
  );
}
