import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef, OnInit
} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-books-rating-chart',
  standalone: true,
  template: `
    <div style="width: 600px;">
      <canvas #barCanvas width="600" height="400"></canvas>
    </div>
  `
})
export class BooksRatingChartComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('barCanvas', { static: true }) barCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private http: HttpClient) {}
  // On déclare un @Input() data pour recevoir vos objets
   data: Array<{ _id: {bookId:string, title:string}; avgRating: number; reviewCount: number }> = [];
  ngOnInit(): void {
    this.fetchBooksData();
  }
  fetchBooksData(): void {
    // Remplacez l'URL par votre route réelle
    this.http.get<Array<{ _id:  {bookId:string, title:string}; avgRating: number; reviewCount: number }>>('http://localhost:3000/api/books/best-reviews')
      .subscribe({
        next: (data) => {
          this.data = data;
          this.drawChart(); // Dessine le graphique une fois les données reçues
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des données : ', err);
        }
      });
  }
  ngAfterViewInit() {
    // On dessine le chart après que la vue (canvas) soit initialisée
    // (si la data arrive avant, c'est parfait, sinon on redessinera plus tard)
    this.drawChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si la data change, on redessine
    if (changes['data']) {
      this.drawChart();
    }
  }

  drawChart(): void {
    if (!this.barCanvas || !this.data.length) {
      return;
    }

    const canvas = this.barCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Nettoyage du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dimensions du canvas
    const width = canvas.width;
    const height = canvas.height;

    // Trouver la valeur maximum de avgRating
    const maxAvgRating = Math.max(...this.data.map(d => d.avgRating));

    // Marges et espacements
    const margin = 40;
    const barWidth = 40;
    const barSpacing = 30;
    const bottomAxisY = height - margin;

    // Calcul de l'espace total que prendront les barres
    const totalBarsWidth = (barWidth + barSpacing) * this.data.length;
    // On centre éventuellement le premier X
    let startX = (width - totalBarsWidth) / 2;

    // Dessiner l'axe horizontal (base)
    ctx.beginPath();
    ctx.moveTo(margin, bottomAxisY);
    ctx.lineTo(width - margin, bottomAxisY);
    ctx.stroke();

    // Boucle pour dessiner chaque barre
    this.data.forEach((item, index) => {
      // Hauteur de la barre proportionnelle à avgRating
      const barHeight = (item.avgRating / maxAvgRating) * (bottomAxisY - margin);
      const barX = startX + (barWidth + barSpacing) * index;
      const barY = bottomAxisY - barHeight;

      // Dessin de la barre
      ctx.fillStyle = '#4973AE'; // couleur "par défaut"
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Label X : le titre (propriété _id)
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(item._id.title, barX + barWidth / 2, bottomAxisY + 15);

      // Afficher la valeur de avgRating au-dessus de la barre
      ctx.fillText(item.avgRating.toString(), barX + barWidth / 2, barY - 5);
    });
  }
}
