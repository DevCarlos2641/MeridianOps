import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { ErrorLoggingService } from "../service/errorLoggingService";
import { MatDialog } from "@angular/material/dialog";
import { LoadingDialogService } from "../service/loading-dialog.service";

export const HttpOnlyInterceptor: HttpInterceptorFn = (req, next) => {

    const errorService = inject(ErrorLoggingService);
    const dialog = inject(MatDialog);
    const loadingDialog = inject(LoadingDialogService);

    if (req.url.includes('asistencia.php')) {
        req = req.clone({
            withCredentials: false
        })
    } else req = req.clone({
        withCredentials: true
    })

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            loadingDialog.close();
            const esLlamadaAlLogger = req.url.includes('/error');
            if (!esLlamadaAlLogger) {
                // errorService.logError({
                //     message: error.message,
                //     status: error.status,
                //     url: req.url,
                //     method: req.method,
                //     timestamp: new Date(),
                //     error: typeof error.error === 'string' ? error.error : JSON.stringify(error.error)
                // });
                // const message = "Algo salio mal, intente de nuevo."
                // dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
            }
            return throwError(() => error);
        }));
};