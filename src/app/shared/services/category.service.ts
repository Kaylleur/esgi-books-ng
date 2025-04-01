import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  _id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = 'http://localhost:3000/api/categories';
  // Adaptez à votre vrai endpoint

  constructor(private http: HttpClient) {}

  // Récupérer toutes les catégories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  // Récupérer une catégorie
  getCategoryById(categoryId: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${categoryId}`);
  }

  // Créer une catégorie
  createCategory(name: string): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, { name });
  }

  // Mettre à jour une catégorie
  updateCategory(categoryId: string, name: string): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${categoryId}`, { name });
  }

  // Supprimer une catégorie
  deleteCategory(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${categoryId}`);
  }
}
