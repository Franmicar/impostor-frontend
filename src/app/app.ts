import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ApiService } from './core/services/api/api.service';
import { ConfirmDialogComponent } from './core/guards/prevent-exit/confirm-dialog.component';
import { ConfirmService } from './core/services/confirm/confirm.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  apiService = inject(ApiService);
  confirmService = inject(ConfirmService);
  protected readonly title = signal('impostor-frontend');

  constructor() {
    const translate = inject(TranslateService);
    translate.addLangs(['es', 'en', 'fr', 'ca']);
    translate.setDefaultLang('es');
    translate.use('es');
  }
}
