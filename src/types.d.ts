declare namespace Express {
    export interface Request {
        file?: import('multer').Multer.File
    }
}

export {}; 