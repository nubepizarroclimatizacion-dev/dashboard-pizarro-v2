import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const adminKey = clientPayload?.adminKey;

        if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
          throw new Error("Unauthorized: Invalid Admin Key");
        }

        return {
          allowedContentTypes: ["application/json"],
          pathname: "datasets/latest.json",
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log("Dataset uploaded:", blob.url);
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 401 }
    );
  }
}
