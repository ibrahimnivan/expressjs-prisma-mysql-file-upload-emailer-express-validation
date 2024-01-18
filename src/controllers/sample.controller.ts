import { Response, Request, NextFunction } from "express";
import prisma from "../prisma/prisma";
import { transporter } from "../helpers/nodemailer.helper";
import { join } from "path";
import { readFile, readFileSync } from "fs";
import Handlebars from "handlebars";

export class sampleController {
  
  async getSampleData(req: Request, res: Response, next: NextFunction) {
    try {
     const sampleData = await prisma.sample.findMany();

      return res.status(200).json({
        code: 200,
        message: "Hello, world",
        data: sampleData
      });
    } catch(error) {
      next(error)  // meneruskan ke error handling di app.ts
    }
  }

  async createSampleData(req: Request, res: Response) {
    const { name, code } = req.body;
    
    const newSampleData = await prisma.sample.create({
      data: {name, code}
    })


    return res.status(200).json({
      code: 200,
      message: "Create sample data success",
      data: newSampleData
    })
  }


  async addNewImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;

      if(!file) throw new Error("No File Uploaded")
      
      return res.status(200).json({
        code: 200,
        message: `file ${file.filename} successfully uploaded`
      })
    } catch(error) {
      next(error)
    }
  }

  async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const templatePath = join(__dirname, "../templates", "template.hbs" )
      const templateSource = readFileSync(templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(templateSource)
      const html = compiledTemplate({name: "Bulan"})



      await transporter.sendMail({
        from: 'nathanrosxhild@gmail.com',
        to: 'backupbelajarcoding@gmail.com',
        subject: 'welcome to the jungle',
        html: html
      })

      return res.status(200).json({
        code: 200,
        message: "Email sent"
      })

    } catch(error) {
      next(error); 
    }
  }
}


