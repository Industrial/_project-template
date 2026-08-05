import { App } from "./App";
import { Login } from "./auth/Login";
import { RequireAuth } from "./auth/RequireAuth";
import { Home } from "./pages/Home";

import { Edit as CommentEdit } from "./pages/comments/Edit";
import { List as CommentList } from "./pages/comments/List";
import { New as CommentNew } from "./pages/comments/New";
import { Show as CommentShow } from "./pages/comments/Show";

import { Edit as PageShareEdit } from "./pages/page_shares/Edit";
import { List as PageShareList } from "./pages/page_shares/List";
import { New as PageShareNew } from "./pages/page_shares/New";
import { Show as PageShareShow } from "./pages/page_shares/Show";

import { Edit as MemberEdit } from "./pages/workspace_members/Edit";
import { List as MemberList } from "./pages/workspace_members/List";
import { New as MemberNew } from "./pages/workspace_members/New";
import { Show as MemberShow } from "./pages/workspace_members/Show";

import { Edit as BlockEdit } from "./pages/blocks/Edit";
import { List as BlockList } from "./pages/blocks/List";
import { New as BlockNew } from "./pages/blocks/New";
import { Show as BlockShow } from "./pages/blocks/Show";

import { Edit as PageEdit } from "./pages/pages/Edit";
import { List as PageList } from "./pages/pages/List";
import { New as PageNew } from "./pages/pages/New";
import { Show as PageShow } from "./pages/pages/Show";

import { Edit as WorkspaceEdit } from "./pages/workspaces/Edit";
import { List as WorkspaceList } from "./pages/workspaces/List";
import { New as WorkspaceNew } from "./pages/workspaces/New";
import { Show as WorkspaceShow } from "./pages/workspaces/Show";

export const routes = [
	{
		path: "/",
		element: <App />,
		children: [
			{ index: true, element: <Home /> },
			{ path: "login", element: <Login /> },
			{
				element: <RequireAuth />,
				children: [
					{ path: "comments", element: <CommentList /> },
					{ path: "comments/new", element: <CommentNew /> },
					{ path: "comments/:id", element: <CommentShow /> },
					{ path: "comments/:id/edit", element: <CommentEdit /> },
					{ path: "page_shares", element: <PageShareList /> },
					{ path: "page_shares/new", element: <PageShareNew /> },
					{ path: "page_shares/:id", element: <PageShareShow /> },
					{ path: "page_shares/:id/edit", element: <PageShareEdit /> },
					{ path: "workspace_members", element: <MemberList /> },
					{ path: "workspace_members/new", element: <MemberNew /> },
					{ path: "workspace_members/:id", element: <MemberShow /> },
					{ path: "workspace_members/:id/edit", element: <MemberEdit /> },
					{ path: "blocks", element: <BlockList /> },
					{ path: "blocks/new", element: <BlockNew /> },
					{ path: "blocks/:id", element: <BlockShow /> },
					{ path: "blocks/:id/edit", element: <BlockEdit /> },
					{ path: "pages", element: <PageList /> },
					{ path: "pages/new", element: <PageNew /> },
					{ path: "pages/:id", element: <PageShow /> },
					{ path: "pages/:id/edit", element: <PageEdit /> },
					{ path: "workspaces", element: <WorkspaceList /> },
					{ path: "workspaces/new", element: <WorkspaceNew /> },
					{ path: "workspaces/:id", element: <WorkspaceShow /> },
					{ path: "workspaces/:id/edit", element: <WorkspaceEdit /> },
				],
			},
		],
	},
];
