import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('impostor-frontend');

  constructor() {
    const translate = inject(TranslateService);
    translate.addLangs(['es', 'en', 'fr', 'ca']);
    translate.setDefaultLang('es');
    translate.use('es');
  }
}
