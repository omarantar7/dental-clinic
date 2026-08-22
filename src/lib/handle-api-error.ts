import { NextResponse } from "next/server";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import UniqueException from "@/exceptions/http/UniqueException";
import { BadRequestException } from "@/exceptions/http/BadRequestException";
import { ConflictException } from "@/exceptions/http/ConflictException";

export function handleApiError(error: unknown) {
  console.error(error);

  if (error instanceof NotFoundException) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
  if (error instanceof ConflictException) {
    return NextResponse.json(
      {
        message: error.message,
        code: "SESSION_TIME_CONFLICT",
      },
      { status: 409 },
    );
  }
  if (error instanceof UniqueException) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  if (error instanceof BadRequestException) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Something went wrong" },
    { status: 500 },
  );
}
