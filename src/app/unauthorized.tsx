import { UserX } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LogoutButton } from "@/features/auth/components/logout-button";

export default function Unauthorized() {
  return (
    <main className="flex min-h-svh p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserX />
          </EmptyMedia>
          <EmptyTitle>Account unavailable</EmptyTitle>
          <EmptyDescription>
            Your account has been disabled. Contact your doctor to restore
            access.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <LogoutButton />
        </EmptyContent>
      </Empty>
    </main>
  );
}
