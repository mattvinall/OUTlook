import FileUpload from "./components/FileUpload";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header Section */}
      <header className="w-full bg-gray-800 py-4 px-6 sm:px-8 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">OUTlook</h1>
        <p className="h-6 sm:h-8 font-bold mt-2">Save Money. Save Credits. Save your Sanity.</p>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center gap-6 px-4 sm:px-8 text-center">
        <h1 className="text-5xl sm:text-4xl font-semibold">
          Stop Wasting $$ and Credits on Outlook Receivers
        </h1>
        <p className="text-gray-300 max-w-md text-lg">
          Use this tool to filter out  <span className="font-semibold text-gray-100">Outlook</span>{" "} MX records before enriching your contacts.
        </p>
        <FileUpload />
      </main>

      {/* Footer Section */}
      <footer className="w-full bg-gray-800 py-4 text-center text-gray-400">
        <p className="text-sm">
          © 2024 OUTlook. Built with ❤️ for all AV members.
        </p>
      </footer>
    </div>
  );
}
