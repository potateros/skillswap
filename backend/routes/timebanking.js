const express = require('express');
const { TimeBankingService } = require('../src/services/TimeBankingService');

const router = express.Router();
const timeBankingService = new TimeBankingService();

// Get user's credit balance
router.get('/balance/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const balance = await timeBankingService.getUserBalance(userId);
    
    res.json({ balance });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's transaction history
router.get('/transactions/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 50;
    
    const transactions = await timeBankingService.getUserTransactions(userId, limit);
    
    res.json({ transactions });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Top up credits with credit card
router.post('/topup', async (req, res) => {
  try {
    const { userId, amount, paymentMethod } = req.body;

    // Validate input
    if (!userId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0 || amount > 1000) {
      return res.status(400).json({ error: 'Amount must be between $1 and $1000' });
    }

    if (!paymentMethod.cardNumber || !paymentMethod.expiryMonth || 
        !paymentMethod.expiryYear || !paymentMethod.cvv || !paymentMethod.cardholderName) {
      return res.status(400).json({ error: 'Incomplete payment information' });
    }

    const transaction = await timeBankingService.topUpCredits({
      userId,
      amount,
      paymentMethod
    });
    
    res.json({ 
      success: true, 
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        transactionRef: transaction.transactionRef,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Error topping up credits:', error);
    res.status(400).json({ error: error.message });
  }
});

// Spend credits (transfer to another user)
router.post('/spend', async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, description, skillName } = req.body;

    // Validate input
    if (!fromUserId || !toUserId || !amount || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot transfer credits to yourself' });
    }

    const transactions = await timeBankingService.spendCredits({
      fromUserId,
      toUserId,
      amount,
      description,
      skillName
    });
    
    res.json({ 
      success: true, 
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    console.error('Error spending credits:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;