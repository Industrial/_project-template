import fs from "node:fs/promises";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5174;
const base = process.env.BASE || "/";
const apiTarget = process.env.LOCO_API_URL || "http://localhost:5150";

const templateHtml = isProduction
	? await fs.readFile("./dist/client/index.html", "utf-8")
	: "";

const app = express();

app.use(
	"/api",
	createProxyMiddleware({
		target: apiTarget,
		changeOrigin: true,
	}),
);

/** @type {import('vite').ViteDevServer | undefined} */
let vite;
if (!isProduction) {
	const { createServer } = await import("vite");
	vite = await createServer({
		server: { middlewareMode: true },
		appType: "custom",
		base,
	});
	app.use(vite.middlewares);
} else {
	const compression = (await import("compression")).default;
	const sirv = (await import("sirv")).default;
	app.use(compression());
	app.use(base, sirv("./dist/client", { extensions: [] }));
}

app.use("*all", async (req, res) => {
	try {
		const url = req.originalUrl.replace(base, "");

		let template;
		let render;
		if (!isProduction) {
			template = await fs.readFile("./index.html", "utf-8");
			template = await vite.transformIndexHtml(url, template);
			render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
		} else {
			template = templateHtml;
			render = (await import("./dist/server/entry-server.js")).render;
		}

		const rendered = await render(url);
		const html = template
			.replace(`<!--app-head-->`, rendered.head ?? "")
			.replace(`<!--app-html-->`, rendered.html ?? "");

		res.status(200).set({ "Content-Type": "text/html" }).send(html);
	} catch (e) {
		vite?.ssrFixStacktrace(e);
		console.error(e.stack);
		res.status(500).end(e.stack);
	}
});

app.listen(port, () => {
	console.log(
		`Vite SSR started at http://localhost:${port} (API → ${apiTarget})`,
	);
});
