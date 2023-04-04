import { Entity, PrimaryColumn, Column } from "typeorm"

@Entity()
export class AuthRegister {

    @PrimaryColumn()
    email: string

    @Column()
    nusp_cnpj: string

    @Column()
    password: string

    @Column()
    category: string

}
