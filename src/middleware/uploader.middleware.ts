import {join} from 'path'
import multer from 'multer'
import { Request } from 'express';

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
      const newFileName = `${filePrefix}-${Date.now()}.${fileExtension}` // mencegah nama yg sama salig timpa

      cb(null, newFileName)
    }
  })

  return multer({ storage })
}