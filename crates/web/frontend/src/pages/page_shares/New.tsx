import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreatePageShare } from "../../api/page_shares";
import type { CreatePageShare } from "../../bindings/CreatePageShare";

export function New() {
	const navigate = useNavigate();
	const createPageShare = useCreatePageShare();

	const [form, setForm] = useState<CreatePageShare>({
		permission: "",
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		createPageShare.mutate(form, {
			onSuccess: (created) => {
				navigate(`/page_shares/${created.id}`);
			},
		});
	}

	return (
		<div>
			<h1>New PageShare</h1>
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
				<button type="submit" disabled={createPageShare.isPending}>
					{createPageShare.isPending ? "Creating…" : "Create"}
				</button>
				{createPageShare.error && (
					<p role="alert">{createPageShare.error.message}</p>
				)}
			</form>
		</div>
	);
}
