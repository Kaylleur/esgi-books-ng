import { Component } from '@angular/core';
import {BooksBarChartComponent} from './books-bar-chart/books-bar-chart.component';
import {BooksRatingChartComponent} from './books-rating-chart/books-rating-chart.component';

@Component({
  selector: 'app-home',
  imports: [BooksBarChartComponent,BooksRatingChartComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export default class HomeComponent {}
