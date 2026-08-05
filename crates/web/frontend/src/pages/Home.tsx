import { Link } from "react-router";
import { getToken } from "../auth/token";

export function Home() {
	const signedIn = getToken() !== null;

	return (
		<main>
			<p>test-loco-webapp</p>
			<h1>Your workspace for pages, blocks, and shared notes.</h1>
			<p>
				A Loco + SQLite Notion-style starter: workspaces, nested pages, block
				editor primitives, sharing, and comments.
			</p>
			<p>
				{signedIn ? (
					<Link to="/workspaces">Open workspaces</Link>
				) : (
					<Link to="/login">Sign in</Link>
				)}
			</p>
		</main>
	);
}
