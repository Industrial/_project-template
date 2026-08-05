import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import type { CreateWorkspaceMember } from "../bindings/CreateWorkspaceMember";
import type { Page } from "../bindings/Page";
import type { WorkspaceMemberDto } from "../bindings/WorkspaceMemberDto";
import type { UpdateWorkspaceMember } from "../bindings/UpdateWorkspaceMember";
import { ApiClientError, del, get, post, put } from "./client";

export interface ListWorkspaceMembersParams {
	page?: number;
	per_page?: number;
}

export const workspaceMemberKeys = {
	all: ["workspace_members"] as const,
	list: (params?: ListWorkspaceMembersParams) =>
		["workspace_members", "list", params ?? {}] as const,
	detail: (id: number) => ["workspace_members", "detail", id] as const,
};

function buildQueryString(params?: ListWorkspaceMembersParams): string {
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

export function useListWorkspaceMembers(
	params?: ListWorkspaceMembersParams,
): UseQueryResult<Page<WorkspaceMemberDto>, ApiClientError> {
	return useQuery({
		queryKey: workspaceMemberKeys.list(params),
		queryFn: () =>
			get<Page<WorkspaceMemberDto>>(
				`/api/workspace_members${buildQueryString(params)}`,
			),
	});
}

export function useWorkspaceMember(
	id: number,
): UseQueryResult<WorkspaceMemberDto, ApiClientError> {
	return useQuery({
		queryKey: workspaceMemberKeys.detail(id),
		queryFn: () => get<WorkspaceMemberDto>(`/api/workspace_members/${id}`),
		enabled: Number.isFinite(id) && id > 0,
	});
}

export function useCreateWorkspaceMember(): UseMutationResult<
	WorkspaceMemberDto,
	ApiClientError,
	CreateWorkspaceMember
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateWorkspaceMember) =>
			post<WorkspaceMemberDto>("/api/workspace_members", data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workspaceMemberKeys.all });
		},
	});
}

export interface UpdateWorkspaceMemberVariables {
	id: number;
	data: UpdateWorkspaceMember;
}

export function useUpdateWorkspaceMember(): UseMutationResult<
	WorkspaceMemberDto,
	ApiClientError,
	UpdateWorkspaceMemberVariables
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: UpdateWorkspaceMemberVariables) =>
			put<WorkspaceMemberDto>(`/api/workspace_members/${id}`, data),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: workspaceMemberKeys.all });
			void queryClient.invalidateQueries({
				queryKey: workspaceMemberKeys.detail(variables.id),
			});
		},
	});
}

export function useRemoveWorkspaceMember(): UseMutationResult<
	void,
	ApiClientError,
	number
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => del(`/api/workspace_members/${id}`),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workspaceMemberKeys.all });
		},
	});
}
