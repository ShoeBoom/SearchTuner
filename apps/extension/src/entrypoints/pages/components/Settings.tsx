import { Download, Upload } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import type { BangAliases, RankingsV2 } from "@/utils/storage";
import {
	bangAliasesData,
	items,
	quickBangsData,
	syncedRankings,
} from "@/utils/storage";

interface SyncSettingsBackup {
	version: 1;
	exportedAt: string;
	data: {
		rankings: RankingsV2;
		quick_bangs: string[];
		bang_aliases: BangAliases;
	};
}

const Settings = () => {
	const [importStatus, setImportStatus] = createSignal<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const exportSettings = () => {
		const backup: SyncSettingsBackup = {
			version: 1,
			exportedAt: new Date().toISOString(),
			data: {
				rankings: syncedRankings() ?? {},
				quick_bangs: quickBangsData() ?? [],
				bang_aliases: bangAliasesData() ?? {},
			},
		};

		const blob = new Blob([JSON.stringify(backup, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `searchtuner-backup-${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const importSettings = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			try {
				const text = await file.text();
				const backup = JSON.parse(text) as SyncSettingsBackup;

				// Validate backup structure
				if (
					!backup.version ||
					!backup.data ||
					typeof backup.data !== "object"
				) {
					throw new Error("Invalid backup file format");
				}

				// Import each setting if present
				if (backup.data.rankings && typeof backup.data.rankings === "object") {
					await items.rankings.setValue(backup.data.rankings);
				}

				if (Array.isArray(backup.data.quick_bangs)) {
					await items.quick_bangs.setValue(backup.data.quick_bangs);
				}

				if (
					backup.data.bang_aliases &&
					typeof backup.data.bang_aliases === "object"
				) {
					await items.bang_aliases.setValue(backup.data.bang_aliases);
				}

				setImportStatus({
					type: "success",
					message: "Settings imported successfully!",
				});

				// Clear status after 3 seconds
				setTimeout(() => setImportStatus(null), 3000);
			} catch (err) {
				setImportStatus({
					type: "error",
					message:
						err instanceof Error ? err.message : "Failed to import settings",
				});

				// Clear status after 5 seconds
				setTimeout(() => setImportStatus(null), 5000);
			}
		};
		input.click();
	};

	return (
		<div class="mx-auto max-w-2xl">
			<div class="rounded-lg border border-foreground/20 p-4">
				<h3 class="mb-2 font-semibold text-lg">Backup & Restore</h3>
				<p class="mb-4 text-foreground/70 text-sm">
					Export your synced settings to a file or import from a previous
					backup. This includes your domain rankings, quick bangs, and bang
					aliases.
				</p>

				<div class="flex gap-3">
					<button
						onClick={exportSettings}
						class="flex items-center gap-2 rounded bg-foreground/10 px-4 py-2 font-medium text-sm hover:bg-foreground/20"
					>
						<Download size={16} />
						Export Settings
					</button>
					<button
						onClick={() => void importSettings()}
						class="flex items-center gap-2 rounded bg-foreground/10 px-4 py-2 font-medium text-sm hover:bg-foreground/20"
					>
						<Upload size={16} />
						Import Settings
					</button>
				</div>

				<Show when={importStatus()}>
					{(status) => (
						<p
							class={`mt-4 text-sm ${
								status().type === "success" ? "text-green-500" : "text-red-500"
							}`}
						>
							{status().message}
						</p>
					)}
				</Show>
			</div>
		</div>
	);
};

export default Settings;
