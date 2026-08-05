import { Link, useParams } from "react-router";
import { usePageShare } from "../../api/page_shares";

export function Show() {
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = usePageShare(
		isValidId ? id : NaN,
	);

	if (!isValidId) {
		return <p role="alert">Invalid page_share id.</p>;
	}

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	if (!data) {
		return <p>PageShare not found.</p>;
	}

	return (
		<div>
			<h1>{data.permission}</h1>
			<dl>
				<dt>Created at</dt>
				<dd>{data.created_at}</dd>
				<dt>Updated at</dt>
				<dd>{data.updated_at}</dd>
			</dl>
			<p>
				<Link to={`/page_shares/${data.id}/edit`}>Edit</Link>{" "}
				<Link to="/page_shares">Back to list</Link>
			</p>
		</div>
	);
}
