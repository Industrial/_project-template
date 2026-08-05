import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useBlock, useUpdateBlock } from "../../api/blocks";
import type { UpdateBlock } from "../../bindings/UpdateBlock";

export function Edit() {
	const navigate = useNavigate();
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = useBlock(isValidId ? id : NaN);
	const updateBlock = useUpdateBlock();

	const [form, setForm] = useState<UpdateBlock | null>(null);

	useEffect(() => {
		if (data) {
			setForm({
				block_type: data.block_type,
				checked: data.checked,
				position: data.position,
			});
		}
	}, [data]);

	if (!isValidId) {
		return <p role="alert">Invalid block id.</p>;
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
		updateBlock.mutate(
			{ id, data: form },
			{
				onSuccess: () => {
					navigate(`/blocks/${id}`);
				},
			},
		);
	}

	return (
		<div>
			<h1>Edit Block</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="block_type">Block type</label>
					<input
						id="block_type"
						type="text"
						value={form.block_type}
						onChange={(e) => setForm({ ...form, block_type: e.target.value })}
						required
					/>
				</div>
				<div>
					<label htmlFor="checked">Checked</label>
					<input
						id="checked"
						type="checkbox"
						checked={form.checked}
						onChange={(e) => setForm({ ...form, checked: e.target.checked })}
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
				<button type="submit" disabled={updateBlock.isPending}>
					{updateBlock.isPending ? "Saving…" : "Save"}
				</button>
				{updateBlock.error && <p role="alert">{updateBlock.error.message}</p>}
			</form>
		</div>
	);
}
