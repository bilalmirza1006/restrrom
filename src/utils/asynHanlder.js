import { NextResponse } from "next/server";
import { customError } from "./customError";

export const asyncHandler = (fn) => {
  return async (req, context) => {
    try {
      return await fn(req, context);
    } catch (error) {
      console.log("Error in asyncHandler:", error);
      if (error instanceof customError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  };
};
