import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { usePageShare, useUpdatePageShare } from "../../api/page_shares";
import type { UpdatePageShare } from "../../bindings/UpdatePageShare";

export function Edit() {
	const navigate = useNavigate();
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = usePageShare(
		isValidId ? id : NaN,
	);
	const updatePageShare = useUpdatePageShare();

	const [form, setForm] = useState<UpdatePageShare | null>(null);

	useEffect(() => {
		if (data) {
			setForm({
				permission: data.permission,
			});
		}
	}, [data]);

	if (!isValidId) {
		return <p role="alert">Invalid page_share id.</p>;
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
		updatePageShare.mutate(
			{ id, data: form },
			{
				onSuccess: () => {
					navigate(`/page_shares/${id}`);
				},
			},
		);
	}

	return (
		<div>
			<h1>Edit PageShare</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="permission">Permission</label>
					<input
						id="permission"
						type="text"
						value={form.permission}
						onChange={(e) => setForm({ ...form, permission: e.target.value })}
						required
					/>
				</div>
				<button type="submit" disabled={updatePageShare.isPending}>
					{updatePageShare.isPending ? "Saving…" : "Save"}
				</button>
				{updatePageShare.error && (
					<p role="alert">{updatePageShare.error.message}</p>
				)}
			</form>
		</div>
	);
}
