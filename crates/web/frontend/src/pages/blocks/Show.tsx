import { Link, useParams } from "react-router";
import { useBlock } from "../../api/blocks";

export function Show() {
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = useBlock(isValidId ? id : NaN);

	if (!isValidId) {
		return <p role="alert">Invalid block id.</p>;
	}

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	if (!data) {
		return <p>Block not found.</p>;
	}

	return (
		<div>
			<h1>{data.block_type}</h1>
			<dl>
				<dt>Checked</dt>
				<dd>{data.checked}</dd>
				<dt>Position</dt>
				<dd>{data.position}</dd>
				<dt>Created at</dt>
				<dd>{data.created_at}</dd>
				<dt>Updated at</dt>
				<dd>{data.updated_at}</dd>
			</dl>
			<p>
				<Link to={`/blocks/${data.id}/edit`}>Edit</Link>{" "}
				<Link to="/blocks">Back to list</Link>
			</p>
		</div>
	);
}
