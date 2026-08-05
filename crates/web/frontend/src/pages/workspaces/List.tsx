import { Link } from "react-router";
import { useListWorkspaces, useRemoveWorkspace } from "../../api/workspaces";

export function List() {
	const { data, isLoading, isError, error } = useListWorkspaces();
	const removeWorkspace = useRemoveWorkspace();

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	return (
		<div>
			<h1>Workspaces</h1>
			<p>
				<Link to="/workspaces/new">New Workspace</Link>
			</p>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data?.items.map((workspace) => (
						<tr key={workspace.id}>
							<td>
								<Link to={`/workspaces/${workspace.id}`}>{workspace.name}</Link>
							</td>
							<td>
								<Link to={`/workspaces/${workspace.id}/edit`}>Edit</Link>{" "}
								<button
									type="button"
									disabled={removeWorkspace.isPending}
									onClick={() => removeWorkspace.mutate(workspace.id)}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{removeWorkspace.isError && (
				<p role="alert">{removeWorkspace.error.message}</p>
			)}
		</div>
	);
}
