import { Link } from "react-router";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto  py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-400">
          🌍 GIS PMBG
        </Link>

        <div className="space-x-6 hidden md:flex">
          <Link to="/" className="hover:text-green-300 transition">
            Beranda
          </Link>
          <Link to="/map" className="hover:text-green-300 transition">
            Peta
          </Link>
          <Link to="/data" className="hover:text-green-300 transition">
            Data
          </Link>
          <Link to="/tentang" className="hover:text-green-300 transition">
            Tentang
          </Link>
        </div>
      </div>
    </nav>
  );
}
