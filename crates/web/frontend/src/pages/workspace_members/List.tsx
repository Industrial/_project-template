import { Link } from "react-router";
import {
	useListWorkspaceMembers,
	useRemoveWorkspaceMember,
} from "../../api/workspace_members";

export function List() {
	const { data, isLoading, isError, error } = useListWorkspaceMembers();
	const removeWorkspaceMember = useRemoveWorkspaceMember();

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	return (
		<div>
			<h1>WorkspaceMembers</h1>
			<p>
				<Link to="/workspace_members/new">New WorkspaceMember</Link>
			</p>
			<table>
				<thead>
					<tr>
						<th>Role</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data?.items.map((workspaceMember) => (
						<tr key={workspaceMember.id}>
							<td>
								<Link to={`/workspace_members/${workspaceMember.id}`}>
									{workspaceMember.role}
								</Link>
							</td>
							<td>
								<Link to={`/workspace_members/${workspaceMember.id}/edit`}>
									Edit
								</Link>{" "}
								<button
									type="button"
									disabled={removeWorkspaceMember.isPending}
									onClick={() =>
										removeWorkspaceMember.mutate(workspaceMember.id)
									}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{removeWorkspaceMember.isError && (
				<p role="alert">{removeWorkspaceMember.error.message}</p>
			)}
		</div>
	);
}
