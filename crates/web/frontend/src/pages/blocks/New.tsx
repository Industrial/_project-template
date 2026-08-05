import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateBlock } from "../../api/blocks";
import type { CreateBlock } from "../../bindings/CreateBlock";

export function New() {
	const navigate = useNavigate();
	const createBlock = useCreateBlock();

	const [form, setForm] = useState<CreateBlock>({
		block_type: "",
		checked: false,
		position: 0,
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		createBlock.mutate(form, {
			onSuccess: (created) => {
				navigate(`/blocks/${created.id}`);
			},
		});
	}

	return (
		<div>
			<h1>New Block</h1>
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
				<button type="submit" disabled={createBlock.isPending}>
					{createBlock.isPending ? "Creating…" : "Create"}
				</button>
				{createBlock.error && <p role="alert">{createBlock.error.message}</p>}
			</form>
		</div>
	);
}
