import { FetcherError } from './error';
import { fetcher, type FetcherInput, type FetcherOutput } from './transformer';

export const fileFetcher = <ErrorT>(input: FetcherInput): FetcherOutput<File, ErrorT> =>
  fetcher<File, ErrorT>(
    input,
    (response) => {
      const contentType = response.headers.get('Content-Type');
      if (!contentType) {
        throw new FetcherError('😇 Not found Content-Type header');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      if (!contentDisposition) {
        throw new FetcherError('😇 Not found Content-Disposition header');
      }

      if (!contentDisposition.startsWith('attachment')) {
        // NOTE: 「Content-Disposition が無いまたは attachment が含まれていない」＝「ファイル名が無い」なので。
        throw new FetcherError('😇 Not found filename in Content-Disposition header');
      }

      const file = response.blob().then((blob) => {
        // NOTE: filename* がある場合は、その値を使う。なければ filename を使う。(※RFC 6266 より)
        // filename* には UTF-8 でエンコードされたファイル名が入っている。
        const encodedFileName = contentDisposition.match(
          /attachment; .*\s*filename\*=UTF-8|utf-8''(.*)\s*/u,
        )?.[1];

        if (encodedFileName) {
          const decodeFileName = decodeURIComponent(encodedFileName);
          return new File([blob], decodeFileName, { type: contentType });
        }

        // NOTE: Laravel君がスペースが含まれているときだけダブルクォーテーションで囲むので、それに対応するための正規表現。
        // （全部のパターンダブルクオーテーションで囲んでくれたら楽なんだけど…）
        const noEncodedFileName = contentDisposition.match(
          /attachment; filename=(".*\s*.*"|.*)/u,
        )?.[1];
        if (noEncodedFileName) {
          const decodeFileName = decodeURIComponent(noEncodedFileName);
          return new File([blob], decodeFileName, { type: contentType });
        }

        return new File([blob], 'unknown-filename', { type: contentType });
      });

      return Promise.resolve(file);
    },
    (response) => response.json(),
  );
