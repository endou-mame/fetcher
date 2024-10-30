import { fetcher, type FetcherInput, type FetcherOutput } from './transformer';

export const jsonFetcher = <SuccessT, ErrorT>(
  input: FetcherInput,
): FetcherOutput<SuccessT, ErrorT> =>
  fetcher<SuccessT, ErrorT>(
    input,
    (response) => response.json(),
    (response) => response.json(),
  );
