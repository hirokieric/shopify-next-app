import { handleApiError } from "@/lib/errors/api-error";
import { verifyRequest } from "@/lib/shopify/verify";
import { NextResponse } from "next/server";
import type { APIResponse } from "@/lib/types/api";

type Data = {
  name: string;
  height: string;
};

export async function GET(req: Request) {
  try {
    // session token is located in the request headers
    await verifyRequest(req, true);

    return NextResponse.json<APIResponse<Data>>({
      status: "success",
      data: {
        name: "Luke Skywalker",
        height: "172",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
