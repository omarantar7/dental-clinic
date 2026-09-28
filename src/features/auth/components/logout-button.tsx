"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLogout } from "@/features/auth/hooks/use-logout";

function LogoutButton() {
  const { logout, isLoading } = useLogout();

  return (
    <Button onClick={logout} disabled={isLoading}>
      {isLoading ? <Spinner /> : <LogOut />}
      Log out
    </Button>
  );
}

export { LogoutButton };
