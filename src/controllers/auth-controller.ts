import { NextFunction, Request, Response } from "express"
import { AuthRegister } from "../entities/AuthRegister"
import { AppDataSource } from '../utils/data-source'
import crypto from 'crypto'
import config from 'config';


export class AuthController {

    private authRepository = AppDataSource.getRepository(AuthRegister)
    private hash = crypto.createHash('sha512')

    async save(request: Request, response: Response, next: NextFunction) {
        const { email,
                password,
                nusp_cnpj,
                category } = request.body;
        
        let userToAdd = await this.authRepository.findOneBy({ email })
        if (userToAdd) {
            return "User already registered!"
        }

        const hashedPassword = this.hash.update(password).digest('hex')

        const authRegister = Object.assign(new AuthRegister(), {
            email,
            password: hashedPassword,
            nusp_cnpj,
            category
        })

        await this.authRepository.save(authRegister)

        return {
            status: response.statusCode,
            email,
            nusp_cnpj
        }
    }

    async getToken(request: Request, response: Response, next: NextFunction) {
        const jwtExpiration = config.get<string>('jwtExpiration');
        const jwtSecret = config.get<string>('jwtSecret')

        const { email,
                password } = request.body;
        const jwt = require('jsonwebtoken');
    
        let user = await this.authRepository.findOneBy({ email })
        if (user) {
            const hashedPassword = this.hash.update(password).digest('hex')
            if (hashedPassword == user.password) {
                const token = jwt.sign({
                    email,
                    createdIn: Date.now(),

                }, jwtSecret, { expiresIn: jwtExpiration })
                return { token,
                         nusp_cnpj: user.nusp_cnpj }
            }
            else {
                return 'Unauthorized!'
            }
        }
        else {
            return 'User not found!'
        }
    }

    async validateToken(request: Request, response: Response, next: NextFunction) {
        const jwtSecret = config.get<string>('jwtSecret')
        const jwt = require('jsonwebtoken');

        const { token } = request.body;
        
        try {
            const decodedToken = jwt.verify(token, jwtSecret)
            console.log(decodedToken)
        }
        catch (err) {
            return {
                status: 401,
                authStatus: 'Unauthorized'
            }
        }

        return {
            status: response.statusCode,
            authStatus: 'Authorized'
        }
    }

}