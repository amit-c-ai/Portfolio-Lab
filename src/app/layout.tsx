import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Portfolio Lab — Interactive Portfolio Analysis & Financial Learning',
  description:
    'Understand your investment portfolio beyond raw returns. Interactive step-by-step financial analysis for returns, variance, covariance, correlation, and diversification.',
  keywords: [
    'Portfolio Analysis',
    'Financial Modeling',
    'Covariance Matrix',
    'Pearson Correlation',
    'Portfolio Risk',
    'Diversification',
    'Finance Learning',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
