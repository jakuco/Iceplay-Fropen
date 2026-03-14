// presentation/files/routes.ts
import { Router } from "express";
import multer from "multer";
import { FileController } from "./controller";
import { FileService } from "$presentation/services/file.service";
import { StorageService } from "$presentation/services/storage.service";
// import { AuthMiddleware } from "../middlewares/auth.middleware"; // si lo necesitas

export class FileRoutes {
  static get routes(): Router {
    const router = Router();

    // Inicializar servicios
    const storageService = new StorageService();
    const fileService = new FileService(storageService);
    const fileController = new FileController(fileService);

    // Configurar multer para almacenar archivos en memoria (buffer)
    const upload = multer({ storage: multer.memoryStorage() });

    // Rutas públicas o con autenticación (ajusta según tu caso)
    // router.use(AuthMiddleware.validateJWT); // si todas requieren token

    // Endpoint para subir archivo normal
    router.post("/upload", upload.single("file"), fileController.uploadFile);

    // Endpoint para descargar archivo
    router.get('/download/:key', fileController.downloadFile);

    // Endpoint para subir y comprimir
    router.post("/upload/compressed", upload.single("file"), fileController.uploadCompressedFile);

    // Endpoint para descargar y descomprimir
    router.get('/download/compressed/:key', fileController.downloadDecompressedFile);

    return router;
  }
}