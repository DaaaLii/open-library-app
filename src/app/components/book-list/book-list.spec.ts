import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { BookListComponent } from './book-list';
import { BookService } from '../../services/book';

describe('BookListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookListComponent, RouterTestingModule],
      providers: [
        {
          provide: BookService,
          useValue: {
            getBooksList: () => of({ work_count: 0, works: [] }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BookListComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
