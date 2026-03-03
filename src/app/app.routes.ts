import { Routes } from '@angular/router';

// Lazy loaded routes for each major feature module/screen
export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'setup',
        loadComponent: () => import('./features/setup/setup.component').then(m => m.SetupComponent)
    },
    {
        path: 'play',
        loadComponent: () => import('./features/play/play').then(m => m.Play)
    },
    {
        path: 'vote',
        loadComponent: () => import('./features/vote/vote').then(m => m.Vote)
    },
    {
        path: 'results',
        loadComponent: () => import('./features/results/results').then(m => m.Results)
    },
    {
        path: 'rules',
        loadComponent: () => import('./features/rules/rules').then(m => m.Rules)
    },
    {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then(m => m.Settings)
    },
    { path: '**', redirectTo: '' }
];
