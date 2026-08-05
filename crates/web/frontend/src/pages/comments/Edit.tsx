import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useComment, useUpdateComment } from "../../api/comments";
import type { UpdateComment } from "../../bindings/UpdateComment";

export function Edit() {
	const navigate = useNavigate();
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = useComment(isValidId ? id : NaN);
	const updateComment = useUpdateComment();

	const [form, setForm] = useState<UpdateComment | null>(null);

	useEffect(() => {
		if (data) {
			setForm({
				body: data.body,
			});
		}
	}, [data]);

	if (!isValidId) {
		return <p role="alert">Invalid comment id.</p>;
	}

	if (isLoading || !form) {
		return <p>Loading…</p>;
	}

	if (isError) {
		return <p role="alert">{error.message}</p>;
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!form) {
			return;
		}
		updateComment.mutate(
			{ id, data: form },
			{
				onSuccess: () => {
					navigate(`/comments/${id}`);
				},
			},
		);
	}

	return (
		<div>
			<h1>Edit Comment</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="body">Body</label>
					<textarea
						id="body"
						value={form.body}
						onChange={(e) => setForm({ ...form, body: e.target.value })}
						required
					/>
				</div>
				<button type="submit" disabled={updateComment.isPending}>
					{updateComment.isPending ? "Saving…" : "Save"}
				</button>
				{updateComment.error && (
					<p role="alert">{updateComment.error.message}</p>
				)}
			</form>
		</div>
	);
}
