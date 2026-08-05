import { Link } from "react-router";
import { useListComments, useRemoveComment } from "../../api/comments";

export function List() {
	const { data, isLoading, isError, error } = useListComments();
	const removeComment = useRemoveComment();

	if (isLoading) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	return (
		<div>
			<h1>Comments</h1>
			<p>
				<Link to="/comments/new">New Comment</Link>
			</p>
			<table>
				<thead>
					<tr>
						<th>Body</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{data?.items.map((comment) => (
						<tr key={comment.id}>
							<td>
								<Link to={`/comments/${comment.id}`}>{comment.body}</Link>
							</td>
							<td>
								<Link to={`/comments/${comment.id}/edit`}>Edit</Link>{" "}
								<button
									type="button"
									disabled={removeComment.isPending}
									onClick={() => removeComment.mutate(comment.id)}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{removeComment.isError && (
				<p role="alert">{removeComment.error.message}</p>
			)}
		</div>
	);
}
