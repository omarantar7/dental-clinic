import { NextResponse } from "next/server";
import { AuthorizationException } from "@/exceptions/http/AuthorizationException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import UniqueException from "@/exceptions/http/UniqueException";
import { HttpException } from "@/exceptions/http/HttpException";
import { BadRequestException } from "@/exceptions/http/BadRequestException";
import { ConflictException } from "@/exceptions/http/ConflictException";

export function handleApiError(error: unknown) {
  console.error(error);

  if (error instanceof NotFoundException) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
  if (error instanceof ConflictException) {
    // Callers put a machine-readable code (and any extra fields) in details,
    // e.g. SESSION_TIME_CONFLICT or ROLE_IN_USE.
    return NextResponse.json(
      { ...error.details, message: error.message },
      { status: 409 },
    );
  }
  if (error instanceof UniqueException) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  if (error instanceof HttpException) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status },
    );
  }
  if (error instanceof BadRequestException) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  if (error instanceof AuthorizationException) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json(
    { message: "Something went wrong" },
    { status: 500 },
  );
}
