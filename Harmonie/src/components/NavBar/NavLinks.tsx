"use client";

import Link from "next/link";
import { Navbar } from "flowbite-react";
import { usePathname } from "next/navigation";
import { Home, Archive, Lock, FilePen } from "flowbite-react-icons/outline";

type NavLinksProps = {
  isAuthenticated: boolean;
};

export default function NavLinks({ isAuthenticated }: NavLinksProps) {
  const currentPath = usePathname();

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      <Navbar.Link as={Link} href="/" active={isActive("/")}>
        <Home className="inline-block md:hidden" />
        <span className="ml-2">Home</span>
      </Navbar.Link>
      {isAuthenticated ? (
        <Navbar.Link
          as={Link}
          href="/user/manage"
          active={isActive("/user/manage")}
        >
          <Archive className="inline-block md:hidden" />
          <span className="ml-2">Manage</span>
        </Navbar.Link>
      ) : (
        <>
          <Navbar.Link
            as={Link}
            href="/auth/login"
            active={isActive("/auth/signin")}
          >
            <Lock className="inline-block md:hidden" />
            <span className="ml-2">Log In</span>
          </Navbar.Link>
          <Navbar.Link
            as={Link}
            href="/auth/register"
            active={isActive("/auth/register")}
          >
            <FilePen className="inline-block md:hidden" />
            <span className="ml-2">Register</span>
          </Navbar.Link>
        </>
      )}
    </>
  );
}
