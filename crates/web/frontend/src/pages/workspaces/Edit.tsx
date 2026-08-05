import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useWorkspace, useUpdateWorkspace } from "../../api/workspaces";
import type { UpdateWorkspace } from "../../bindings/UpdateWorkspace";

export function Edit() {
	const navigate = useNavigate();
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = useWorkspace(
		isValidId ? id : NaN,
	);
	const updateWorkspace = useUpdateWorkspace();

	const [form, setForm] = useState<UpdateWorkspace | null>(null);

	useEffect(() => {
		if (data) {
			setForm({
				name: data.name,
			});
		}
	}, [data]);

	if (!isValidId) {
		return <p role="alert">Invalid workspace id.</p>;
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
		updateWorkspace.mutate(
			{ id, data: form },
			{
				onSuccess: () => {
					navigate(`/workspaces/${id}`);
				},
			},
		);
	}

	return (
		<div>
			<h1>Edit Workspace</h1>
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
				<button type="submit" disabled={updateWorkspace.isPending}>
					{updateWorkspace.isPending ? "Saving…" : "Save"}
				</button>
				{updateWorkspace.error && (
					<p role="alert">{updateWorkspace.error.message}</p>
				)}
			</form>
		</div>
	);
}
