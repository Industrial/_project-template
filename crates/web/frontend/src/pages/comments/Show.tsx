import { Link, useParams } from "react-router";
import { useComment } from "../../api/comments";

export function Show() {
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = useComment(isValidId ? id : NaN);

	if (!isValidId) {
		return <p role="alert">Invalid comment id.</p>;
	}

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	if (!data) {
		return <p>Comment not found.</p>;
	}

	return (
		<div>
			<h1>{data.body}</h1>
			<dl>
				<dt>Created at</dt>
				<dd>{data.created_at}</dd>
				<dt>Updated at</dt>
				<dd>{data.updated_at}</dd>
			</dl>
			<p>
				<Link to={`/comments/${data.id}/edit`}>Edit</Link>{" "}
				<Link to="/comments">Back to list</Link>
			</p>
		</div>
	);
}
