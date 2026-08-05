import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import type { CreateWorkspace } from "../bindings/CreateWorkspace";
import type { Page } from "../bindings/Page";
import type { WorkspaceDto } from "../bindings/WorkspaceDto";
import type { UpdateWorkspace } from "../bindings/UpdateWorkspace";
import { ApiClientError, del, get, post, put } from "./client";

export interface ListWorkspacesParams {
	page?: number;
	per_page?: number;
}

export const workspaceKeys = {
	all: ["workspaces"] as const,
	list: (params?: ListWorkspacesParams) =>
		["workspaces", "list", params ?? {}] as const,
	detail: (id: number) => ["workspaces", "detail", id] as const,
};

function buildQueryString(params?: ListWorkspacesParams): string {
	if (!params) {
		return "";
	}
	const search = new URLSearchParams();
	if (params.page !== undefined) {
		search.set("page", String(params.page));
	}
	if (params.per_page !== undefined) {
		search.set("per_page", String(params.per_page));
	}
	const qs = search.toString();
	return qs ? `?${qs}` : "";
}

export function useListWorkspaces(
	params?: ListWorkspacesParams,
): UseQueryResult<Page<WorkspaceDto>, ApiClientError> {
	return useQuery({
		queryKey: workspaceKeys.list(params),
		queryFn: () =>
			get<Page<WorkspaceDto>>(`/api/workspaces${buildQueryString(params)}`),
	});
}

export function useWorkspace(
	id: number,
): UseQueryResult<WorkspaceDto, ApiClientError> {
	return useQuery({
		queryKey: workspaceKeys.detail(id),
		queryFn: () => get<WorkspaceDto>(`/api/workspaces/${id}`),
		enabled: Number.isFinite(id) && id > 0,
	});
}

export function useCreateWorkspace(): UseMutationResult<
	WorkspaceDto,
	ApiClientError,
	CreateWorkspace
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateWorkspace) =>
			post<WorkspaceDto>("/api/workspaces", data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
		},
	});
}

export interface UpdateWorkspaceVariables {
	id: number;
	data: UpdateWorkspace;
}

export function useUpdateWorkspace(): UseMutationResult<
	WorkspaceDto,
	ApiClientError,
	UpdateWorkspaceVariables
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: UpdateWorkspaceVariables) =>
			put<WorkspaceDto>(`/api/workspaces/${id}`, data),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
			void queryClient.invalidateQueries({
				queryKey: workspaceKeys.detail(variables.id),
			});
		},
	});
}

export function useRemoveWorkspace(): UseMutationResult<
	void,
	ApiClientError,
	number
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => del(`/api/workspaces/${id}`),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
		},
	});
}
