import { TitleCasePipe } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { DialogImage } from "../dialog.image/DialogImage";

@Component({
    selector: 'app-tabla-p-v',
    templateUrl: './table.requisition.component.html',
    styleUrl: './table.requisition.component.scss',
    imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatIcon]
})
export class TablePVComponent {

    private _dataSource = new MatTableDataSource<any>();
    private readonly dialog = inject(MatDialog);

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @Output() rowClick = new EventEmitter<any>();
    @Input() columns: string[] = [];
    @Input() set dataSource(value: MatTableDataSource<any>) {
        this._dataSource = value;
        this.setDataSourceDependencies();
    }

    get dataSource(): MatTableDataSource<any> {
        return this._dataSource;
    }

    traducirColumna(campo: string): string {
        const traducciones: Record<string, string> = {
            economic_number: 'Numero',
            name: 'Nombre',
            application: 'Aplicación',
            unit: 'Unidad',
            description: 'Descripción',
            enterprise_name: 'Empresa',
            type: 'Tipo',
            brand: 'Marca',
            model: 'Modelo',
            active: 'Activo',
            status: 'Estado',
            image: 'Imagen'
        };

        return traducciones[campo] ?? campo;
    }

    ngAfterViewInit() {
        this.setDataSourceDependencies();
    }

    showImage(url: string){
        const dialogRef = this.dialog.open(DialogImage, {data:url});
    }

    private setDataSourceDependencies() {
        if (this._dataSource && this.paginator && this.sort) {
            this._dataSource.paginator = this.paginator;
            this._dataSource.sort = this.sort;
        }
    }

    onRowClick(row: any) {
        this.rowClick.emit(row);
    }

}

