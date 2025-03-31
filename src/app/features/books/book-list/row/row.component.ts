import { Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book } from '../../../../shared/interfaces/book.interface';

@Component({
  selector: 'app-row',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './row.component.html',
  styleUrl: './row.component.css',
  standalone:true,
})
export class RowComponent {
  book = input.required<Book>();
}
