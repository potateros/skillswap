import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { TimeTransaction, TransactionType, TransactionStatus } from '../entities/TimeTransaction';
import logger from '../utils/logger';

export interface CreditCardInfo {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export interface TopUpRequest {
  userId: number;
  amount: number;
  paymentMethod: CreditCardInfo;
}

export interface SpendRequest {
  fromUserId: number;
  toUserId: number;
  amount: number;
  description: string;
  skillName?: string;
}

export class TimeBankingService {
  private userRepository: Repository<User>;
  private transactionRepository: Repository<TimeTransaction>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.transactionRepository = AppDataSource.getRepository(TimeTransaction);
  }

  // Fake credit card processing
  private async processFakeCreditCard(cardInfo: CreditCardInfo, amount: number): Promise<{ success: boolean; transactionRef?: string; error?: string }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple validation rules for demo
    const cardNumber = cardInfo.cardNumber.replace(/\s/g, '');
    
    // Fake rejection cases
    if (cardNumber === '4000000000000002') {
      return { success: false, error: 'Card declined - insufficient funds' };
    }
    if (cardNumber === '4000000000000069') {
      return { success: false, error: 'Card expired' };
    }
    if (cardInfo.cvv === '000') {
      return { success: false, error: 'Invalid CVV' };
    }
    if (amount > 1000) {
      return { success: false, error: 'Transaction amount exceeds limit' };
    }

    // Generate fake transaction reference
    const transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return { success: true, transactionRef };
  }

  async topUpCredits(request: TopUpRequest): Promise<TimeTransaction> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get user
      const user = await queryRunner.manager.findOne(User, { where: { id: request.userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Create pending transaction
      const transaction = new TimeTransaction();
      transaction.user = user;
      transaction.type = TransactionType.TOPUP;
      transaction.amount = request.amount;
      transaction.balanceBefore = user.time_credits;
      transaction.balanceAfter = user.time_credits + request.amount;
      transaction.status = TransactionStatus.PENDING;
      transaction.description = `Credit top-up via card ending in ${request.paymentMethod.cardNumber.slice(-4)}`;
      transaction.paymentMethod = `Card ending in ${request.paymentMethod.cardNumber.slice(-4)}`;
      transaction.metadata = {
        cardLast4: request.paymentMethod.cardNumber.slice(-4),
        cardholderName: request.paymentMethod.cardholderName
      };

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Process fake payment
      const paymentResult = await this.processFakeCreditCard(request.paymentMethod, request.amount);

      if (!paymentResult.success) {
        // Mark transaction as failed
        savedTransaction.status = TransactionStatus.FAILED;
        savedTransaction.metadata = { ...savedTransaction.metadata, error: paymentResult.error };
        await queryRunner.manager.save(savedTransaction);
        await queryRunner.commitTransaction();
        throw new Error(`Payment failed: ${paymentResult.error}`);
      }

      // Payment successful - update user balance and transaction
      user.time_credits += request.amount;
      savedTransaction.status = TransactionStatus.COMPLETED;
      savedTransaction.transactionRef = paymentResult.transactionRef || `FAILED_${Date.now()}`;

      await queryRunner.manager.save([user, savedTransaction]);
      await queryRunner.commitTransaction();

      logger.info(`User ${user.id} topped up ${request.amount} credits successfully`);
      return savedTransaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Top-up transaction failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async spendCredits(request: SpendRequest): Promise<TimeTransaction[]> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get both users
      const [fromUser, toUser] = await Promise.all([
        queryRunner.manager.findOne(User, { where: { id: request.fromUserId } }),
        queryRunner.manager.findOne(User, { where: { id: request.toUserId } })
      ]);

      if (!fromUser || !toUser) {
        throw new Error('One or both users not found');
      }

      if (fromUser.time_credits < request.amount) {
        throw new Error('Insufficient credits');
      }

      // Create spend transaction for sender
      const spendTransaction = new TimeTransaction();
      spendTransaction.user = fromUser;
      spendTransaction.type = TransactionType.SPEND;
      spendTransaction.amount = request.amount;
      spendTransaction.balanceBefore = fromUser.time_credits;
      spendTransaction.balanceAfter = fromUser.time_credits - request.amount;
      spendTransaction.status = TransactionStatus.COMPLETED;
      spendTransaction.description = request.description;
      spendTransaction.metadata = {
        recipientId: toUser.id,
        recipientName: toUser.name,
        skillName: request.skillName
      };

      // Create earn transaction for recipient
      const earnTransaction = new TimeTransaction();
      earnTransaction.user = toUser;
      earnTransaction.type = TransactionType.EARN;
      earnTransaction.amount = request.amount;
      earnTransaction.balanceBefore = toUser.time_credits;
      earnTransaction.balanceAfter = toUser.time_credits + request.amount;
      earnTransaction.status = TransactionStatus.COMPLETED;
      earnTransaction.description = request.description;
      earnTransaction.metadata = {
        senderId: fromUser.id,
        senderName: fromUser.name,
        skillName: request.skillName
      };

      // Update user balances
      fromUser.time_credits -= request.amount;
      toUser.time_credits += request.amount;

      // Save all changes
      const savedTransactions = await queryRunner.manager.save([spendTransaction, earnTransaction]);
      await queryRunner.manager.save([fromUser, toUser]);

      await queryRunner.commitTransaction();

      logger.info(`Credit transfer: ${fromUser.id} -> ${toUser.id}, amount: ${request.amount}`);
      return savedTransactions;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Credit spending transaction failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserTransactions(userId: number, limit: number = 50): Promise<TimeTransaction[]> {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async getUserBalance(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user?.time_credits || 0;
  }
}