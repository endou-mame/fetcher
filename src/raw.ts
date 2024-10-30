import { fetcher, type FetcherInput, type FetcherOutput } from './transformer';

export const rawFetcher = <ErrorT>(
  input: FetcherInput,
): FetcherOutput<ReadableStream<Uint8Array> | undefined, ErrorT> =>
  fetcher<ReadableStream<Uint8Array> | undefined, ErrorT>(
    input,
    (response) => (response.body === null ? undefined : response.body),
    (response) => response.json(),
  );
