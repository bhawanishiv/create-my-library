const inquirer = require("inquirer");
const validateNpmName = require("validate-npm-package-name");

exports.promptOptions = async (options) => {
  if (options.name && !validateNpmName(options.name).validForNewPackages) {
    throw new Error(`Invalid package name "${options.name}"`);
  }

  const questions = [
    {
      type: "input",
      name: "name",
      message: "Package Name",
      validate: (name) => {
        return name && validateNpmName(name).validForNewPackages;
      },
      default: options.name,
    },
    {
      type: "input",
      name: "description",
      message: "Description",
      default: options.description,
    },
    {
      type: "input",
      name: "author",
      message: "Author",
      default: options.author,
    },
    {
      type: "input",
      name: "repository",
      message: "GitHub Repository",
      default: options.repository,
    },
    {
      type: "input",
      name: "license",
      message: "License",
      default: options.license,
    },
    {
      type: "list",
      name: "template",
      message: "Template",
      choices: ["default", "typescript"],
      default: options.template,
    },
    {
      type: "list",
      name: "manager",
      message: "Package Manager",
      choices: ["npm", "yarn"],
      default: options.manager,
    },
  ];

  const values = await inquirer.prompt(questions);
  return values;
};
