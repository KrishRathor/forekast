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
    <nav className="w-full bg-inherit shadow-md px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold">🚀</div>
        <div className="text-2xl font-semibold">Forekast</div>
        <div className="hidden md:flex gap-4 text-md">
          <Link to="/">Home</Link>
          <Link to="/markets">Markets</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </div>

      <div>
        <Search />
      </div>

      <div className="flex items-center gap-4">
        <SignedOut>
          <ButtonBlue text='SignUp' onClick={() => openSignUp()} />
        </SignedOut>
        <SignedIn>
          <ButtonGreen text='LogOut' onClick={() => signOut()} />
        </SignedIn>

        <button className="md:hidden cursor-pointer" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="absolute top-16 left-0 w-full bg-inherit px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 rounded bg-[#0C2922] text-white focus:outline-none"
            />
            <a href="#" className="text-sm text-gray-300">Home</a>
            <a href="#" className="text-sm text-gray-300">Products</a>
            <a href="#" className="text-sm text-gray-300">Pricing</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

