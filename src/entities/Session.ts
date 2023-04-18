import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Session {

    @PrimaryGeneratedColumn()
    id: string

    @Column()
    nusp_cnpj: string
    
    @Column()
    token: string

}
