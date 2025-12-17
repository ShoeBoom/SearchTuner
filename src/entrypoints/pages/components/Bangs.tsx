import { For } from "solid-js";
import { bangsData } from "@/utils/storage";

const Bangs = () => {
	// const data = );
	const bangs = () => bangsData()?.data?.bangs ?? [];

	return (
		<div>
			<table class="w-full table-auto">
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
						{(bang) => (
							<tr class="hover:bg-foreground/10 [&>td]:py-2">
								<td class="text-center">{bang.s}</td>
								<td class="text-center">{bang.t}</td>
								<td class="text-center">{bang.d}</td>
								<td class="text-center">{bang.c ?? "-"}</td>
							</tr>
						)}
					</For>
				</tbody>
			</table>
		</div>
	);
};

export default Bangs;
