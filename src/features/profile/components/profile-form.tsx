"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { TokenUserPayload } from "@/config/types";
import { useProfile } from "../hooks/use-profile";

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProfileForm({ user }: { user: TokenUserPayload }) {
  const { profile, isDoctor, isLoading, isSubmitting, error, form, onSubmit } =
    useProfile(user);
  const {
    register,
    formState: { errors },
  } = form;

  if (isLoading && !profile) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="flex-row items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="flex-row items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm">
            {profile.full_name || profile.email}
          </CardTitle>
        </div>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" value={profile.email} disabled readOnly />
            </Field>

            <Field data-invalid={!!errors.full_name}>
              <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
              <Input
                id="full_name"
                aria-invalid={!!errors.full_name}
                {...register("full_name")}
              />
              <FieldError errors={[errors.full_name]} />
            </Field>

            <Field data-invalid={!!errors.phone_number}>
              <FieldLabel htmlFor="phone_number">Phone Number</FieldLabel>
              <Input
                id="phone_number"
                type="tel"
                aria-invalid={!!errors.phone_number}
                {...register("phone_number")}
              />
              <FieldError errors={[errors.phone_number]} />
            </Field>

            {isDoctor && (
              <Field data-invalid={!!errors.clinic_address}>
                <FieldLabel htmlFor="clinic_address">Clinic Address</FieldLabel>
                <Input
                  id="clinic_address"
                  aria-invalid={!!errors.clinic_address}
                  {...register("clinic_address")}
                />
                <FieldError errors={[errors.clinic_address]} />
              </Field>
            )}

            {error && <FieldError>{error.message}</FieldError>}
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            {isSubmitting && <Spinner />}
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export { ProfileForm };
