import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
export class SearchBar { }

export interface BookSearchCriteria {
  title: string;
  year: number | null;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css']
})
export class SearchBarComponent {
  title = '';
  yearText = '';

  @Output() criteriaChange = new EventEmitter<BookSearchCriteria>();
  @Output() reset = new EventEmitter<void>();

  emitCriteria(): void {
    const yearRaw = (this.yearText ?? '').trim();
    const year = yearRaw ? Number(yearRaw) : null;

    this.criteriaChange.emit({
      title: this.title ?? '',
      year: year != null && !Number.isNaN(year) ? year : null
    });
  }

  onReset(): void {
    this.title = '';
    this.yearText = '';
    this.reset.emit();
    this.emitCriteria();
  }
}
