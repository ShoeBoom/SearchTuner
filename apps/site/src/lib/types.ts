import * as z from "zod";

// Shared field schemas
const siteSchema = z
	.string()
	.describe("The name of the website associated with the bang.");
const domainSchema = z.string().describe("The domain name of the website.");
const actualDomainSchema = z
	.string()
	.describe(
		"The domain of the actual website if the bang searches another website, if applicable.",
	)
	.optional();
const triggerSchema = z
	.string()
	.describe("The specific trigger word or phrase used to invoke the bang.");
const triggersSchema = z
	.array(z.string())
	.describe("Other triggers for this bang other than the primary")
	.optional();
const urlSchema = z
	.string()
	.describe(
		"The URL template to use when the bang is invoked, where `{{{s}}}` is replaced by the user's query.",
	);
const regexSchema = z
	.string()
	.describe(
		"Regex pattern that can be used for parsing the query for more complex bangs, allowing substition using `$1`, `$2`, etc.",
	)
	.optional();
const categorySchema = z
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
	.optional();
const subcategorySchema = z
	.string()
	.describe("The subcategory of the website, if applicable.")
	.optional();
const formatSchema = z
	.array(
		z.enum([
			"open_base_path",
			"open_snap_domain",
			"url_encode_placeholder",
			"url_encode_space_to_plus",
		]),
	)
	.min(0)
	.max(3)
	.describe("The format flags indicating how the query should be processed.")
	.optional();
const skipTestsSchema = z
	.boolean()
	.optional()
	.describe("Whether specs should be run on this bang");

// Input schema with shortened field names
const bangSchemaInput = z
	.object({
		s: siteSchema,
		d: domainSchema,
		ad: actualDomainSchema,
		t: triggerSchema,
		ts: triggersSchema,
		u: urlSchema,
		x: regexSchema,
		c: categorySchema,
		sc: subcategorySchema,
		fmt: formatSchema,
		skip_tests: skipTestsSchema,
	})
	.strict();

// Output schema with full field names
const bangSchemaOutput = z
	.object({
		site: siteSchema,
		domain: domainSchema,
		actualDomain: actualDomainSchema,
		trigger: triggerSchema,
		triggers: triggersSchema,
		url: urlSchema,
		regex: regexSchema,
		category: categorySchema,
		subcategory: subcategorySchema,
		fmt: formatSchema,
		skip_tests: skipTestsSchema,
	})
	.strict();

// Codec that transforms between shortened and full field names
const bangSchema = z.codec(bangSchemaInput, bangSchemaOutput, {
	decode: (input) => ({
		site: input.s,
		domain: input.d,
		actualDomain: input.ad,
		trigger: input.t,
		triggers: input.ts,
		url: input.u,
		regex: input.x,
		category: input.c,
		subcategory: input.sc,
		fmt: input.fmt,
		skip_tests: input.skip_tests,
	}),
	encode: (output) => ({
		s: output.site,
		d: output.domain,
		ad: output.actualDomain,
		t: output.trigger,
		ts: output.triggers,
		u: output.url,
		x: output.regex,
		c: output.category,
		sc: output.subcategory,
		fmt: output.fmt,
		skip_tests: output.skip_tests,
	}),
});
const schema = z
	.array(bangSchema)
	.describe("This schema defines the structure for bangs used by Kagi Search");

// Export types for both input (shortened) and output (full) field names
export type KagiBangsSchemaInput = z.infer<typeof bangSchemaInput>[];
export type KagiBangsSchema = z.infer<typeof schema>;
export { bangSchema, schema };
