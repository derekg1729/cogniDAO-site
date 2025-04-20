import "@/styles/globals.css";
import { cal, inter } from "@/styles/fonts";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Providers } from "./providers";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import PageViewTracker from "@/components/analytics/page-view-tracker";

const title =
  "Platforms Starter Kit – The all-in-one starter kit for building multi-tenant applications.";
const description =
  "The Platforms Starter Kit is a full-stack Next.js app with multi-tenancy and custom domain support. Built with Next.js App Router, Vercel Postgres and the Vercel Domains API.";
const image = "https://vercel.pub/thumbnail.png";

export const metadata: Metadata = {
  title,
  description,
  icons: ["/favicon.ico"],
  openGraph: {
    title,
    description,
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
    creator: "@vercel",
  },
  metadataBase: new URL("https://vercel.pub"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(cal.variable, inter.variable)}>
        <Providers>
          {children}
          <Analytics />
          {/* Add Google Analytics - only loads if NEXT_PUBLIC_GA_ID is set */}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <>
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
              <PageViewTracker />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
