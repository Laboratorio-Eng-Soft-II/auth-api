import { NextFunction, Request, Response } from "express"
import { AuthRegister } from "../entities/AuthRegister"
import { AppDataSource } from '../utils/data-source'
import crypto from 'crypto'
import config from 'config';
import { Session } from "../entities/Session";


export class AuthController {

    private authRepository = AppDataSource.getRepository(AuthRegister)
    private sessionRepository = AppDataSource.getRepository(Session)
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

                await this.sessionRepository.delete({nusp_cnpj: user.nusp_cnpj})

                await this.sessionRepository.save({
                    nusp_cnpj: user.nusp_cnpj,
                    token
                })

                return { token,
                         nusp_cnpj: user.nusp_cnpj }
            }
            else {
                return response.status(401).send('Unauthorized!')
            }
        }
        else {
            return response.status(401).send('Unauthorized!')
        }
    }

    async validateToken(request: Request, response: Response, next: NextFunction) {
        const jwtSecret = config.get<string>('jwtSecret')
        const jwt = require('jsonwebtoken');

        const { token } = request.body;
        
        try {
            const decodedToken = jwt.verify(token, jwtSecret)

            const session = await this.sessionRepository.findOneBy({ token }) 
            
            if(!session){
                return response.status(401).send('Expired session!')
            }
        }
        catch (err) {
            return response.status(401).send('Unauthorized!')
        }

        return {
            status: response.statusCode,
            authStatus: 'Authorized'
        }
    }

}