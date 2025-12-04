import { z } from "zod";

const bangSchema = z
	.object({
		s: z.string().describe("The name of the website associated with the bang."),
		d: z.string().describe("The domain name of the website."),
		ad: z
			.string()
			.describe(
				"The domain of the actual website if the bang searches another website, if applicable.",
			)
			.optional(),
		t: z
			.string()
			.describe("The specific trigger word or phrase used to invoke the bang."),
		ts: z
			.array(z.string())
			.describe("Other triggers for this bang other than the primary")
			.optional(),
		u: z
			.string()
			.describe(
				"The URL template to use when the bang is invoked, where `{{{s}}}` is replaced by the user's query.",
			),
		x: z
			.string()
			.describe(
				"Regex pattern that can be used for parsing the query for more complex bangs, allowing substition using `$1`, `$2`, etc.",
			)
			.optional(),
		c: z
			.enum([
				"Entertainment",
				"Man Page",
				"Multimedia",
				"News",
				"Online Services",
				"Region search",
				"Research",
				"Shopping",
				"Tech",
				"Translation",
			])
			.describe("The category of the website, if applicable.")
			.optional(),
		sc: z
			.string()
			.describe("The subcategory of the website, if applicable.")
			.optional(),
		fmt: z
			.array(
				z.enum([
					"open_base_path",
					"url_encode_placeholder",
					"url_encode_space_to_plus",
				]),
			)
			.min(0)
			.max(3)
			.describe(
				"The format flags indicating how the query should be processed.",
			)
			.optional(),
		skip_tests: z
			.boolean()
			.describe("Whether specs should be run on this bang")
			.default(false),
	})
	.strict();
const schema = z
	.array(bangSchema)
	.describe("This schema defines the structure for bangs used by Kagi Search");

export type KagiBangsSchema = z.infer<typeof schema>;
