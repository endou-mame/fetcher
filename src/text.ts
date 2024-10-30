import { fetcher, type FetcherInput, type FetcherOutput } from './transformer';

export const blobFetcher = <ErrorT>(input: FetcherInput): FetcherOutput<string, ErrorT> =>
  fetcher<string, ErrorT>(
    input,
    (response) => response.text(),
    (response) => response.json(),
  );
