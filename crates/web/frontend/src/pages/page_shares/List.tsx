import { Link } from "react-router";
import { useListPageShares, useRemovePageShare } from "../../api/page_shares";

export function List() {
	const { data, isLoading, isError, error } = useListPageShares();
	const removePageShare = useRemovePageShare();

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	return (
		<div>
			<h1>PageShares</h1>
			<p>
				<Link to="/page_shares/new">New PageShare</Link>
			</p>
			<table>
				<thead>
					<tr>
						<th>Permission</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data?.items.map((pageShare) => (
						<tr key={pageShare.id}>
							<td>
								<Link to={`/page_shares/${pageShare.id}`}>
									{pageShare.permission}
								</Link>
							</td>
							<td>
								<Link to={`/page_shares/${pageShare.id}/edit`}>Edit</Link>{" "}
								<button
									type="button"
									disabled={removePageShare.isPending}
									onClick={() => removePageShare.mutate(pageShare.id)}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{removePageShare.isError && (
				<p role="alert">{removePageShare.error.message}</p>
			)}
		</div>
	);
}
