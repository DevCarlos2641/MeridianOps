import { Component, inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { formatDateEs, getPriority, getStatus } from "../../util/FunctionsUtils";
import { MatDividerModule } from "@angular/material/divider";

@Component({
    selector: 'show-products',
    imports: [MatDividerModule],
    templateUrl: './show.products.component.html',
    styleUrl: './show.products.component.scss'
})
export class showProductsComponent {

    readonly dialogRef = inject(MatDialogRef<showProductsComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    readonly products = this.data.products;
    readonly requisition = this.data.requisition;

    formatDateEs(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
        return formatDateEs(date);
    }

    getPriority(value: number) {
        return getPriority(value);
    }

    getStatus(value: number) {
        return getStatus(value)
    }

}