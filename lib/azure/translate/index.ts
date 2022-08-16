import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestOptions, TranslationResponse } from './index.d';
import { v4 as uuidv4 } from 'uuid';
import querystring, { ParsedUrlQueryInput } from 'querystring';

export default class AzureTranslate {
  private baseUrl = 'https://api-eur.cognitive.microsofttranslator.com';

  constructor(private subscriptionKey: string, private region: string) {
    this.subscriptionKey = subscriptionKey;
    this.region = region;
  }

  private async request(
    method: 'GET' | 'POST',
    endpoint: string,
    params?: RequestOptions,
  ): Promise<AxiosResponse> {
    let url = this.baseUrl + endpoint;

    if (params?.query) {
      url += `?${querystring.stringify(params.query as ParsedUrlQueryInput)}`;
    }

    const options: AxiosRequestConfig = {
      url,
      method,
      headers: {
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString(),
        'Ocp-Apim-Subscription-Region': this.region,
      },
    };
    if (params?.body) {
      options.data = JSON.stringify(params.body);
    }
    return axios(options);
  }

  private async get<T>(
    endpoint: string,
    params?: RequestOptions,
  ): Promise<AxiosResponse<T>> {
    return this.request('GET', endpoint, params);
  }

  private async post<T>(
    endpoint: string,
    params?: RequestOptions,
  ): Promise<AxiosResponse<T>> {
    return this.request('POST', endpoint, params);
  }

  async translateStrings(
    text: { text: string }[],
    to: string,
    from?: string,
    type = 'html',
  ): Promise<TranslationResponse[]> {
    const response = await this.post<any>('/translate', {
      body: text as any,
      query: {
        from,
        to,
        'api-version': '3.0',
        textType: type,
      },
    });
    return response.data;
  }
}
