import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { usePage, useUpdatePage } from "../../api/pages";
import type { UpdatePage } from "../../bindings/UpdatePage";

export function Edit() {
	const navigate = useNavigate();
	const { id: idParam } = useParams<{ id: string }>();
	const id = Number(idParam);
	const isValidId = Number.isFinite(id) && id > 0;

	const { data, isLoading, isError, error } = usePage(isValidId ? id : NaN);
	const updatePage = useUpdatePage();

	const [form, setForm] = useState<UpdatePage | null>(null);

	useEffect(() => {
		if (data) {
			setForm({
				title: data.title,
				icon: data.icon,
				position: data.position,
			});
		}
	}, [data]);

	if (!isValidId) {
		return <p role="alert">Invalid page id.</p>;
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
		updatePage.mutate(
			{ id, data: form },
			{
				onSuccess: () => {
					navigate(`/pages/${id}`);
				},
			},
		);
	}

	return (
		<div>
			<h1>Edit Page</h1>
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
				<button type="submit" disabled={updatePage.isPending}>
					{updatePage.isPending ? "Saving…" : "Save"}
				</button>
				{updatePage.error && <p role="alert">{updatePage.error.message}</p>}
			</form>
		</div>
	);
}
