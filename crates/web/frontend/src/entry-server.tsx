import React from "react";
import { renderToString } from "react-dom/server";
import {
	createStaticHandler,
	createStaticRouter,
	StaticRouterProvider,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routes } from "./routes";

export async function render(url: string) {
	const { query, dataRoutes } = createStaticHandler(routes);
	const request = new Request(new URL(url, "http://localhost"));
	const context = await query(request);

	if (context instanceof Response) {
		throw context;
	}

	const router = createStaticRouter(dataRoutes, context);
	const queryClient = new QueryClient();

	const html = renderToString(
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<StaticRouterProvider router={router} context={context} />
			</QueryClientProvider>
		</React.StrictMode>,
	);

	return { html };
}
