import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateComment } from "../../api/comments";
import type { CreateComment } from "../../bindings/CreateComment";

export function New() {
	const navigate = useNavigate();
	const createComment = useCreateComment();

	const [form, setForm] = useState<CreateComment>({
		body: "",
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		createComment.mutate(form, {
			onSuccess: (created) => {
				navigate(`/comments/${created.id}`);
			},
		});
	}

	return (
		<div>
			<h1>New Comment</h1>
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
				<button type="submit" disabled={createComment.isPending}>
					{createComment.isPending ? "Creating…" : "Create"}
				</button>
				{createComment.error && (
					<p role="alert">{createComment.error.message}</p>
				)}
			</form>
		</div>
	);
}
