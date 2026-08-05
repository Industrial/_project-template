import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	build: {
		// Client build goes to dist/client via CLI; SSR build uses dist/server.
		outDir: "dist/client",
	},
	ssr: {
		noExternal: ["react-router"],
	},
	server: {
		port: 5173,
		proxy: {
			"/api": "http://localhost:5150",
		},
	},
});
