import type { APIRoute } from "astro";
import { data } from "../lib/build_bangs";
export const GET: APIRoute = () => {
	return new Response(JSON.stringify(data), {
		headers: {
			"Content-Type": "application/json",
		},
	});
};
