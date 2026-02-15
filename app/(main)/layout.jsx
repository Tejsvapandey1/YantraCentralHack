import Header from "../../components/header";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col">
      
      {/* Header */}
     <Header/>

      {/* Page Content */}
      <main >
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4 bg-slate-950 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Your App
      </footer>

    </div>
  );
}