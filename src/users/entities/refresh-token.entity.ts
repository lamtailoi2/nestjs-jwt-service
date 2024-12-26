import { Column, PrimaryColumn, Entity, Generated, AfterUpdate } from 'typeorm';

@Entity()
export class RefreshToken {
  @Generated('increment')
  id: string;

  @Column()
  token: string;

  @PrimaryColumn()
  userId: string;

  @AfterUpdate()
  async updateToken() {
    console.log('Update success');
  }
}
