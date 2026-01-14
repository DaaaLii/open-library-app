import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Book } from '../../models/book';
import { BookService } from '../../services/book';
import { SearchBarComponent } from '../search-bar/search-bar';

type SearchCriteria = {
  title: string;
  year: number | null;
};

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css'],
})
export class BookListComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly router = inject(Router);

  booksList: Book[] = [];
  filtered: Book[] = [];
  workCount = 0;

  loading = false;
  error: string | null = null;

  // pagination
  page = 1;
  pageSize = 12;

  // filters
  private criteria: SearchCriteria = { title: '', year: null };

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = null;

    this.bookService
      .getBooksList()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: any) => {
          const works: Book[] = Array.isArray(data?.works) ? data.works : [];
          this.booksList = works;
          this.workCount = Number(data?.work_count ?? works.length) || works.length;
          this.applyFilters();
        },
        error: (err) => {
          console.error(err);
          this.error = "Impossible de charger les livres. Vérifie ta connexion / l'API.";
          this.booksList = [];
          this.filtered = [];
          this.workCount = 0;
        },
      });
  }

  onCriteriaChange(criteria: SearchCriteria): void {
    this.criteria = {
      title: (criteria?.title ?? '').trim(),
      year: criteria?.year ?? null,
    };
    this.page = 1;
    this.applyFilters();
  }

  onReset(): void {
    this.criteria = { title: '', year: null };
    this.page = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    const titleNeedle = this.criteria.title.toLowerCase();
    const year = this.criteria.year;

    this.filtered = this.booksList.filter((b) => {
      const titleOk = !titleNeedle || (b.title ?? '').toLowerCase().includes(titleNeedle);
      const yearOk = year == null || Number(b.first_publish_year) === Number(year);
      return titleOk && yearOk;
    });

    // sécurité pagination
    const tp = this.totalPages();
    if (this.page > tp) this.page = tp;
    if (this.page < 1) this.page = 1;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  paged(): Book[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  prev(): void {
    this.page = Math.max(1, this.page - 1);
  }

  next(): void {
    this.page = Math.min(this.totalPages(), this.page + 1);
  }

  trackByKey = (_: number, b: Book) => b.key;

  coverUrl(book: Book): string | null {
    const id = (book as any)?.cover_id;
    if (!id) return null;
    return `https://covers.openlibrary.org/b/id/${id}-M.jpg`;
  }

  onImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    img.src = '';
  }

  openDetails(book: Book): void {
    const id = this.extractId(book.key);
    if (!id) return;
    this.router.navigate(['/book', id]);
  }

  private extractId(key: string): string | null {
    // key: "/works/OL17365W"
    if (!key) return null;
    const parts = key.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : null;
  }
}
