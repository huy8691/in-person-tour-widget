import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { ProviderLayout, MuiThemeProvider } from "@/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "In-Person Tour Widget",
  description: "In-Person Tour Enquiry Widget for White Label Partners",
  icons: {
    icon: [
      { url: "/icons8-calculator-office-l-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons8-calculator-office-l-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons8-calculator-office-l-96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/icons8-calculator-office-l-32.png",
    apple: "/icons8-calculator-office-l-96.png",
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable} font-sans bg-[#f9f7f3]`}>
        <Script src="https://kit.fontawesome.com/0f348f0271.js" crossOrigin="anonymous" />
        {/* <script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} async defer></script> */}
        <div className="flex flex-col min-h-screen max-w-[393px] mx-auto h-auto bg-white">
          <div className="flex-1 flex flex-col">
            <ProviderLayout>
              <MuiThemeProvider>{children}</MuiThemeProvider>
            </ProviderLayout>
          </div>
          <div className="bg-[#f9f7f3] border-t border-[#e3e1dd] px-[18px] py-[24px] sticky bottom-0 left-0 right-0">
            <div className="mx-auto flex gap-[12px] items-center justify-center">
              <p className="text-[#3a3a3a] text-[12px] font-medium leading-[16px]">Powered by</p>
              <img
                src="/img/logos/careforkids-logo.svg"
                alt="Care for Kids"
                className="max-w-[104px] w-auto"
              />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
