import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Track Your Attendance",
  description: "An app to manage courses and attendance efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900`}>
        

        <main className="container mx-auto px-4 py-8">{children}</main>

        <footer className="bg-white border-t mt-8">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TrackAttendance. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
