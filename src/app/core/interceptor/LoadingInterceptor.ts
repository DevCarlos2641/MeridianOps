import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { LoadingDialogService } from '../service/loading-dialog.service';

let requestsInProgress = 0;
let openTimeout: any;
let dialogOpened = false;

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  const loadingDialog = inject(LoadingDialogService);

  if (requestsInProgress === 0) {
    openTimeout = setTimeout(() => {
      loadingDialog.open();
      dialogOpened = true;
    }, 1000);
  }

  requestsInProgress++;

  return next(req).pipe(
    tap({
      next: () => {},
      error: () => {}
    }),
    finalize(() => {
      requestsInProgress--;

      if (requestsInProgress === 0) {
        clearTimeout(openTimeout);

        if (dialogOpened) {
          loadingDialog.close();
          dialogOpened = false;
        }
      }
    })
  );
};
