import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BackendApiService {
  private baseUrl = environment.backendApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Sends a GET request to the backend API.
   * @template T Response data type
   * @param endpoint API endpoint path (appended to base URL)
   * @param params Optional HttpParams to add query parameters
   * @returns Observable emitting the response data of type T
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, { withCredentials: true, params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Sends a POST request to the backend API.
   * @template T Response data type
   * @template B Request body type
   * @param endpoint API endpoint path (appended to base URL)
   * @param body Request body data of type B
   * @returns Observable emitting the response data of type T
   */
  post<T, B>(endpoint: string, body: B): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  /**
   * Sends a PUT request to the backend API.
   * @template T Response data type
   * @template B Request body type
   * @param endpoint API endpoint path (appended to base URL)
   * @param body Request body data
   * @returns Observable emitting the response data of type T
   */
  put<T, B>(endpoint: string, body: B): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  /**
   * Sends a DELETE request to the backend API.
   * @template T Response data type
   * @param endpoint API endpoint path (appended to base URL)
   * @returns Observable emitting the response data of type T
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  /**
   * Handles HTTP errors for all requests.
   * Logs the error and returns an observable error with a descriptive message.
   * @param error The error response object
   * @returns Observable that throws an error with a message
   */
  private handleError(error: any): Observable<never> {
    console.error('API error:', error);
    let errorMsg = 'Unknown error';

    if (error.error) {
      if (typeof error.error.error === 'string') {
        errorMsg = error.error.message;
      }
    }

    return throwError(() => new Error(errorMsg));
  }
}
