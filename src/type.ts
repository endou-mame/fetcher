export type HttpStatus = number;

export type ErrorResponse<U> = {
  header: Record<string, string>;
  error: U;
  status: HttpStatus;
};

export type DataResponse<T> = {
  header: Record<string, string>;
  data: T;
  status: HttpStatus;
};

export type NoDataResponse = {
  header: Record<string, string>;
  status: 204;
};

export type HttpResponse<T, U> = DataResponse<T> | NoDataResponse | ErrorResponse<U>;
