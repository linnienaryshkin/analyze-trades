/**
 * Note that this file cannot be modified.
 * If you would like to add your own unit tests, please put these in a separate test file.
 */
//Setup
import { ExcessiveCancellationsChecker } from "../excessive-cancellations-checker.js";

const checker = new ExcessiveCancellationsChecker("./data/trades.csv");

describe("ExcessiveCancellationsChecker", () => {
  it("generates the list of companies that are NOT involved in excessive cancelling", async () => {
    const number = await checker.totalNumberOfWellBehavedCompanies();
    expect(number).toEqual(12);
  });
});
