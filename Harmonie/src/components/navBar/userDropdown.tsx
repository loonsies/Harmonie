"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import { signOut } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";

interface UserDropdownProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const currentPath = usePathname();
  const { userData } = useUser();

  const isActive = (path: string) => currentPath === path;
  return (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <Avatar
          className="mr-2 md:mr-0 hover:opacity-80"
          alt="User settings"
          img={`/user/${userData.name || user?.name}/avatar?v=${
            userData.avatarKey
          }`}
          rounded
        />
      }
    >
      <DropdownHeader>
        <span className="block text-sm font-semibold">
          {userData.name || user?.name}
        </span>
        <span className="block truncate text-sm">
          {userData.email || user?.email}
        </span>
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
