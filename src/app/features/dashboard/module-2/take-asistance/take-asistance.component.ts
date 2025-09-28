import { AsyncPipe } from "@angular/common";
import { Component, DestroyRef, ElementRef, inject, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { BehaviorSubject, combineLatest, startWith, debounceTime, distinctUntilChanged, map, catchError, throwError } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { Employed } from "src/app/shared/model/Employed";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FaceDetectorService } from "src/app/core/service/face-detector";
import * as faceapi from 'face-api.js';


@Component({
  selector: 'app-assistance',
  imports: [MatButtonModule, MatIconModule, ReactiveFormsModule, AsyncPipe, MatDividerModule, FormsModule, MatInputModule,
    MatSlideToggleModule
  ],
  templateUrl: './take-asistance.component.html',
  styleUrl: './take-asistance.component.scss',
})
export class AssistanceComponent {

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private readonly api = inject(Api);
  private readonly dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private readonly apiFace = inject(FaceDetectorService);
  faceMatcher: faceapi.FaceMatcher;
  modelsLoaded = false;
  private faceDetectionIntervalId: any = null;
  private mediaStream: MediaStream | null = null;


  currentEmployed: Employed;
  filtre = new FormControl('');
  private allEmployed$ = new BehaviorSubject<Employed[]>([]);
  tardeada = false;
  filteredEmployed$ = combineLatest([
    this.allEmployed$,
    this.filtre.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(value => value?.toLowerCase().trim() || ''),
    )
  ]).pipe(
    map(([employ, searchTerm]) =>
      employ.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm)
      )
    )
  );

  onSelectEmployed(employed: Employed) {
    this.currentEmployed = employed;
  }

  ngOnInit() {
    this.api.users.getEmployedByEnterprise().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.allEmployed$.next(res);
    })
  }

  async ngAfterViewInit() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          deviceId: await this.getSterenCameraId()
        }
      });
      this.video.nativeElement.srcObject = stream;
      this.mediaStream = stream;
    } catch (error) {
      console.error('No se pudo acceder a la cámara:', error);
    }
    // console.log("carga model");
    // await this.apiFace.loadModels(); // si no lo has hecho arriba
    // const labeled = await this.apiFace.loadLabeledImages(); // esto busca la carpeta "carlos"
    // this.faceMatcher = new faceapi.FaceMatcher(labeled, 0.6);
    // console.log("ya cargo");

    // this.startDetectionLoop(); // método nuevo que agregaremos abajo
  }

  startDetectionLoop() {
      this.faceDetectionIntervalId = setInterval(async () => {
      const video = this.video.nativeElement;
      const canvas = faceapi.createCanvasFromMedia(video);
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const bestMatch = this.faceMatcher.findBestMatch(detection.descriptor);
        console.log(`✅ Rostro detectado: ${bestMatch.toString()}`);
      } else {
        console.log('❌ No se detectó ningún rostro');
      }
    }, 1000); // cada segundo
  }


  async getSterenCameraId(): Promise<string | undefined> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');

    const sterenCam = videoDevices.find(device =>
      device.label.toLowerCase().includes('steren') ||
      device.label.toLowerCase().includes('usb') ||
      device.label.toLowerCase().includes('cam')
    );

    return sterenCam?.deviceId;
  }

  ngOnDestroy(): void {
    // Detiene el setInterval
    if (this.faceDetectionIntervalId) {
      clearInterval(this.faceDetectionIntervalId);
      this.faceDetectionIntervalId = null;
    }

    // Detiene el stream de la cámara
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    console.log('🧹 Recursos de asistencia limpiados correctamente.');
  }


  take() {
    if (!this.currentEmployed) return;
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(this.video.nativeElement, 0, 0, 640, 480);
    const imgBase64 = this.canvas.nativeElement.toDataURL('image/png');
    const dialogRef = this.dialog.open(DialogShowAsistance, {
      data: { image: imgBase64, employed: this.currentEmployed, tardeada: this.tardeada },
      width: '700px'
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      let message = res.mensaje;
      const dialog = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
      dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    });
  }

}

@Component({
  selector: 'app-alert.dialog_asistance',
  imports: [MatButtonModule],
  template: `
    <div class="muestra">
        <h2 style="text-align: center;">{{data.employed.name}}</h2>
        <img [src]="data.image" width="500" height="350" />
        <button matButton="filled" (click)="save()">Guardar</button>
    </div>
  `,
  styles: `
    .muestra{
      padding: 30px;
      text-align: center;
      button{
        margin-top: 20px;
      }
    }
  `
})
export class DialogShowAsistance {
  readonly dialogRef = inject(MatDialogRef<DialogShowAsistance>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  private readonly api = inject(Api);
  private destroyRef = inject(DestroyRef);

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  save() {
    const formData = new FormData();
    const blob = this.dataURLtoBlob(this.data.image);
    formData.append('id_user', this.data.employed.id);
    formData.append('foto', blob, 'foto.jpg');
    formData.append('tardeada', this.data.tardeada);
    this.api.users.assitancePhoto(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(
        catchError((error) => {
          // Extraer el mensaje del backend si existe
          const mensaje = error?.error?.error || 'Error desconocido';
          this.dialogRef.close({ ok: false, mensaje });
          return throwError(() => error);
        })
      )
      .subscribe(res => {
        if (res) this.dialogRef.close({ ok: true, ...res });
      });

  }

  dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)![1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
  }
}