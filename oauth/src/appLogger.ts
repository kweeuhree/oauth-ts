export const log = (message: string) => {
  console.info(`INFO\t${new Date().toLocaleString()}\t${message}`);
};
