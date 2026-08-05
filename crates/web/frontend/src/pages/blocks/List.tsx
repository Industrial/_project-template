import { Link } from "react-router";
import { useListBlocks, useRemoveBlock } from "../../api/blocks";

export function List() {
	const { data, isLoading, isError, error } = useListBlocks();
	const removeBlock = useRemoveBlock();

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	return (
		<div>
			<h1>Blocks</h1>
			<p>
				<Link to="/blocks/new">New Block</Link>
			</p>
			<table>
				<thead>
					<tr>
						<th>Block type</th>
						<th>Checked</th>
						<th>Position</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data?.items.map((block) => (
						<tr key={block.id}>
							<td>
								<Link to={`/blocks/${block.id}`}>{block.block_type}</Link>
							</td>
							<td>{block.checked}</td>
							<td>{block.position}</td>
							<td>
								<Link to={`/blocks/${block.id}/edit`}>Edit</Link>{" "}
								<button
									type="button"
									disabled={removeBlock.isPending}
									onClick={() => removeBlock.mutate(block.id)}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{removeBlock.isError && <p role="alert">{removeBlock.error.message}</p>}
		</div>
	);
}
