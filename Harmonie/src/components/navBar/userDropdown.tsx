"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import { signOut } from "next-auth/react";

interface UserDropdownProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const currentPath = usePathname();

  const isActive = (path: string) => currentPath === path;
  return (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <Avatar
          className="mr-2 md:mr-0 hover:opacity-80"
          alt="User settings"
          img={`/user/${user?.name}/avatar`}
          rounded
        />
      }
    >
      <DropdownHeader>
        <span className="block text-sm font-semibold">{user?.name}</span>
        <span className="block truncate text-sm">{user?.email}</span>
      </DropdownHeader>
      <DropdownItem
        as={Link}
        href="/user/settings"
        className={isActive("/user/settings") ? "font-bold" : ""}
      >
        Settings
      </DropdownItem>
      <DropdownItem
        onClick={() => {
          signOut();
        }}
      >
        Sign out
      </DropdownItem>
    </Dropdown>
  );
}
