import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateWorkspaceMember } from "../../api/workspace_members";
import type { CreateWorkspaceMember } from "../../bindings/CreateWorkspaceMember";

export function New() {
	const navigate = useNavigate();
	const createWorkspaceMember = useCreateWorkspaceMember();

	const [form, setForm] = useState<CreateWorkspaceMember>({
		role: "",
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		createWorkspaceMember.mutate(form, {
			onSuccess: (created) => {
				navigate(`/workspace_members/${created.id}`);
			},
		});
	}

	return (
		<div>
			<h1>New WorkspaceMember</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="role">Role</label>
					<input
						id="role"
						type="text"
						value={form.role}
						onChange={(e) => setForm({ ...form, role: e.target.value })}
						required
					/>
				</div>
				<button type="submit" disabled={createWorkspaceMember.isPending}>
					{createWorkspaceMember.isPending ? "Creating…" : "Create"}
				</button>
				{createWorkspaceMember.error && (
					<p role="alert">{createWorkspaceMember.error.message}</p>
				)}
			</form>
		</div>
	);
}
