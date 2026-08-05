import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import type { CreateComment } from "../bindings/CreateComment";
import type { Page } from "../bindings/Page";
import type { CommentDto } from "../bindings/CommentDto";
import type { UpdateComment } from "../bindings/UpdateComment";
import { ApiClientError, del, get, post, put } from "./client";

export interface ListCommentsParams {
	page?: number;
	per_page?: number;
}

export const commentKeys = {
	all: ["comments"] as const,
	list: (params?: ListCommentsParams) =>
		["comments", "list", params ?? {}] as const,
	detail: (id: number) => ["comments", "detail", id] as const,
};

function buildQueryString(params?: ListCommentsParams): string {
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

export function useListComments(
	params?: ListCommentsParams,
): UseQueryResult<Page<CommentDto>, ApiClientError> {
	return useQuery({
		queryKey: commentKeys.list(params),
		queryFn: () =>
			get<Page<CommentDto>>(`/api/comments${buildQueryString(params)}`),
	});
}

export function useComment(
	id: number,
): UseQueryResult<CommentDto, ApiClientError> {
	return useQuery({
		queryKey: commentKeys.detail(id),
		queryFn: () => get<CommentDto>(`/api/comments/${id}`),
		enabled: Number.isFinite(id) && id > 0,
	});
}

export function useCreateComment(): UseMutationResult<
	CommentDto,
	ApiClientError,
	CreateComment
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateComment) =>
			post<CommentDto>("/api/comments", data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: commentKeys.all });
		},
	});
}

export interface UpdateCommentVariables {
	id: number;
	data: UpdateComment;
}

export function useUpdateComment(): UseMutationResult<
	CommentDto,
	ApiClientError,
	UpdateCommentVariables
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: UpdateCommentVariables) =>
			put<CommentDto>(`/api/comments/${id}`, data),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: commentKeys.all });
			void queryClient.invalidateQueries({
				queryKey: commentKeys.detail(variables.id),
			});
		},
	});
}

export function useRemoveComment(): UseMutationResult<
	void,
	ApiClientError,
	number
> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => del(`/api/comments/${id}`),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: commentKeys.all });
		},
	});
}
