import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
	useWorkspaceMember,
	useUpdateWorkspaceMember,
} from "../../api/workspace_members";
import type { UpdateWorkspaceMember } from "../../bindings/UpdateWorkspaceMember";

export function Edit() {
	const navigate = useNavigate();
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = useWorkspaceMember(
		isValidId ? id : NaN,
	);
	const updateWorkspaceMember = useUpdateWorkspaceMember();

	const [form, setForm] = useState<UpdateWorkspaceMember | null>(null);

	useEffect(() => {
		if (data) {
			setForm({
				role: data.role,
			});
		}
	}, [data]);

	if (!isValidId) {
		return <p role="alert">Invalid workspace_member id.</p>;
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
		updateWorkspaceMember.mutate(
			{ id, data: form },
			{
				onSuccess: () => {
					navigate(`/workspace_members/${id}`);
				},
			},
		);
	}

	return (
		<div>
			<h1>Edit WorkspaceMember</h1>
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
				<button type="submit" disabled={updateWorkspaceMember.isPending}>
					{updateWorkspaceMember.isPending ? "Saving…" : "Save"}
				</button>
				{updateWorkspaceMember.error && (
					<p role="alert">{updateWorkspaceMember.error.message}</p>
				)}
			</form>
		</div>
	);
}
