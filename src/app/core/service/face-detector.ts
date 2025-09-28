import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';

@Injectable({
    providedIn: 'root'
})
export class FaceDetectorService {
    private modelsLoaded = false;

    async loadModels() {
        if (this.modelsLoaded) return;

        const MODEL_URL = '/assets/models';
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        this.modelsLoaded = true;
        console.log('✅ Modelos de FaceAPI cargados');
    }

    async loadLabeledImages() {
        // Asegura que los modelos estén cargados antes
        if (!this.modelsLoaded) await this.loadModels();

        const labels = ['carlos', 'homero'];
        const labeledDescriptors = [];

        for (const label of labels) {
            const descriptors = [];

            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage(`/assets/labels/${label}/${i}.jpg`);
                const detection = await faceapi
                    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) descriptors.push(detection.descriptor);
                else console.warn(`⚠️ No se detectó rostro en ${label}/${i}.jpg`);
            }

            labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptors));
        }

        return labeledDescriptors;
    }
}
