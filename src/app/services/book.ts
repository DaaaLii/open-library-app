import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environments';
import { Book } from '../models/book';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly baseUrl = environment.openLibraryBaseUrl;

  constructor(private http: HttpClient) {}

  /** https://openlibrary.org/subjects/computers.json?limit=...&offset=... */
  getBooksList(limit = 100, offset = 0): Observable<any> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));
    return this.http.get<any>(`${this.baseUrl}/subjects/computers.json`, { params })
      .pipe(catchError(() => of({ works: [], work_count: 0 })));
  }

  /** https://openlibrary.org/works/{id}.json */
  getBookById(id: string): Observable<any> {
    const clean = (id ?? '').trim();
    return this.http.get<any>(`${this.baseUrl}/works/${clean}.json`)
      .pipe(catchError(() => of(null)));
  }

  mapWorkToBook(w: any): Book {
    return {
      key: String(w?.key ?? ''),
      title: String(w?.title ?? ''),
      edition_count: Number(w?.edition_count ?? 0),
      cover_id: Number(w?.cover_id ?? 0),
      first_publish_year: Number(w?.first_publish_year ?? 0)
    };
  }

  /** "/works/OL17365W" -> "OL17365W" */
  extractWorkId(workKey: string): string {
    if (!workKey) return '';
    const parts = workKey.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? '';
  }

  normalizeDescription(desc: any): string {
    if (!desc) return '';
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object' && typeof desc.value === 'string') return desc.value;
    return '';
  }

  filterByTitle(books: Book[], title: string): Book[] {
    const q = (title ?? '').trim().toLowerCase();
    if (!q) return books;
    return books.filter(b => (b.title ?? '').toLowerCase().includes(q));
  }

  filterByYear(books: Book[], year: number | null): Book[] {
    if (year == null || Number.isNaN(year)) return books;
    return books.filter(b => Number(b.first_publish_year) === Number(year));
  }
}
