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

    // TODO: Stream read the file and process it line by line

    // TODO: Validate each line

    // TODO: Define a order transaction object - { company: string, timestamp: number, total: number, cancelled: number }

    // TODO: Handle transactions on timestamp passed 60 seconds

    // TODO: Handle every transaction left transaction after end of file, via separate for loop

    // TODO: Ignore companies that is already in the excessiveCancellingCompanies set

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
}
