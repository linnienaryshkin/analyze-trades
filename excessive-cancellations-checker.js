import { createReadStream } from "node:fs";

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

    const companiesTransactions = new Map();

    const readStream = createReadStream(this.filePath);

    for await (const chunk of readStream) {
      const lines = chunk.toString().split(",");

      const order = this.mapAndValidateOrder(lines);
      if (order === null) {
        continue;
      }

      // TODO: Define an order transaction object - { company: string, timestamp: number, total: number, cancelled: number }

      // TODO: Handle transactions on timestamp passed 60 seconds

      // TODO: Handle every transaction left transaction after end of file, via separate for loop

      // TODO: Ignore companies that is already in the excessiveCancellingCompanies set

      console.log(order);
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
   * @returns {{date: Date, company: string, isCancelled: boolean, quantity: number} | null}
   */
  mapAndValidateOrder(lines) {
    const transaction = {
      date: new Date(lines[0]),
      company: String(lines[1]).trim(),
      isCancelled: String(lines[2]) === "F",
      quantity: parseInt(lines[3]),
    };

    if (
      isNaN(transaction.date.getTime()) ||
      typeof transaction.company !== "string" ||
      typeof transaction.isCancelled !== "boolean" ||
      isNaN(transaction.quantity)
    ) {
      return null;
    }

    return transaction;
  }
}
