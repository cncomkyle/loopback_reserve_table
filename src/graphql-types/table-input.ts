import {argsType, field} from '@loopback/graphql';



@argsType()
export class TableArgs {
  @field({nullable: true})
  size: number;
  @field({nullable: true})
  reserve_date_time: String;
}
