"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CustomFlowbiteTheme,
  Flowbite,
  Navbar,
  NavbarBrand,
  NavbarToggle,
  NavbarCollapse,
} from "flowbite-react";
import ThemeToggle from "@/components/navBar/themeToggle";
import NavLinks from "@/components/navBar/navLinks";
import UserDropdown from "./userDropdown";
import { useSession } from "next-auth/react";

const customTheme: CustomFlowbiteTheme = {
  navbar: {
    root: {
      inner: {
        base: "mx-auto flex flex-wrap items-center",
      },
    },
    link: {
      active: {
        on: "bg-indigo-700 text-white dark:text-white md:bg-transparent md:text-indigo-700",
        off: "border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-indigo-700 md:dark:hover:bg-transparent md:dark:hover:text-white",
      },
    },
  },
};

export default function ClientNavBar() {
  const { data: session } = useSession();

  return (
    <Flowbite theme={{ theme: customTheme }}>
      <Navbar fluid>
        <NavbarBrand as={Link} href="/">
          <Image
            src="/icons/logo.svg"
            width={24}
            height={48}
            className="mr-2 h-6 sm:h-9"
            alt="Harmonie Logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Harmonie
          </span>
        </NavbarBrand>
        <div className="mx-auto"></div>
        <div className="flex md:order-2">
          {session && <UserDropdown user={session.user} />}
          <NavbarToggle />
        </div>

        <NavbarCollapse>
          <NavLinks isAuthenticated={!!session} />
          <ThemeToggle />
        </NavbarCollapse>
      </Navbar>
    </Flowbite>
  );
}
