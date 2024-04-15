import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  /**
   * Github id
   */
  @PrimaryColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  /**
   * Github username
   */
  @Column()
  username: string;

  @Column({ name: 'api_key', nullable: true })
  apiKey: string;
}
