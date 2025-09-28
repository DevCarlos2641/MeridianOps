import { Component, DestroyRef, ElementRef, inject, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Api } from "src/app/core/service/api.";
import { Data } from "src/app/core/service/data";
import { Ranch } from "src/app/shared/model/Ranch";
import { EnumRole } from "src/app/shared/model/TableSQL/EnumRole";
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
    selector: 'app-show-assistance-metrics',
    imports: [MatInputModule, MatSelectModule, MatButtonModule, BaseChartDirective],
    templateUrl: './metrics.component.html',
    styleUrl: './metrics.component.scss',
    providers: [provideNativeDateAdapter(), provideCharts(withDefaultRegisterables())]
})
export class AssistanceMetricComponent {

    private readonly data = inject(Data);
    private readonly api = inject(Api);
    private readonly destroyRef = inject(DestroyRef);


    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    barChartData: any;
    barChartOptions: ChartOptions<'bar'>
    grafic = false;


    role: EnumRole;
    currentRanch: Ranch;
    ranchs: Ranch[] = [];

    currentMetric: Metric;
    metrics: Metric[] = [
        { id: 0, type: "Promedio de asistencias" }
    ];
    currentDate: MetricDate;
    dates: MetricDate[] = [
        { id: 0, rango: "2 Semanas" },
        { id: 1, rango: "1 Mes" },
    ]

    ngOnInit() {
        this.role = this.data.user.role;
        this.api.users.getAllRanchs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            const ex = ['Undefine', "INOCUIDAD", "ADMON"]
            this.ranchs = res.filter(v => !ex.includes(v.name));
        });
    }

    trigger() {
        if (!this.currentDate || !this.currentMetric || !this.currentRanch) return
        const id_ranch = this.currentRanch.id;
        const id_metric = this.currentMetric.id;
        const id_date = this.currentDate.id;

        const data = { id_ranch, id_metric, id_date }
        this.api.users.assistanceMetric1(data).subscribe(res => {
            this.setGrafic(res)
        })
    }

    private setGrafic(data: any) {
        const labels = data.map((v: any) => v.dia_semana);
        const avg = data.map((v: any) => Number(v.promedio_empleados));
        const nEmployes = data.map((v: any) => Number(v.total_empleados));
        this.grafic = true;

        this.barChartData = {
            type: 'bar',
            labels: labels,
            datasets: [
                {
                    label: 'Promedio de asistencia',
                    data: [...avg],
                    borderRadius: 8,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderSkipped: false,
                }
            ],
        };

        this.barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { enabled: true },
                title: { display: true, text: `Promedio de asistencia - ${this.currentDate.rango}` },
                datalabels: {
                    anchor: 'end',       // pone el label en el extremo de la barra
                    align: 'end',        // lo alinea arriba
                    formatter: (value: any, context: any) => {
                        const index = context.dataIndex; // índice de la barra
                        const count = nEmployes[index]; // tu array de asistencias por barra
                        return `${value}% - ${count} Asistencias`;
                    },
                    font: { weight: 'bold' },
                    color: '#000'
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 0 }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    max: Math.max(...avg) + 2
                }
            }
        };
    }
}

interface Metric {
    id: number,
    type: string
}

interface MetricDate {
    id: number;
    rango: string
}