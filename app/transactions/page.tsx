import { db } from "../_lib/prisma";

const TransactionsPage = async () => {
  //acessar as transações, pois tudo é server component com o uso do approuter do next
  const transactions = await db.transaction.findMany({});

  return (
    <div>
      {transactions.map((transaction) => (
        <div key={transaction.id}>{transaction.name}</div>
      ))}
    </div>
  );
};

export default TransactionsPage;
