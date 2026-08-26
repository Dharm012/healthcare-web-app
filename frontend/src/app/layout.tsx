import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'HealthConnect AI',
  description: 'Intelligent healthcare platform connecting patients, doctors, and administrators.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
