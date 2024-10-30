import type { DataResponse, ErrorResponse, HttpResponse, NoDataResponse } from './type';

export type TransformResponseInput<SuccessT, ErrorT> = {
  resolveSuccessBody: (response: Response) => Promise<SuccessT> | SuccessT;
  resolveErrorBody: (response: Response) => Promise<ErrorT>;
  throwError: boolean;
};

/**
 * レスポンスデータを加工する
 */
export const transformResponse =
  <SuccessT, ErrorT>(input: TransformResponseInput<SuccessT, ErrorT>) =>
  async (response: Response): Promise<HttpResponse<SuccessT, ErrorT>> => {
    if (!response.ok) {
      // NOTE: 200～299以外のステータスコードはエラーとして扱う

      const errorBody = await input.resolveErrorBody(response);

      const errorResponse = {
        header: Object.fromEntries(response.headers.entries()),
        error: errorBody as ErrorT,
        status: response.status,
      } satisfies ErrorResponse<ErrorT>;

      if (input.throwError) throw errorResponse;

      return errorResponse;
    }

    if (response.status === 204) {
      // NOTE: 204 は No Content なのでデータがない。
      return {
        header: Object.fromEntries(response.headers.entries()),
        status: response.status,
      } satisfies NoDataResponse;
    }

    const successBody = await input.resolveSuccessBody(response);

    return {
      header: Object.fromEntries(response.headers.entries()),
      data: successBody as SuccessT,
      status: response.status,
    } satisfies DataResponse<SuccessT>;
  };

/**
 * レスポンスエラーを加工する
 */
export const transformError = <ErrorT>(error: ErrorT): Promise<ErrorResponse<ErrorT>> => {
  if (error instanceof Error) {
    const errorResponse = {
      header: {},
      error,
      status: -1,
    } satisfies ErrorResponse<ErrorT>;

    return Promise.resolve(errorResponse);
  }

  throw error;
};

export type FetcherInput = {
  info: RequestInfo;
  init?: RequestInit;
  throwError?: boolean;
};

export type FetcherOutput<SuccessT, ErrorT> = Promise<HttpResponse<SuccessT, ErrorT>>;

export const fetcher = <SuccessT, ErrorT>(
  input: FetcherInput,
  resolveSuccessBody: (response: Response) => Promise<SuccessT> | SuccessT,
  resolveErrorBody: (response: Response) => Promise<ErrorT>,
): FetcherOutput<SuccessT, ErrorT> =>
  fetch(input.info, input.init)
    .then(
      transformResponse<SuccessT, ErrorT>({
        resolveSuccessBody,
        resolveErrorBody,
        throwError: input.throwError ?? false,
      }),
    )
    .catch(transformError<ErrorT>);
