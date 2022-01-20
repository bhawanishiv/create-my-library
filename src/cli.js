const chalk = require("chalk");

const { getProgramOptions, prepareLibraryFiles } = require("./createLibrary");
const { promptOptions } = require("./prompts");

exports.cli = async (args) => {
  try {
    const options = getProgramOptions(args);
    const values = await promptOptions(options);
    await prepareLibraryFiles({ ...options, ...values });
  } catch (e) {
    console.error("%s: %s", chalk.red.bold("ERROR"), e.message);
    process.exit(1);
  }
};
