import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const version = url.searchParams.get("version");

  if (!version) {
    throw new Response("Missing version", { status: 400 });
  }

  return json({
    scripts: [`/assets/manifest-${version}.js`],
  });
};
