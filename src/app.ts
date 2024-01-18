import express, { json, urlencoded, Express, Response, Request, NextFunction } from 'express';
import cors from 'cors'
import { SampleRouter } from './routers/sample.router';

const PORT = 8000;

export default class App {
  private app: Express; // hanya bisa diakses di class ini

  constructor() {
    this.app = express();
    this.configure()
    this.routes()
    this.handleError()
  }


  private configure(): void {
    this.app.use(cors())
    this.app.use(json())
    this.app.use(urlencoded({extended: true}))
  }

  private handleError(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      res.status(500).json({
        code: 500,
        message: err.message
      })
    })
  }

  private routes():void {
    const sampleRouter = new SampleRouter();
    this.app.use('/samples', sampleRouter.getRouter())
  }


  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`-> [API] local: http://localhost:${PORT}`)
    })
  }
}