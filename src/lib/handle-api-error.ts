import { NextResponse } from "next/server";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import UniqueException from "@/exceptions/http/UniqueException";

export function handleApiError(error: unknown) {
  console.error(error);

  if (error instanceof NotFoundException) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
  if (error instanceof UniqueException) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Something went wrong" },
    { status: 500 },
  );
}
