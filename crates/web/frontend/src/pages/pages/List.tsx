import { Link } from "react-router";
import { useListPages, useRemovePage } from "../../api/pages";

export function List() {
	const { data, isLoading, isError, error } = useListPages();
	const removePage = useRemovePage();

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	return (
		<div>
			<h1>Pages</h1>
			<p>
				<Link to="/pages/new">New Page</Link>
			</p>
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>Icon</th>
						<th>Position</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data?.items.map((page) => (
						<tr key={page.id}>
							<td>
								<Link to={`/pages/${page.id}`}>{page.title}</Link>
							</td>
							<td>{page.icon}</td>
							<td>{page.position}</td>
							<td>
								<Link to={`/pages/${page.id}/edit`}>Edit</Link>{" "}
								<button
									type="button"
									disabled={removePage.isPending}
									onClick={() => removePage.mutate(page.id)}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{removePage.isError && <p role="alert">{removePage.error.message}</p>}
		</div>
	);
}
