"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  CustomFlowbiteTheme,
  Dropdown,
  Flowbite,
  Navbar,
  useThemeMode,
} from "flowbite-react";
import { FlowbiteIcons } from "flowbite-react-icons";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  Archive,
  Moon,
  Sun,
  Lock,
  FilePen,
} from "flowbite-react-icons/outline";
type NavBarProps = {
  name?: string;
  image?: string;
  email?: string;
};

const customTheme: CustomFlowbiteTheme = {
  navbar: {
    root: {
      inner: {
        base: "mx-auto flex flex-wrap items-center",
      },
    },
  },
};

export default function NavBar({ name, image, email }: NavBarProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const { mode, toggleMode } = useThemeMode();

  return (
    <Flowbite theme={{ theme: customTheme }}>
      <Navbar fluid>
        <Navbar.Brand href="/">
          <img
            src="/images/icons/logo.svg"
            className="mr-2 h-6 sm:h-9"
            alt="Harmonie Logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Harmonie
          </span>
        </Navbar.Brand>
        <div className="mx-auto"></div>

        <div className="flex md:order-2">
          {isAuthenticated && (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  className="mr-2 md:mr-0 hover:opacity-80"
                  alt="User settings"
                  img={image}
                  rounded
                />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm font-semibold">{name}</span>
                <span className="block truncate text-sm">{email}</span>
              </Dropdown.Header>
              <Dropdown.Item href="/user/settings">Settings</Dropdown.Item>
              <Dropdown.Item onClick={signOut}>Sign out</Dropdown.Item>
            </Dropdown>
          )}
          <Navbar.Toggle />
        </div>

        <Navbar.Collapse>
          <Navbar.Link href="/">
            <FlowbiteIcons size={16}>
              <Home className="inline-block md:hidden" />
            </FlowbiteIcons>
            <span className="ml-2">Home</span>
          </Navbar.Link>
          {isAuthenticated && (
            <Navbar.Link href="/user/manage">
              <FlowbiteIcons size={16}>
                <Archive className="inline-block md:hidden" />
              </FlowbiteIcons>
              <span className="ml-2">Manage</span>
            </Navbar.Link>
          )}
          {!isAuthenticated && (
            <>
              <Navbar.Link href="/auth/signin">
                <FlowbiteIcons size={16}>
                  <Lock className="inline-block md:hidden" />
                </FlowbiteIcons>
                <span className="ml-2">Log In</span>
              </Navbar.Link>
              <Navbar.Link href="/auth/register">
                {" "}
                <FlowbiteIcons size={16}>
                  <FilePen className="inline-block md:hidden" />
                </FlowbiteIcons>
                <span className="ml-2">Register</span>
              </Navbar.Link>
            </>
          )}
          <Navbar.Link className="block cursor-pointer" onClick={toggleMode}>
            <FlowbiteIcons size={16}>
              {mode == "dark" ? (
                <Sun className="inline-block" />
              ) : (
                <Moon className="inline-block" />
              )}
            </FlowbiteIcons>
            <span className="ml-2 md:hidden">Dark mode</span>
          </Navbar.Link>
        </Navbar.Collapse>
      </Navbar>
    </Flowbite>
  );
}
