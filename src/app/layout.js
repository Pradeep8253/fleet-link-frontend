import AuthProvider from "./components/AuthProvider";
import Header from "./components/Header";
import NavBar from "./components/NavBar";

import "./globals.css";

export const metadata = {
  title: "FleetLink",
  description: "Search & book vehicles",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-gray-900 antialiased">
        <AuthProvider>
          <Header />
          <div className="mx-auto max-w-3xl px-4 pt-6">
            <NavBar />
          </div>

          <main className="mx-auto max-w-3xl p-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
