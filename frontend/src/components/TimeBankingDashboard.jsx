import React, { useState, useEffect } from 'react';

const TimeBankingDashboard = ({ currentUser, onUpdateCredits }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchBalance();
      fetchTransactions();
    }
  }, [currentUser]);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`/api/timebanking/balance/${currentUser.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/timebanking/transactions/${currentUser.id}?limit=20`, {
        credentials: 'include'
      });
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!cardDetails.cardNumber || !cardDetails.expiryMonth || 
        !cardDetails.expiryYear || !cardDetails.cvv || !cardDetails.cardholderName) {
      alert('Please fill in all card details');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/timebanking/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser.id,
          amount: parseFloat(topUpAmount),
          paymentMethod: cardDetails
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully topped up $${topUpAmount}!`);
        setShowTopUp(false);
        setTopUpAmount('');
        setCardDetails({
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          cardholderName: ''
        });
        fetchBalance();
        fetchTransactions();
        if (onUpdateCredits) {
          onUpdateCredits(balance + parseFloat(topUpAmount));
        }
      } else {
        alert(`Payment failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error topping up:', error);
      alert('Error processing payment');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup': return '💳';
      case 'spend': return '💸';
      case 'earn': return '💰';
      case 'refund': return '🔄';
      default: return '💱';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup': return 'text-blue-600';
      case 'spend': return 'text-red-600';
      case 'earn': return 'text-green-600';
      case 'refund': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Time Banking</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">Current Balance</div>
          <div className="text-3xl font-bold text-green-600">{balance} credits</div>
          <div className="text-sm text-gray-500">${balance} USD equivalent</div>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowTopUp(!showTopUp)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Top Up Credits
        </button>
      </div>

      {showTopUp && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add Credits</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                placeholder="4111 1111 1111 1111"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardDetails.cardholderName}
                onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})}
                placeholder="John Doe"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Month
              </label>
              <input
                type="text"
                value={cardDetails.expiryMonth}
                onChange={(e) => setCardDetails({...cardDetails, expiryMonth: e.target.value})}
                placeholder="12"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Year
              </label>
              <input
                type="text"
                value={cardDetails.expiryYear}
                onChange={(e) => setCardDetails({...cardDetails, expiryYear: e.target.value})}
                placeholder="25"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                placeholder="123"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength="4"
              />
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            <div>🔒 Demo Mode - Use test cards:</div>
            <div>• 4111 1111 1111 1111 (Success)</div>
            <div>• 4000 0000 0000 0002 (Declined - Insufficient funds)</div>
            <div>• 4000 0000 0000 0069 (Expired card)</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTopUp}
              disabled={processing}
              className={`px-4 py-2 rounded-lg transition-colors ${
                processing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {processing ? 'Processing...' : 'Add Credits'}
            </button>
            <button
              onClick={() => setShowTopUp(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No transactions yet. Start by topping up your credits!
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'spend' ? '-' : '+'}{transaction.amount} credits
                  </div>
                  <div className="text-sm text-gray-500">
                    Status: {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeBankingDashboard;