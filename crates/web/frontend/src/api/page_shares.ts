import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import type { CreatePageShare } from "../bindings/CreatePageShare";
import type { Page } from "../bindings/Page";
import type { PageShareDto } from "../bindings/PageShareDto";
import type { UpdatePageShare } from "../bindings/UpdatePageShare";
import { ApiClientError, del, get, post, put } from "./client";

export interface ListPageSharesParams {
	page?: number;
	per_page?: number;
}

export const pageShareKeys = {
	all: ["page_shares"] as const,
	list: (params?: ListPageSharesParams) =>
		["page_shares", "list", params ?? {}] as const,
	detail: (id: number) => ["page_shares", "detail", id] as const,
};

function buildQueryString(params?: ListPageSharesParams): string {
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

export function useListPageShares(
	params?: ListPageSharesParams,
): UseQueryResult<Page<PageShareDto>, ApiClientError> {
	return useQuery({
		queryKey: pageShareKeys.list(params),
		queryFn: () =>
			get<Page<PageShareDto>>(`/api/page_shares${buildQueryString(params)}`),
	});
}

export function usePageShare(
	id: number,
): UseQueryResult<PageShareDto, ApiClientError> {
	return useQuery({
		queryKey: pageShareKeys.detail(id),
		queryFn: () => get<PageShareDto>(`/api/page_shares/${id}`),
		enabled: Number.isFinite(id) && id > 0,
	});
}

export function useCreatePageShare(): UseMutationResult<
	PageShareDto,
	ApiClientError,
	CreatePageShare
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreatePageShare) =>
			post<PageShareDto>("/api/page_shares", data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: pageShareKeys.all });
		},
	});
}

export interface UpdatePageShareVariables {
	id: number;
	data: UpdatePageShare;
}

export function useUpdatePageShare(): UseMutationResult<
	PageShareDto,
	ApiClientError,
	UpdatePageShareVariables
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: UpdatePageShareVariables) =>
			put<PageShareDto>(`/api/page_shares/${id}`, data),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: pageShareKeys.all });
			void queryClient.invalidateQueries({
				queryKey: pageShareKeys.detail(variables.id),
			});
		},
	});
}

export function useRemovePageShare(): UseMutationResult<
	void,
	ApiClientError,
	number
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => del(`/api/page_shares/${id}`),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: pageShareKeys.all });
		},
	});
}
