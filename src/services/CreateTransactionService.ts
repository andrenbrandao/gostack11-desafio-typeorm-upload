import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category: categoryTitle,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total - value < 0) {
      throw new AppError(
        'Current balance is insufficient to make this transaction.',
      );
    }

    const categoriesRepository = getRepository(Category);
    let category = await categoriesRepository.findOne({
      where: {
        title: categoryTitle,
      },
    });

    if (!category) {
      category = await categoriesRepository.create({
        title: categoryTitle,
      });
      await categoriesRepository.save(category);
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
