import { DestroyRef, inject } from "@angular/core"
import { CanActivateFn, Router } from "@angular/router"
import { Data } from "../service/data";
import { Api } from "../service/api.";
import { catchError, throwError } from "rxjs";
import { User } from "src/app/shared/model/User";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


export const routeGuard: CanActivateFn = async (route, state) => {
    const router = inject(Router);
    const data = inject(Data);
    const api = inject(Api);
    const destroyRef = inject(DestroyRef);

    api.remember().pipe(catchError(error=>{
        router.navigateByUrl('/');
        return  throwError(()=> error);
    }))
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(res=>{
        data.setUser(Object.assign(new User(), res));
    })

    return true;
}