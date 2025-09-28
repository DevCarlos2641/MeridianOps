import { DestroyRef, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class ErrorLoggingService {

    private url = environment.apiUrl;
    private http = inject(HttpClient);
    private destroyRef = inject(DestroyRef);

    logError(data: any): void {
        this.http.post(`${this.url}/error`, data)

            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => { },
                error: err => console.warn('No se pudo registrar el error', err)
            });
    }
}