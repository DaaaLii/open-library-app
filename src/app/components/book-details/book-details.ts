import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BookService } from '../../services/book';
import { environment } from '../../../environments/environments';
export class BookDetails { }

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.css']
})
export class BookDetailsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  loading = true;
  error: string | null = null;

  id = '';
  book: any = null;

  constructor(private route: ActivatedRoute, private router: Router, private bookService: BookService) {}

  ngOnInit(): void {
    this.id = String(this.route.snapshot.paramMap.get('id') ?? '').trim();
    if (!this.id) {
      this.loading = false;
      this.error = 'ID manquant.';
      return;
    }

    this.bookService.getBookById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.book = data;
        this.loading = false;
        if (!data) this.error = 'Livre introuvable.';
      });
  }

  back(): void {
    this.router.navigate(['/']);
  }

  coverUrl(): string {
    const coverId = Array.isArray(this.book?.covers) && this.book.covers.length ? this.book.covers[0] : 0;
    return coverId ? `${environment.coversBaseUrl}/${coverId}-L.jpg` : '';
  }

  title(): string { return String(this.book?.title ?? ''); }
  subtitle(): string { return String(this.book?.subtitle ?? ''); }
  desc(): string { return this.bookService.normalizeDescription(this.book?.description); }

  subjects(): string[] {
    return Array.isArray(this.book?.subjects) ? this.book.subjects.slice(0, 18) : [];
  }

  openLibraryUrl(): string {
    return `https://openlibrary.org/works/${this.id}`;
  }
}
