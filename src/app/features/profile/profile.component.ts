import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  // On ajoute ReactiveFormsModule et CommonModule dans "imports" pour pouvoir utiliser les formulaires réactifs
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export default class ProfileComponent {

  readonly #authService = inject(AuthService);

  // Définition du formulaire
  profileForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''] // Vous pouvez y ajouter un Validators.minLength(...) si nécessaire
    });
  }

  onSubmit() {
    // Vérification que le formulaire est valide
    if (this.profileForm.valid) {
      // Appel PUT vers /api/users
      this.http.put('/api/users', this.profileForm.value)
        .subscribe({
          next: (response) => {
            console.log('Mise à jour réussie :', response);
            // Traitez ici la réussite (affichage de notification, etc.)
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour :', err);
            // Traitez ici l’erreur (affichage de message d’erreur, etc.)
          }
        });
    }
  }
}
