import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import type { CreatePage } from "../bindings/CreatePage";
import type { Page } from "../bindings/Page";
import type { PageDto } from "../bindings/PageDto";
import type { UpdatePage } from "../bindings/UpdatePage";
import { ApiClientError, del, get, post, put } from "./client";

export interface ListPagesParams {
	page?: number;
	per_page?: number;
}

export const pageKeys = {
	all: ["pages"] as const,
	list: (params?: ListPagesParams) => ["pages", "list", params ?? {}] as const,
	detail: (id: number) => ["pages", "detail", id] as const,
};

function buildQueryString(params?: ListPagesParams): string {
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

export function useListPages(
	params?: ListPagesParams,
): UseQueryResult<Page<PageDto>, ApiClientError> {
	return useQuery({
		queryKey: pageKeys.list(params),
		queryFn: () => get<Page<PageDto>>(`/api/pages${buildQueryString(params)}`),
	});
}

export function usePage(id: number): UseQueryResult<PageDto, ApiClientError> {
	return useQuery({
		queryKey: pageKeys.detail(id),
		queryFn: () => get<PageDto>(`/api/pages/${id}`),
		enabled: Number.isFinite(id) && id > 0,
	});
}

export function useCreatePage(): UseMutationResult<
	PageDto,
	ApiClientError,
	CreatePage
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreatePage) => post<PageDto>("/api/pages", data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: pageKeys.all });
		},
	});
}

export interface UpdatePageVariables {
	id: number;
	data: UpdatePage;
}

export function useUpdatePage(): UseMutationResult<
	PageDto,
	ApiClientError,
	UpdatePageVariables
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: UpdatePageVariables) =>
			put<PageDto>(`/api/pages/${id}`, data),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: pageKeys.all });
			void queryClient.invalidateQueries({
				queryKey: pageKeys.detail(variables.id),
			});
		},
	});
}

export function useRemovePage(): UseMutationResult<
	void,
	ApiClientError,
	number
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => del(`/api/pages/${id}`),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: pageKeys.all });
		},
	});
}
