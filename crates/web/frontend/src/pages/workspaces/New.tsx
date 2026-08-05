import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateWorkspace } from "../../api/workspaces";
import type { CreateWorkspace } from "../../bindings/CreateWorkspace";

export function New() {
	const navigate = useNavigate();
	const createWorkspace = useCreateWorkspace();

	const [form, setForm] = useState<CreateWorkspace>({
		name: "",
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		createWorkspace.mutate(form, {
			onSuccess: (created) => {
				navigate(`/workspaces/${created.id}`);
			},
		});
	}

	return (
		<div>
			<h1>New Workspace</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="name">Name</label>
					<input
						id="name"
						type="text"
						value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
						required
					/>
				</div>
				<button type="submit" disabled={createWorkspace.isPending}>
					{createWorkspace.isPending ? "Creating…" : "Create"}
				</button>
				{createWorkspace.error && (
					<p role="alert">{createWorkspace.error.message}</p>
				)}
			</form>
		</div>
	);
}
