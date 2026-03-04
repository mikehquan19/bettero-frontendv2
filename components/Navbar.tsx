'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Summary", href: "/summary" },
    { name: "Budget", href: "/budget" },
    { name: "Investment", href: "/investment" },
  ];

  return (
    <nav className="bg-gray-500 h-screen w-48 text-white fixed p-4 text-center">
      <header className="text-2xl font-bold">
        <Link href="/">Bettero App</Link>
      </header>
      <ul className="mt-4 flex flex-col gap-4">
        {navItems.map((navItem) => 
          <li key={navItem.href}>
            <Link 
              href={navItem.href}
              className={`
                block text-xl py-1 rounded-xl transition-all duration-150
                ${
                  pathname === navItem.href 
                    ? "bg-gray-600 shadow-sm font-bold" 
                    : "hover:bg-gray-600"
                }
              `}
            >
              {navItem.name}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}