import { Link, useParams } from "react-router";
import { useWorkspace } from "../../api/workspaces";

export function Show() {
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = useWorkspace(
		isValidId ? id : NaN,
	);

	if (!isValidId) {
		return <p role="alert">Invalid workspace id.</p>;
	}

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	if (!data) {
		return <p>Workspace not found.</p>;
	}

	return (
		<div>
			<h1>{data.name}</h1>
			<dl>
				<dt>Created at</dt>
				<dd>{data.created_at}</dd>
				<dt>Updated at</dt>
				<dd>{data.updated_at}</dd>
			</dl>
			<p>
				<Link to={`/workspaces/${data.id}/edit`}>Edit</Link>{" "}
				<Link to="/workspaces">Back to list</Link>
			</p>
		</div>
	);
}
