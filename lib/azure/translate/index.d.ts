interface Params {
  [key: string]:
    | string
    | string[]
    | number
    | number[]
    | { text: string }[]
    | undefined;
}

export interface RequestOptions {
  query?: Params;
  body?: Params;
}

export interface TranslationResponse {
  translations: Translation[];
}

interface Translation {
  text: string;
  to: string;
}
