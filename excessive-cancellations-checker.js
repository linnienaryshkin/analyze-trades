import { createReadStream } from "node:fs";
import * as readline from "node:readline/promises";

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
   * If, in any given 60 second period and for a given company,
   * the ratio of the cumulative quantity of cancels to cumulative quantity of orders is greater than `1/3`
   * then the company is engaged in excessive cancelling.
   * @returns {Promise<Array<string>>}
   */
  async companiesInvolvedInExcessiveCancellations() {
    const excessiveCancellingCompanies = new Set();
    const companiesTransaction = new Map();

    const stream = createReadStream(this.filePath, { encoding: "utf-8" });
    const readLineGenerator = readline.createInterface(stream);

    for await (const line of readLineGenerator) {
      const order = this.mapAndValidateOrder(line.split(","));
      if (order === null) {
        continue;
      }

      if (excessiveCancellingCompanies.has(order.company)) {
        continue;
      }

      if (!companiesTransaction.has(order.company)) {
        const transaction = {
          timestamp: order.date.getTime(),
          total: order.quantity,
          cancelled: order.orderType === "F" ? order.quantity : 0,
        };
        companiesTransaction.set(order.company, transaction);
      } else {
        const transaction = companiesTransaction.get(order.company);

        /**
         * If the order is within 60 seconds of the current transaction,
         * we update the transaction object with the new order details
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
         */
        if (transaction.cancelled / transaction.total > 1 / 3) {
          companiesTransaction.delete(order.company);
          excessiveCancellingCompanies.add(order.company);
          continue;
        }

        const newTransaction = {
          timestamp: order.date.getTime(),
          total: order.quantity,
          cancelled: order.orderType === "F" ? order.quantity : 0,
        };
        companiesTransaction.set(order.company, newTransaction);
      }
    }

    for (const [company, transaction] of companiesTransaction) {
      if (transaction.cancelled / transaction.total > 1 / 3) {
        excessiveCancellingCompanies.add(company);
      }
    }

    return Array.from(excessiveCancellingCompanies);
  }

  /**
   * Returns the total number of companies that are not involved in any excessive cancelling.
   * @returns {Promise<number>}
   */
  async totalNumberOfWellBehavedCompanies() {
    const nonExcessiveCancellingCompaniesCount = 0;

    return nonExcessiveCancellingCompaniesCount;
  }

  /**
   * @param {string[]} lines
   * @returns {{date: Date, company: string, orderType: "D" | "F", quantity: number} | null}
   */
  mapAndValidateOrder(lines) {
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
