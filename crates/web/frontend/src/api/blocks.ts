import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import type { CreateBlock } from "../bindings/CreateBlock";
import type { Page } from "../bindings/Page";
import type { BlockDto } from "../bindings/BlockDto";
import type { UpdateBlock } from "../bindings/UpdateBlock";
import { ApiClientError, del, get, post, put } from "./client";

export interface ListBlocksParams {
	page?: number;
	per_page?: number;
}

export const blockKeys = {
	all: ["blocks"] as const,
	list: (params?: ListBlocksParams) =>
		["blocks", "list", params ?? {}] as const,
	detail: (id: number) => ["blocks", "detail", id] as const,
};

function buildQueryString(params?: ListBlocksParams): string {
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

export function useListBlocks(
	params?: ListBlocksParams,
): UseQueryResult<Page<BlockDto>, ApiClientError> {
	return useQuery({
		queryKey: blockKeys.list(params),
		queryFn: () =>
			get<Page<BlockDto>>(`/api/blocks${buildQueryString(params)}`),
	});
}

export function useBlock(id: number): UseQueryResult<BlockDto, ApiClientError> {
	return useQuery({
		queryKey: blockKeys.detail(id),
		queryFn: () => get<BlockDto>(`/api/blocks/${id}`),
		enabled: Number.isFinite(id) && id > 0,
	});
}

export function useCreateBlock(): UseMutationResult<
	BlockDto,
	ApiClientError,
	CreateBlock
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateBlock) => post<BlockDto>("/api/blocks", data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: blockKeys.all });
		},
	});
}

export interface UpdateBlockVariables {
	id: number;
	data: UpdateBlock;
}

export function useUpdateBlock(): UseMutationResult<
	BlockDto,
	ApiClientError,
	UpdateBlockVariables
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: UpdateBlockVariables) =>
			put<BlockDto>(`/api/blocks/${id}`, data),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: blockKeys.all });
			void queryClient.invalidateQueries({
				queryKey: blockKeys.detail(variables.id),
			});
		},
	});
}

export function useRemoveBlock(): UseMutationResult<
	void,
	ApiClientError,
	number
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => del(`/api/blocks/${id}`),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: blockKeys.all });
		},
	});
}
