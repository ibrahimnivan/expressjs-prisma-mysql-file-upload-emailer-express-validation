11-data-validation-emailer

## 1. GETTING STARTED
1.1 Install Dependency
- typescript
- @types/node

1.2 tsconfig.json
- outDir = ./dist

1.2 package.json scripts
```json
  "scripts": {
    "buid": "tsc",                                   
    "start": "npm run build && node dist/index.js",  \
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

## 3. INSTALL ANOTHER DEPENDECIES
- npm i express cors
- npm i -D @types/cors nodemon ts-node => nodemon & ts-node sepaket
>>>   "dev": "nodemon src/index.ts", ---> ngga pelu build dulu dengan ts-node

## 4. CREATE class App
```ts
    export default class App {
      private app: Express; // hanya bisa diakses di class ini

      constructor() {
        this.app = express();
        this.configure()
      }

      private configure(): void {
        this.app.use(cors())
        this.app.use(json())
        this.app.use(urlencoded({extended: true}))
      }

      public start(): void {
        this.app.listen(PORT, () => {
          console.log(`-> [API] local: http://localhost:${PORT}`)
        })
      }
    }
```
## 5. CORS
- adalah configurasi untuk berbagi resources antara satu service ke service lainnya
- misal: komunikasi Fronted ke Backend
by default misal FE = originnya sama dengan domainnya, 
- tujuan cors = pengamanan
- by default : origin =

## 6. MENJALANKAN app.ts DI index.ts
```ts
    const main = () => {
      const app = new App();
      app.start()
    }

    main()
```

## 6. BUAT SampleController dan SampleRouter  

## 7. BIKIN ERROR HANDLER DI app.ts

  private app: Express; // hanya bisa diakses di class ini

  constructor() {
    this.app = express();
    this.configure()
    this.routes()
    this.handleError()        <<<<<<<<<<
  }

  private configure(): void {
    this.app.use(cors())
    this.app.use(json())
    this.app.use(urlencoded({extended: true}))
  }

```ts
  private handleError(): void { 
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      res.status(500).json({
        code: 500,
        message: err.message
      })
    })
  }
```




##  8. CREATE DUMMY ERROR IN CONTROLLER

    export class sampleController {
  ```ts    
      async getSampleData(req: Request, res: Response, next: NextFunction) {
        try {
          const isError = true;
          if(isError) throw new Error("Error!")

          return res.status(200).json({
            code: 200,
            message: "Hello, world"
          });
        } catch(error) {
          next(error)  // meneruskan ke error handling di app.ts
        }
      }
```
      async createSampleData(req: Request, res: Response) {
        return res.status(200).json({
          code: 200,
          message: "Create sample data success"
        })
      }
    }


## 9. GET STARTED WITH PRISMA
- override configurasi provider default (npx prisma init --datasource-provider mysql)

9.1 Create Prisma Model
```prisma
    model Sample {
      id Int @id @default(autoincrement()) // @map("_id") = untuk map kolom
      name String
      code String
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt

      @@map("samples") // map format tabel sesuai database (jadi snakecase)
    }
```

## 10. INITIALIZE PRISMA WITH LOG OPTIONS
```ts
    import { PrismaClient } from '@prisma/client'

    export default new PrismaClient({log: ['query', 'info', 'warn', 'error']})

```
## 11. APPLIED PRIMA TO CONTROLLER

export class sampleController {
  
  async getSampleData(req: Request, res: Response, next: NextFunction) {
    try {
      const sampleData = await prisma.sample.findMany();                  <<<<<<<<<<<<<<

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
    
    const newSampleData = await prisma.sample.create({                      <<<<<<<<<<<<<<
      data: {name, code}
    })


    return res.status(200).json({
      code: 200,
      message: "Create sample data success",
      data: newSampleData
    })
  }
}


## 12. DATA VALIDATOR WITH express-validator (sebelummnya menggunakan yup)
- npm i express-validator

12.1 CREATE middleware > sampleValidation.middleware.ts
```ts

export const validateSampleData = [
  body("name").notEmpty().withMessage('Name is required'),
  body("code").notEmpty().withMessage('Code is required'),

  (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if(!error.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: 'Error',
        errors: error.array(),
      })
    }
  }
]
```
12.3 Add Middleware : validateSampleData

  private initializeRoutes(): void {
      this.router.get("/", this.sampleController.getSampleData);
      `this.router.post('/',validateSampleData, this.sampleController.createSampleData)`
    }

12.4  RESULT WHEN ERROR IN Postman
```json
{
    "code": 400,
    "message": "Error",
    "errors": [
        {
            "type": "field",
            "msg": "Name is required",
            "path": "name",
            "location": "body"
        },
        {
            "type": "field",
            "msg": "Code is required",
            "path": "code",
            "location": "body"
        }
    ]
}
```

#### Good to Know : EXPRESS-VALIDATOR VS YUP
    - Yup is often used for form validation, configuration validation, and any other scenario where you need to validate data against a defined schema.
    - if you're working with Express.js and need to validate incoming data on the server side, express-validator is a suitable choice
    -  it's not uncommon to see developers using both libraries together in a full-stack application, where express-validator handles server-side validation, and yup is used for client-side validation or for defining shared validation logic between the client and server.


## 13. FILE UPLOAD (paka kasus ini hanya simpan data ke api kita (belum belajar nyimpen di bucket google etc))

- npm i multer
- npm i @types/multer -D

PENJELASAN : sebelumnya express hanya handle: json dan urlencoded, dengan mutler kita bisa handle multipart/form-data (untuk text/file)

13. 1. CREATE public > images > .gitkeep (to keep push to remote)

13. 2. CREATE src > middleware > uploader.middleware.ts
```ts
    type DestinationCallback = (error: Error | null, destination: string) => void;
    type FileNameCallback = (error: Error | null, filename: string) => void;

    export const uploader = (filePrefix: string, folderName?: string) => {
      const defaultDir = join(__dirname, "../../public") // dirname = current directory

      const storage = multer.diskStorage({ // memoryStorage untuk RAM
        destination: (
          req: Request,
          file: Express.Multer.File,
          cb: DestinationCallback
        )  => {
          // if folderName = image => public/image
          const destination = folderName ? defaultDir + folderName : defaultDir; 
          cb(null, destination)
        },
        filename: (
          req: Request,
          file: Express.Multer.File,
          cb: FileNameCallback
        ) => {
          const originalnameParts = file.originalname.split('.') 
          const fileExtension = originalnameParts[originalnameParts.length - 1];
          const newFileName = filePrefix + Date.now() + "." + fileExtension // mencegah nama yg sama salig timpa

          cb(null, newFileName)
        }
      })

      return multer({ storage })
    }
```

13. 3. CREATE NEW CONTROLLER
```ts
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
```

13. 4. MASUKIN KE ROUTE
```ts
    this.router.post('/single-upload', uploader("IMG", "/images").single("file"), this.sampleController.addNewImage) // single("file") => file = form data name
```

## 14 EMAILER

- npm i nodemailer
- npm i @types/nodemailer -D

PENJELASAN: nodemail bisa menggunakan protocol SMTP, IMAP etc (kita akan menggunakan SMTP)

- buat ngirim emaili dengan SMTP : banyak penyedia layanannya (kita akan gunakan accournt)
CARANYA : - masuk ke google myaccount (aktifkan 2 step verification jika belum)
          - seach: app password
          - creare app name : emailer_practice(example) => generate new password (uzbu kywr isvl rimf)

14. 1. BIKIN TRANSPORTER UNTUK NODEMAILER src > helpers > nodemailer.helper.ts

```ts
    import nodemailer from 'nodemailer'

    export const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nathanrosxhild@gmail.com",
        pass: "uzbu kywr isvl rimf"
      }
    })
```

#### Good to Know - DISPOSIBLE TEMPORARTY EMAIL ADDRESS
- we can use Shark Lasers

14. 2. CREATE NEW CONTROLLER
```ts
    async sendEmail(req: Request, res: Response, next: NextFunction) {
        try {
          await transporter.sendMail({
            from: 'nathanrosxhild@gmail.com',
            to: 'backupbelajarcoding@gmai.com',
            subject: 'welcome to the jungle',
            html: '<h1>thank you</h1>'
          })

          res.status(200).json({
            code: 200,
            message: "Email sent"
          })


        } catch(error) {
          next(error); 
        }
      }


      // THE ROUTER
      //  this.router.post('/send-email', this.sampleController.sendEmail)
```




## 15. CEATE DINAMIC TEMPLATE  FOR html TRANSPORTER WITH HANDLEBARS PACKAGE
- npm i handlebars

15. 1. CREATE src > template > template.hbs
```hbs
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Confirmation</title>
    </head>
    <body>
      <h1>Welcome to Purwadhika, Hello {{name}}</h1>
    </body>
    </html>
```

15. 2. EDIT CONTROLLER sendEmail
async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
```ts
      const templatePath = join(__dirname, "../templates", "template.hbs" )
      const templateSource = readFileSync(templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(templateSource)
      const html = compiledTemplate({name: "Bulan"})
```



      await transporter.sendMail({
        from: 'nathanrosxhild@gmail.com',
        to: 'backupbelajarcoding@gmail.com',
        subject: 'welcome to the jungle',
        html: html                               <<<<<<<
      })

      return res.status(200).json({
        code: 200,
        message: "Email sent"
      })

    } catch(error) {
      next(error); 
    }
  }



##  
##  
##  
##  
##  
##  
##  
##  
##  