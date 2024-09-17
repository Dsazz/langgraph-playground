import { logger } from "./colored-log.util.js";

const performanceTime = async <T>(callback: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const res = await callback();
    const end = performance.now();
    const time = `${((end - start) / 1000).toFixed(2)}s`;
    logger.info("performance-time", `Execution time: ${time}`);
    return res;
  } catch (error) {
    const end = performance.now();
    const time = `${((end - start) / 1000).toFixed(2)}s`;
    logger.error("performance-time", `Execution time (with error): ${time}`);
    throw error;
  }
};
export default performanceTime;
