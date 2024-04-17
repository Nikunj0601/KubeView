import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Environment {
  /**
   * Github id
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  namespace: string;

  /**
   * Github username
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  username: User;

  @Column()
  pull: number;

  @Column()
  repo: string;
}
