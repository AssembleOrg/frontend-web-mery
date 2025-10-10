import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/theme-provider';
import { ModalProvider } from '@/contexts/modal-context';
import { AuthInterceptorProvider } from '@/components/auth/AuthInterceptorProvider';
import { Poppins } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-secondary',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
    >
      <body
        className={`antialiased ${poppins.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <ModalProvider>
              <AuthInterceptorProvider>
                {children}
                <Script
                  src='https://sdk.mercadopago.com/js/v2'
                  strategy='lazyOnload'
                />
              </AuthInterceptorProvider>
            </ModalProvider>
          </NextIntlClientProvider>
        </ThemeProvider>

        <Toaster
          position='top-right'
          toastOptions={{
            style: {
              background: '#2B2B2B',
              color: '#FBE8EA',
              borderRadius: '8px',
              border: '1px solid #545454',
            },
            error: {
              style: {
                background: '#660e1b',
                color: 'white',
              },
              iconTheme: {
                primary: 'white',
                secondary: '#660e1b',
              },
            },
            success: {
              style: {
                background: '#f9bbc4',
                color: '#660e1b',
              },
              iconTheme: {
                primary: '#660e1b',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
