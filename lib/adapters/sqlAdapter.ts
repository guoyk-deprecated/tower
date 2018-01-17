/**
 * sqlAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

 import {IAdapter} from "./adapter";

 /**
  * result of sql query
  */
 export interface ISqlResult {
     /** sql query rows */
     rows: any[];
     /** extra */
     extra?: any;
 }

 /**
  * option of sql query
  */
 export interface ISqlOption {
     /** use the master node if this adapter supports replica */
     master?: boolean;
     /** id to lookup slice if this adapter supports sliceing */
     sliceOf?: number;
 }

 export class SqlAdapter implements IAdapter {
     public async query(sql: string, args?: any[], option?: ISqlOption): Promise<ISqlResult> {
         return {
             rows: [],
         };
     }
     public dispose() {
     }
 }
