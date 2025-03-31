import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-books-bar-chart',
  imports:[],
  standalone: true,
  template: `
    <div style="width: 600px;">
      <canvas #barCanvas width="600" height="400"></canvas>
    </div>
  `
})
export class BooksBarChartComponent implements OnInit, AfterViewInit {
  @ViewChild('barCanvas', { static: true }) barCanvas!: ElementRef<HTMLCanvasElement>;

  booksData: Array<{ _id: string; averagePrice: number; totalBooks: number }> = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBooksData();
  }

  ngAfterViewInit(): void {
    // Le canvas est disponible ici, mais on attend d'avoir les données
    // pour lancer le dessin (dans fetchBooksData -> subscribe).
  }

  fetchBooksData(): void {
    // Remplacez l'URL par votre route réelle
    this.http.get<Array<{ _id: string; averagePrice: number; totalBooks: number }>>('http://localhost:3000/api/books/average-price')
      .subscribe({
        next: (data) => {
          this.booksData = data;
          this.drawChart(); // Dessine le graphique une fois les données reçues
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des données : ', err);
        }
      });
  }

  drawChart(): void {
    if (!this.barCanvas || !this.booksData.length) {
      console.log('no canvas or no data');
      return;
    }

    const canvas = this.barCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('no ctx')
      return;
    }

    // Nettoyage du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dimensions du canvas
    const width = canvas.width;
    const height = canvas.height;

    // On calcule la valeur max pour pouvoir adapter la hauteur des barres
    const maxAvgPrice = Math.max(...this.booksData.map(d => (d.averagePrice||0)));

    // Marges et espacements
    const margin = 40;
    const barWidth = 40;
    const barSpacing = 30; // espace entre les barres
    const bottomAxisY = height - margin;

    // On calcule l'espace total que prendront les barres
    // (barWidth + barSpacing) * nombre d'auteurs - (barSpacing pour la dernière barre, souvent non nécessaire)
    const totalBarsWidth = (barWidth + barSpacing) * this.booksData.length;

    // Position de départ du premier bar en x (pour centrer si besoin)
    let startX = (width - totalBarsWidth) / 2;

    // Couleur et style d'écriture
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';

    // Dessiner l'axe horizontal de base
    ctx.beginPath();
    ctx.moveTo(margin, bottomAxisY);
    ctx.lineTo(width - margin, bottomAxisY);
    ctx.stroke();

    // Boucle sur les données pour dessiner chaque barre
    this.booksData.forEach((item, index) => {
      const barHeight = ((item.averagePrice||0) / maxAvgPrice) * (bottomAxisY - margin);
      // Calcul position Y (plus on va vers le haut, plus on doit soustraire)
      const barX = startX + (barWidth + barSpacing) * index;
      const barY = bottomAxisY - barHeight;

      // Dessiner la barre
      ctx.fillStyle = '#4973AE'; // Couleur de la barre
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Auteur en dessous de la barre (label X)
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(item._id, barX + barWidth / 2, bottomAxisY + 15);

      // Valeur (averagePrice) au dessus de la barre
      ctx.fillText((item.averagePrice||0).toString(), barX + barWidth / 2, barY - 5);
    });
  }
}
