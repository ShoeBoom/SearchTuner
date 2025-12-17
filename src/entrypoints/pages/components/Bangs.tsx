import { For } from "solid-js";
import { bangsData } from "@/utils/storage";

const Bangs = () => {
	// const data = );
	const bangs = () => bangsData()?.data?.bangs ?? [];

	return (
		<div>
			<table class="w-full table-fixed">
				<colgroup>
					<col style={{ width: "25%" }} />
					<col style={{ width: "25%" }} />
					<col style={{ width: "25%" }} />
					<col style={{ width: "25%" }} />
				</colgroup>
				<thead class="border-b">
					<tr>
						<th class="pb-2 font-semibold text-sm">Site</th>
						<th class="pb-2 font-semibold text-sm">Trigger</th>
						<th class="pb-2 font-semibold text-sm">Domain</th>
						<th class="pb-2 font-semibold text-sm">Category</th>
					</tr>
				</thead>
				<tbody>
					<For each={bangs()}>
						{(bang) => {
							const allTriggers = [bang.t, ...(bang.ts ?? [])];
							return (
								<tr
									class="hover:bg-foreground/10 [&>td]:py-2"
									style={{ "content-visibility": "auto" }}
								>
									<td class="text-center">{bang.s}</td>
									<td class="text-center">{allTriggers.join(", ")}</td>
									<td class="text-center">{bang.d}</td>
									<td class="text-center">{bang.c ?? "-"}</td>
								</tr>
							);
						}}
					</For>
				</tbody>
			</table>
		</div>
	);
};

export default Bangs;
