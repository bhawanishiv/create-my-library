const chalk = require("chalk");

const { getProgramOptions, prepareLibraryFiles } = require("./createLibrary");
const { promptOptions } = require("./prompts");

exports.cli = async (args) => {
  try {
    console.log(`args->`, args);
    const options = getProgramOptions(args);
    console.log(`options->`, options);
    const values = await promptOptions(options);
    console.log(`values->`, values);
    await prepareLibraryFiles(values);
  } catch (e) {
    console.error("%s: %s", chalk.red.bold("ERROR"), e.message);
    process.exit(1);
  }
};
