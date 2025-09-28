import { Component, DestroyRef, inject, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIcon } from "@angular/material/icon";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Api } from "src/app/core/service/api.";
import { Data } from "src/app/core/service/data";
import { Ranch } from "src/app/shared/model/Ranch";
import { EnumRole } from "src/app/shared/model/TableSQL/EnumRole";
import { formatDateEs } from "src/app/shared/util/FunctionsUtils";
import { environment } from "src/environments";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-show-assistance',
  imports: [MatTableModule, MatPaginatorModule, MatSelectModule, MatIcon, MatDatepickerModule, ReactiveFormsModule, MatTabsModule, MatSortModule,
    MatButtonModule, RouterLink
  ],
  templateUrl: './show.assistance.component.html',
  styleUrl: './show.assistance.component.scss',
  providers: [provideNativeDateAdapter()]
})
export class ShowAssistanceComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('matPaginator') paginator2: MatPaginator;
  @ViewChild('matPaginator2') paginator3: MatPaginator;
  @ViewChild('sort') sort!: MatSort;
  @ViewChild('sort1') sort1!: MatSort;

  private readonly api = inject(Api)
  private readonly data = inject(Data);
  dataSource = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  dataSource3 = new MatTableDataSource<any>();
  columns = ['name', 'position', 'created_at', 'map'];
  columns2 = ['name_enterprise', 'name', 'position', 'input', 'output'];
  rangeForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  url = '';
  urlImage = '';
  role: EnumRole;
  currentRanch: Ranch;
  ranchs: Ranch[] = [];

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.url = environment.apiUrl;
    this.role = this.data.user.role;
    if (this.role == EnumRole.ADMIN)
      this.columns2.push('photo')
    this.api.users.getAllRanchs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      const ex = ['Undefine', "INOCUIDAD", "ADMON"]
      this.ranchs = res.filter(v=> !ex.includes(v.name));
    });

    const date = new Date().toLocaleDateString('es-MX', {
      timeZone: 'America/Mexico_City', // Zona horaria de Guadalajara
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');
    const data = {
      start: date,
      end: date
    };
    this.rangeForm.disable();
    this.getAssistances(data);
  }

  changeRanch() {
    this.rangeForm.enable();
    this.onDateRangeSelected();
  }

  private getAssistances(date: any) {
    this.api.users.getAssistances(date).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
    })
  }

  getAssistancesField(data: any, id_ranch: number) {
    this.api.users.getAssistancesField(data, id_ranch).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.dataSource2 = new MatTableDataSource(res);
      this.dataSource2.paginator = this.paginator2;
      this.dataSource2.sort = this.sort;
    })
  }

  getAssistanceFieldT(data: any, id_ranch: number) {
    this.api.users.getAssistancesFieldT(data, id_ranch).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (!res) return;
      this.dataSource3 = new MatTableDataSource(res);
      this.dataSource3.paginator = this.paginator3;
      this.dataSource3.sort = this.sort1;
    })
  }

  getUrl(item: any) {
    if (item.input) {
      const date = item.input.split(' ')[0];
      return `${this.url}/files/assitance/user_${item.id_user}_${date}_input.jpg`;
    }
    if (item.output) {
      const date = item.output.split(' ')[0];
      return `${this.url}/files/assitance/user_${item.id_user}_${date}_output.jpg`
    }
    return '';
  }

  getUrlT(item: any) {
    if (item.input) {
      const date = item.input.split(' ')[0];
      return `${this.url}/files/assitance/tardeada/user_${item.id_user}_${date}_input.jpg`
    }
    if (item.output) {
      const date = item.input.split(' ')[0];
      return `${this.url}/files/assitance/tardeada/user_${item.id_user}_${date}_output.jpg`
    }
    return '';
  }

  getDate(date: string) {
    let hours = date.split(' ')[1];
    const format = formatDateEs(date);
    hours = this.convertirHora12(hours);
    return `${format} - ${hours}`;
  }

  convertirHora12(hora24: string): string {
    const [hora, minutos, segundos] = hora24.split(':').map(Number);
    const date = new Date();
    date.setHours(hora, minutos, segundos);

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  abrirEnGoogleMaps(lat: number, lng: number): void {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }

  onDateRangeSelected() {
    const startDate = this.rangeForm.value.start;
    const endDate = this.rangeForm.value.end;
    if (!startDate || !endDate) return;
    if (startDate > endDate) return;
    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    this.processDateRange(startStr, endStr);
  }

  // Función para formatear Date a yyyy-mm-dd
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  processDateRange(start: string, end: string) {
    const data = {
      start: start,
      end: end
    };
    this.getAssistances(data);
    this.getAssistancesField(data, this.currentRanch.id);
    this.getAssistanceFieldT(data, this.currentRanch.id);
  }

  exportToPDF(type: number): void {
    const doc = new jsPDF();

    let columns: string[] = [];
    let dataSource: MatTableDataSource<any>;
    let title: String;

    // Traducciones de columnas
    const columnTranslations: Record<string, string> = {
      name: 'Nombre',
      position: 'Puesto',
      created_at: 'Fecha de registro',
      name_enterprise: 'Empresa',
      input: 'Entrada',
      output: 'Salida'
    };

    // Selecciona columnas y dataSource dependiendo del tab
    if (type === 0) {
      title = `Lista de asistencia en Oficinas`;
      columns = this.columns.filter(col => col !== 'map'); // quitamos map
      dataSource = this.dataSource;
    } else if (type === 1) {
      title = `Lista de asistencia en el rancho: ${this.currentRanch.name}`;
      columns = this.columns2.filter(col => col !== 'photo' && col !== 'name_enterprise');
      dataSource = this.dataSource2;
    } else {
      title = `Lista de asistencia tardeadas en el rancho: ${this.currentRanch.name}`;
      columns = this.columns2.filter(col => col !== 'photo' && col !== 'name_enterprise');
      dataSource = this.dataSource3;
    }

    doc.text(`${title}`, 14, 10);

    // Definir columnas para autoTable
    const tableColumns = columns.map(col => ({
      header: columnTranslations[col] || col,
      dataKey: col
    }));

    // Mapeo de datos para el body
    const tableData = dataSource.data.map(row => {
      const obj: any = {};
      columns.forEach(col => {
        obj[col] = row[col];
      });
      return obj;
    });

    autoTable(doc, {
      columns: tableColumns,
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { top: 20 }
    });

    doc.save(`Reporte de asistencias.pdf`);
  }

  exportToExcel(type: number): void {
    let columns: string[] = [];
    let dataSource: any;
    let title: string;

    const columnTranslations: Record<string, string> = {
      name: 'Nombre',
      position: 'Puesto',
      created_at: 'Fecha de registro',
      name_enterprise: 'Empresa',
      input: 'Entrada',
      output: 'Salida'
    };

    // Selección según tipo
    if (type === 0) {
      title = `Lista de asistencia en Oficinas`;
      columns = this.columns.filter(col => col !== 'map');
      dataSource = this.dataSource.data;
    } else if (type === 1) {
      title = `Lista de asistencia en el rancho: ${this.currentRanch.name}`;
      columns = this.columns2.filter(col => col !== 'photo' && col !== 'name_enterprise');
      dataSource = this.dataSource2.data;
    } else {
      title = `Lista de asistencia tardeadas en el rancho: ${this.currentRanch.name}`;
      columns = this.columns2.filter(col => col !== 'photo' && col !== 'name_enterprise');
      dataSource = this.dataSource3.data;
    }

    // Mapeo de datos con traducción de encabezados
    const excelData = dataSource.map((row: any) => {
      const obj: any = {};
      columns.forEach(col => {
        obj[columnTranslations[col] || col] = row[col];
      });
      return obj;
    });

    // Crear hoja y libro
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Reporte': worksheet },
      SheetNames: ['Reporte']
    };

    // Guardar archivo
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, `Reporte de asistencias.xlsx`);
  }
}