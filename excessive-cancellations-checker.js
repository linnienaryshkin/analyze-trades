import { createReadStream } from "node:fs";
import * as readline from "node:readline/promises";

// TODO: Such classes not make sense much, filePath could be used easily used as an argument. FP gives a better bundling of the code.
export class ExcessiveCancellationsChecker {
  /**
   * We provide a path to a file when initiating the class
   * you have to use it in your methods to solve the task
   * @param {string} filePath
   */
  constructor(filePath) {
    this.filePath = filePath;
  }

  /**
   * Returns the list of companies that are involved in excessive cancelling.
   * @returns {Promise<Array<string>>}
   */
  async companiesInvolvedInExcessiveCancellations() {
    const { excessiveCancellingCompanies } = await this.analyzeCsv();
    return Array.from(excessiveCancellingCompanies);
  }

  /**
   * Returns the total number of companies that are not involved in any excessive cancelling.
   * @returns {Promise<number>}
   */
  async totalNumberOfWellBehavedCompanies() {
    const { companiesList, excessiveCancellingCompanies } =
      await this.analyzeCsv();
    return (
      Array.from(companiesList).length -
      Array.from(excessiveCancellingCompanies).length
    );
  }

  /**
   * TODO: This method is already quite long and could be split into smaller methods
   * @returns {Promise<{excessiveCancellingCompanies: Set<string>, companiesList: Set<string>}>}
   */
  async analyzeCsv() {
    // TODO: Depending on the data amount, the RAM could be not enough to store all the companies, so we could use a external storage to store the companies and their transactions
    const companiesList = new Set();
    /**
     * We use Set to store the companies that are considered to be excessively cancelling
     * Excessive Cancelling - if the company cancels more than 1/3 of the total transaction quantity
     * Transaction - a combination of company's orders within 60 seconds
     */
    const excessiveCancellingCompanies = new Set();

    /**
     * We use Map to store the companies' transactions
     */
    const companiesTransaction = new Map();

    const stream = createReadStream(this.filePath, { encoding: "utf-8" });
    const readLineGenerator = readline.createInterface(stream);

    for await (const line of readLineGenerator) {
      const order = this.mapAndValidateOrder(line.split(","));
      if (order === null) {
        continue;
      }

      companiesList.add(order.company);

      /**
       * If the company is already considered to be excessively cancelling,
       * we skip that company from further analyzing
       */
      if (excessiveCancellingCompanies.has(order.company)) {
        continue;
      }

      /**
       * If there is no transaction for the company already in consideration,
       * we create a new transaction with the current order details
       */
      if (!companiesTransaction.has(order.company)) {
        // TODO: Consider defining a methods to work with the transactions (creating, accumulating)
        const newTransaction = {
          timestamp: order.date.getTime(),
          total: order.quantity,
          cancelled: order.orderType === "F" ? order.quantity : 0,
        };
        companiesTransaction.set(order.company, newTransaction);
        continue;
      }

      const transaction = companiesTransaction.get(order.company);

      /**
       * If the order is within 60 seconds of the current transaction,
       * we accumulate the transaction quantity with the new order details.
       *
       * Transaction is considered Completed if the order is more than 60 seconds.
       * Such transactions are passed to the next step of analyzing.
       */
      if (order.date.getTime() - transaction.timestamp < 60000) {
        const accumulatedTransaction = {
          timestamp: transaction.timestamp,
          total: transaction.total + order.quantity,
          cancelled:
            order.orderType === "F"
              ? transaction.cancelled + order.quantity
              : transaction.cancelled,
        };
        companiesTransaction.set(order.company, accumulatedTransaction);
        continue;
      }

      /**
       * If the transaction is cancelled more than 1/3 of the total quantity,
       * that company is considered to be excessively cancelling.
       * And not involved in any further analyzing
       *
       * TODO: Consider defining a method to analyze Completed transactions
       */
      if (transaction.cancelled / transaction.total > 1 / 3) {
        companiesTransaction.delete(order.company);
        excessiveCancellingCompanies.add(order.company);
        continue;
      }

      /**
       * If company haven't excessively cancelled, we continue analyzing it with the next transaction
       */
      const newTransaction = {
        timestamp: order.date.getTime(),
        total: order.quantity,
        cancelled: order.orderType === "F" ? order.quantity : 0,
      };
      companiesTransaction.set(order.company, newTransaction);
    }

    /**
     * Left transactions (which haven't got additional orders within 60 seconds)
     * are considered to be the Completed transaction.
     * We analyze them separably
     *
     * TODO: Consider defining a method to analyze left transactions, or maybe somehow reshape the data structure, collect ALL transactions and then analyze separably (not inside the stream loop)
     */
    for (const [company, transaction] of companiesTransaction) {
      if (transaction.cancelled / transaction.total > 1 / 3) {
        excessiveCancellingCompanies.add(company);
      }
    }

    return {
      excessiveCancellingCompanies,
      companiesList,
    };
  }

  /**
   * @param {string[]} lines
   * @returns {{date: Date, company: string, orderType: "D" | "F", quantity: number} | null}
   */
  mapAndValidateOrder(lines) {
    // TODO: It's always better to use a library to map and validate the data, like Zod or Joi
    const order = {
      date: new Date(lines[0]),
      company: String(lines[1]),
      orderType: String(lines[2]),
      quantity: parseInt(lines[3]),
    };

    if (
      isNaN(order.date.getTime()) ||
      typeof order.company !== "string" ||
      /**
       * D - New Order
       * F - Cancel Order
       */
      (order.orderType !== "D" && order.orderType !== "F") ||
      isNaN(order.quantity)
    ) {
      return null;
    }

    return order;
  }
}
