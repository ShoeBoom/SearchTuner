/**
 * The name of the website associated with the bang.
 */
export type WebsiteName = string;
/**
 * The domain name of the website.
 */
export type Domain = string;
/**
 * The domain of the actual website if the bang searches another website, if applicable.
 */
export type AlternateDomain = string;
/**
 * The specific trigger word or phrase used to invoke the bang.
 */
export type Trigger = string;
/**
 * Other triggers for this bang other than the primary
 */
export type AdditionalTriggers = string[];
/**
 * The URL template to use when the bang is invoked, where `{{{s}}}` is replaced by the user's query.
 */
export type TemplateURL = string;
/**
 * Regex pattern that can be used for parsing the query for more complex bangs, allowing substition using `$1`, `$2`, etc.
 */
export type RegexPattern = string;
/**
 * The category of the website, if applicable.
 */
export type Category =
	| "Entertainment"
	| "Man Page"
	| "Multimedia"
	| "News"
	| "Online Services"
	| "Region search"
	| "Research"
	| "Shopping"
	| "Tech"
	| "Translation";
/**
 * The subcategory of the website, if applicable.
 */
export type Subcategory = string;
/**
 * The format flags indicating how the query should be processed.
 */
export type Format =
	| []
	| ["open_base_path" | "url_encode_placeholder" | "url_encode_space_to_plus"]
	| [
			"open_base_path" | "url_encode_placeholder" | "url_encode_space_to_plus",
			"open_base_path" | "url_encode_placeholder" | "url_encode_space_to_plus",
	  ]
	| [
			"open_base_path" | "url_encode_placeholder" | "url_encode_space_to_plus",
			"open_base_path" | "url_encode_placeholder" | "url_encode_space_to_plus",
			"open_base_path" | "url_encode_placeholder" | "url_encode_space_to_plus",
	  ];
/**
 * This schema defines the structure for bangs used by Kagi Search
 */
export type KagiBangsSchema = {
	s: WebsiteName;
	d: Domain;
	ad?: AlternateDomain;
	t: Trigger;
	ts?: AdditionalTriggers;
	u: TemplateURL;
	x?: RegexPattern;
	c?: Category;
	sc?: Subcategory;
	fmt?: Format;
	/**
	 * Whether specs should be run on this bang
	 */
	skip_tests?: boolean;
}[];
