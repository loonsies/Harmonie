"use client";

import { useEffect, useState } from "react";
import { Navbar } from "flowbite-react";
import { useThemeMode } from "flowbite-react";
import { Moon, Sun } from "flowbite-react-icons/outline";

export default function ThemeToggle() {
  const { computedMode, toggleMode } = useThemeMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Navbar.Link className="md:mr-4 block cursor-pointer" onClick={toggleMode}>
      {mounted ? (
        computedMode === "dark" ? (
          <Sun className="inline-block" />
        ) : (
          <Moon className="inline-block" />
        )
      ) : (
        <></>
      )}
      <span className="md:hidden ml-2">Dark mode</span>
    </Navbar.Link>
  );
}
