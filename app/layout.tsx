import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Гимназическая мини-футбольная лига',
  description: 'Официальный сайт мини-футбольной лиги гимназии. Турнирная таблица, расписание, статистика игроков.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
