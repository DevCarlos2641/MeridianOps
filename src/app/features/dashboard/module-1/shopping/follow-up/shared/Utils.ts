import { DestroyRef, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Api } from "src/app/core/service/api.";
import { Data } from "src/app/core/service/data";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";

export class UtilsFollowUp {

    protected readonly data = inject(Data);
    protected readonly router = inject(Router);
    protected readonly dialog = inject(MatDialog);
    protected readonly api = inject(Api);
    protected readonly route = inject(ActivatedRoute)
    protected readonly destroyRef = inject(DestroyRef);
    statusPds = ["En proceso", "Comprado", "Finalizado"];

    backToRequisitions() {
        if (this.data.routerHistory) this.router.navigateByUrl('dashboard/compras/historial');
        else this.router.navigateByUrl('dashboard/compras/requisiciones');
    }

    showErrorDialog(): void {
        const message = "No seleccionó una requisición, por favor seleccione una.";
        this.dialog.open(AlertDialogComponent, {
            data: { message, cancel: false, accept: true }
        });
        this.destroy();
    }

    destroy() {
        this.data.requisitionAssign = new ResponseGetRequisitionFull();
        this.data.voucherProducts.set([]);
    }
}