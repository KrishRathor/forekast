import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { ButtonBlue, ButtonGreen } from '../essentials/Button';
import { Search } from './Search';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { openSignUp, signOut } = useClerk();

  return (
    <nav className="w-full bg-inherit shadow-md px-4 py-3 flex items-center justify-between relative">
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold">🚀</div>
        <div className="text-2xl font-semibold">Forekast</div>
        <div className="hidden md:flex gap-4 text-md ml-6">
          <Link to="/" className="hover:text-white text-gray-300">Home</Link>
          <Link to="/markets" className="hover:text-white text-gray-300">Markets</Link>
          <Link to="/dashboard" className="hover:text-white text-gray-300">Dashboard</Link>
        </div>
      </div>

      <div className="hidden md:block">
        <Search />
      </div>

      <div className="flex items-center gap-3">
        <SignedOut>
          <ButtonBlue text="SignUp" onClick={() => openSignUp()} />
        </SignedOut>
        <SignedIn>
          <ButtonGreen text="LogOut" onClick={() => signOut()} />
        </SignedIn>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 w-full bg-[#121212] z-50 p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Search />
            <Link to="/" className="text-sm text-gray-300 hover:text-white">Home</Link>
            <Link to="/markets" className="text-sm text-gray-300 hover:text-white">Markets</Link>
            <Link to="/dashboard" className="text-sm text-gray-300 hover:text-white">Dashboard</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

