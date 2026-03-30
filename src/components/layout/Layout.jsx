import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="flex overflow-hidden bg-white pt-16 dark:bg-[#020617]">
        <Sidebar />
        <div
          id="main-content"
          className="h-full w-full bg-gray-50 relative overflow-y-auto lg:ml-64 dark:bg-[#020617] dark:border-slate-800/50 dark:opacity-80"
        >
          <main>
            <div className="pt-6 px-4">
              <div className="w-full min-h-[calc(100vh-230px)]">
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8 dark:bg-slate-900">
                  {children}
                </div>
              </div>
            </div>
          </main>
          <Footer />

        </div>
      </div>
    </>
  );
}
