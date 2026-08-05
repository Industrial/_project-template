import { Link, useParams } from "react-router";
import { usePage } from "../../api/pages";

export function Show() {
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = usePage(isValidId ? id : NaN);

	if (!isValidId) {
		return <p role="alert">Invalid page id.</p>;
	}

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	if (!data) {
		return <p>Page not found.</p>;
	}

	return (
		<div>
			<h1>{data.title}</h1>
			<dl>
				<dt>Icon</dt>
				<dd>{data.icon ?? "—"}</dd>
				<dt>Position</dt>
				<dd>{data.position}</dd>
				<dt>Created at</dt>
				<dd>{data.created_at}</dd>
				<dt>Updated at</dt>
				<dd>{data.updated_at}</dd>
			</dl>
			<p>
				<Link to={`/pages/${data.id}/edit`}>Edit</Link>{" "}
				<Link to="/pages">Back to list</Link>
			</p>
		</div>
	);
}
