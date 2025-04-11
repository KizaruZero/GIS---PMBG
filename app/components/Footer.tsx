export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-lg font-semibold">🌍 GIS - PMBG</h2>
          <p className="text-sm">
            © {new Date().getFullYear()} Pusat Mitigasi Bencana Geologi
          </p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-300 text-sm">
            Tentang
          </a>
          <a href="#" className="hover:text-gray-300 text-sm">
            Kontak
          </a>
          <a href="#" className="hover:text-gray-300 text-sm">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
