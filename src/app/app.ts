import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ApiService } from './core/services/api/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  apiService = inject(ApiService);
  protected readonly title = signal('impostor-frontend');

  constructor() {
    const translate = inject(TranslateService);
    translate.addLangs(['es', 'en', 'fr', 'ca']);
    translate.setDefaultLang('es');
    translate.use('es');
  }
}
