import { ICall } from './ICall'
import { IChain } from './IChain'
import { IPrivate } from './IPrivate'
import { IRequest } from './IRequest'
import { ITransaction } from './ITransaction'

export interface ITransactionRequest extends IRequest, ITransaction, ICall, IChain, IPrivate {}
