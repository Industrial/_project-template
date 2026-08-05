import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreatePage } from "../../api/pages";
import type { CreatePage } from "../../bindings/CreatePage";

export function New() {
	const navigate = useNavigate();
	const createPage = useCreatePage();

	const [form, setForm] = useState<CreatePage>({
		title: "",
		icon: null,
		position: 0,
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		createPage.mutate(form, {
			onSuccess: (created) => {
				navigate(`/pages/${created.id}`);
			},
		});
	}

	return (
		<div>
			<h1>New Page</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="title">Title</label>
					<input
						id="title"
						type="text"
						value={form.title}
						onChange={(e) => setForm({ ...form, title: e.target.value })}
						required
					/>
				</div>
				<div>
					<label htmlFor="icon">Icon</label>
					<input
						id="icon"
						type="text"
						value={form.icon}
						onChange={(e) => setForm({ ...form, icon: e.target.value })}
					/>
				</div>
				<div>
					<label htmlFor="position">Position</label>
					<input
						id="position"
						type="number"
						value={form.position}
						onChange={(e) =>
							setForm({ ...form, position: Number(e.target.value) })
						}
						required
					/>
				</div>
				<button type="submit" disabled={createPage.isPending}>
					{createPage.isPending ? "Creating…" : "Create"}
				</button>
				{createPage.error && <p role="alert">{createPage.error.message}</p>}
			</form>
		</div>
	);
}
