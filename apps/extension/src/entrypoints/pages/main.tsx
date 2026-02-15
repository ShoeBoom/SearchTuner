import { A, HashRouter, Route, useNavigate } from "@solidjs/router";
import {
	ArrowUpDown,
	Hash,
	Info,
	Settings as SettingsIcon,
} from "lucide-solid";
import { render } from "solid-js/web";
import logo from "@/assets/icon.webp";
import { RankingsTable } from "@/entrypoints/pages/components/rankingsTable";
import About from "./components/About";
import Bangs from "./components/Bangs";
import Settings from "./components/Settings";

function App() {
	return (
		<HashRouter
			root={(props) => (
				<div class="min-h-screen w-screen min-w-[320px] p-4">
					<header class="flex items-center gap-4 p-4 text-xl [&>a]:hover:underline">
						<img src={logo} class="h-6 w-6" />
						<A href="/rankings" class="flex items-center gap-2">
							<ArrowUpDown />
							Rankings
						</A>
						<A href="/settings" class="flex items-center gap-2">
							<SettingsIcon />
							Settings
						</A>
						<A href="/bangs" class="flex items-center gap-2">
							<Hash />
							Bangs
						</A>
						<div class="flex-1" />
						<A href="/about" class="flex items-center gap-2">
							<Info />
							About
						</A>
					</header>
					{props.children}
				</div>
			)}
		>
			<Route
				path="/"
				component={() => {
					const navigate = useNavigate();

					navigate("/rankings", { replace: true });
					return <></>;
				}}
			/>
			<Route path="/settings" component={Settings} />
			<Route path="/rankings" component={RankingsTable} />
			<Route path="/about" component={About} />
			<Route path="/bangs" component={Bangs} />
		</HashRouter>
	);
}

render(() => <App />, document.body);
