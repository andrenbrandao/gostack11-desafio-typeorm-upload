import fs from 'fs';
import parseCSV from 'csv-parse/lib/sync';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const content = await fs.promises.readFile(path);
    const records = await parseCSV(content, {
      columns: true,
      trim: true,
    });

    const createTransaction = new CreateTransactionService();

    const starterPromise = Promise.resolve(null);

    const transactions = await records.reduce(
      (promise: Promise<Transaction | null>, record: TransactionDTO) =>
        promise.then(() => createTransaction.execute(record)),
      starterPromise,
    );

    await fs.promises.unlink(path);

    return transactions;
  }
}

export default ImportTransactionsService;
