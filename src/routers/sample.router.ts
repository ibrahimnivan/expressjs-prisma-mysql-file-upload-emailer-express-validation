import { Router } from "express";
import { sampleController } from "../controllers/sample.controller";
import { validateSampleData } from "../middleware/sampleValidation.middleware";
import { uploader } from "../middleware/uploader.middleware";


export class SampleRouter {
  private router: Router;   // private is default unless anoter class needed
  private sampleController: sampleController;

  constructor() {
    this.router = Router();
    this.sampleController = new sampleController(); // haris diatas initializeRoutes
    this.initializeRoutes();
  }


  private initializeRoutes(): void {
    this.router.get("/", this.sampleController.getSampleData);
    this.router.post('/', validateSampleData, this.sampleController.createSampleData)
    this.router.post('/single-upload', uploader("IMG", "/images").single("file"), this.sampleController.addNewImage) // single("file") => file = form data name
    this.router.post('/send-email', this.sampleController.sendEmail)
  }

  getRouter(): Router {
    return this.router;
  }
}