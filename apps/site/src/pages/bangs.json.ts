import { data } from "@searchtuner/bangs/lib/build_bangs";
import type { APIRoute } from "astro";
export const GET: APIRoute = () => {
	return new Response(JSON.stringify(data), {
		headers: {
			"Content-Type": "application/json",
		},
	});
};
