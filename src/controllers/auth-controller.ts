import { NextFunction, Request, Response } from "express"

export class AuthController {

    async getToken(request: Request, response: Response, next: NextFunction) {
        return 'placeholder'
    }

    async validateToken(request: Request, response: Response, next: NextFunction) {
        return 'placeholder'
    }

}