/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface History {
  /** ID */
  id?: number;
  /** Owner */
  owner?: string;
  /** Moderator */
  moderator?: string;
  /** Status */
  status?: string;
  /** Films */
  films?: string;
  /**
   * Дата создания
   * @format date-time
   */
  date_created?: string | null;
  /**
   * Дата формирования
   * @format date-time
   */
  date_formation?: string | null;
  /**
   * Дата завершения
   * @format date-time
   */
  date_complete?: string | null;
  /**
   * Date
   * @format date-time
   */
  date?: string | null;
  /**
   * Estimation
   * @min -2147483648
   * @max 2147483647
   */
  estimation?: number | null;
}

export interface FilmHistory {
  /** ID */
  id?: number;
  /**
   * Viewed
   * @min -2147483648
   * @max 2147483647
   */
  viewed?: number;
  /** Film */
  film?: number | null;
  /** History */
  history?: number | null;
}

export interface UserLogin {
  /**
   * Username
   * @minLength 1
   */
  username: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
}

export interface UserRegister {
  /** ID */
  id?: number;
  /**
   * Адрес электронной почты
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * Пароль
   * @minLength 1
   * @maxLength 128
   */
  password: string;
  /**
   * Имя пользователя
   * Обязательное поле. Не более 150 символов. Только буквы, цифры и символы @/./+/-/_.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
}

export interface UserProfile {
  /**
   * Username
   * @minLength 1
   */
  username?: string;
  /**
   * Email
   * @minLength 1
   */
  email?: string;
  /**
   * Password
   * @minLength 1
   */
  password?: string;
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "http://localhost:8000/api" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Snippets API
 * @version v1
 * @license BSD License
 * @termsOfService https://www.google.com/policies/terms/
 * @baseUrl http://localhost:8000/api
 * @contact <contact@snippets.local>
 *
 * Test description
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  films = {
    /**
     * No description
     *
     * @tags films
     * @name FilmsList
     * @request GET:/films/
     * @secure
     */
    filmsList: (
      query?: {
        film_name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/films/`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags films
     * @name FilmsCreateCreate
     * @request POST:/films/create/
     * @secure
     */
    filmsCreateCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/films/create/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags films
     * @name FilmsRead
     * @request GET:/films/{film_id}/
     * @secure
     */
    filmsRead: (filmId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/films/${filmId}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags films
     * @name FilmsAddToHistoryCreate
     * @request POST:/films/{film_id}/add_to_history/
     * @secure
     */
    filmsAddToHistoryCreate: (filmId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/films/${filmId}/add_to_history/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags films
     * @name FilmsDeleteDelete
     * @request DELETE:/films/{film_id}/delete/
     * @secure
     */
    filmsDeleteDelete: (filmId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/films/${filmId}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags films
     * @name FilmsUpdateUpdate
     * @request PUT:/films/{film_id}/update/
     * @secure
     */
    filmsUpdateUpdate: (filmId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/films/${filmId}/update/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags films
     * @name FilmsUpdateImageCreate
     * @request POST:/films/{film_id}/update_image/
     * @secure
     */
    filmsUpdateImageCreate: (filmId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/films/${filmId}/update_image/`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  historys = {
    /**
     * No description
     *
     * @tags historys
     * @name HistorysList
     * @request GET:/historys/
     * @secure
     */
    historysList: (
      query?: {
        status?: string;
        date_formation_start?: string;
        date_formation_end?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/historys/`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags historys
     * @name HistorysRead
     * @request GET:/historys/{history_id}/
     * @secure
     */
    historysRead: (historyId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/historys/${historyId}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags historys
     * @name HistorysStatuses
     * @request GET:/historys/{history_id}/
     * @secure
     */
    historysStatuses: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/historys/statuses/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags historys
     * @name HistorysDeleteDelete
     * @request DELETE:/historys/{history_id}/delete/
     * @secure
     */
    historysDeleteDelete: (historyId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/historys/${historyId}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags historys
     * @name HistorysDeleteFilmDelete
     * @request DELETE:/historys/{history_id}/delete_film/{film_id}/
     * @secure
     */
    historysDeleteFilmDelete: (historyId: string, filmId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/historys/${historyId}/delete_film/${filmId}/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags historys
     * @name HistorysUpdateUpdate
     * @request PUT:/historys/{history_id}/update/
     * @secure
     */
    historysUpdateUpdate: (historyId: string, data: History, params: RequestParams = {}) =>
      this.request<History, any>({
        path: `/historys/${historyId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags historys
     * @name HistorysUpdateFilmUpdate
     * @request PUT:/historys/{history_id}/update_film/{film_id}/
     * @secure
     */
    historysUpdateFilmUpdate: (historyId: string, filmId: string, data: FilmHistory, params: RequestParams = {}) =>
      this.request<FilmHistory, any>({
        path: `/historys/${historyId}/update_film/${filmId}/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags historys
     * @name HistorysUpdateStatusAdminUpdate
     * @request PUT:/historys/{history_id}/update_status_admin/
     * @secure
     */
    historysUpdateStatusAdminUpdate: (historyId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/historys/${historyId}/update_status_admin/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags historys
     * @name HistorysUpdateStatusUserUpdate
     * @request PUT:/historys/{history_id}/update_status_user/
     * @secure
     */
    historysUpdateStatusUserUpdate: (historyId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/historys/${historyId}/update_status_user/`,
        method: "PUT",
        secure: true,
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags users
     * @name UsersLoginCreate
     * @request POST:/users/login/
     * @secure
     */
    usersLoginCreate: (data: UserLogin, params: RequestParams = {}) =>
      this.request<UserLogin, any>({
        path: `/users/login/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersLogoutCreate
     * @request POST:/users/logout/
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/logout/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersRegisterCreate
     * @request POST:/users/register/
     * @secure
     */
    usersRegisterCreate: (data: UserRegister, params: RequestParams = {}) =>
      this.request<UserRegister, any>({
        path: `/users/register/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersUpdateUpdate
     * @request PUT:/users/{user_id}/update/
     * @secure
     */
    usersUpdateUpdate: (userId: string, data: UserProfile, params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/users/${userId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
