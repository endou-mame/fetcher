import { fetcher, type FetcherInput, type FetcherOutput } from './transformer';

export const blobFetcher = <ErrorT>(input: FetcherInput): FetcherOutput<Blob, ErrorT> =>
  fetcher<Blob, ErrorT>(
    input,
    (response) => response.blob(),
    (response) => response.json(),
  );
