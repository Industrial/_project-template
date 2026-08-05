import { Link, useParams } from "react-router";
import { useWorkspaceMember } from "../../api/workspace_members";

export function Show() {
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = useWorkspaceMember(
		isValidId ? id : NaN,
	);

	if (!isValidId) {
		return <p role="alert">Invalid workspace_member id.</p>;
	}

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	if (!data) {
		return <p>WorkspaceMember not found.</p>;
	}

	return (
		<div>
			<h1>{data.role}</h1>
			<dl>
				<dt>Created at</dt>
				<dd>{data.created_at}</dd>
				<dt>Updated at</dt>
				<dd>{data.updated_at}</dd>
			</dl>
			<p>
				<Link to={`/workspace_members/${data.id}/edit`}>Edit</Link>{" "}
				<Link to="/workspace_members">Back to list</Link>
			</p>
		</div>
	);
}
