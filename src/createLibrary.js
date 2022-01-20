const { program, Option } = require("commander");
const globby = require("globby");
const pEachSeries = require("p-each-series");
const mkdirp = require("make-dir");
const handlebars = require("handlebars");
const Listr = require("listr");

const fs = require('fs')
const path = require("path");

const package = require("../package.json");

const templateBlacklist = new Set([
  "example/public/favicon.ico",
  "example/public/.gitignore",
  ".git",
]);

exports.getProgramOptions = (args) => {
  const defaults = {
    author: "Bhawani Shankar Bharti",
    license: "MIT",
    manager: "yarn",
    template: "default",
  };

  program
    .name("create-my-library")
    .version(package.version)
    .usage("[options] [package-name]")
    .addOption(new Option("-d, --desc <string>", "package description"))
    .addOption(
      new Option("-a, --author <string>", "author's github handle").default(
        defaults.author
      )
    )
    .addOption(
      new Option("-l, --license <string>", "package license").default(
        defaults.license
      )
    )
    .addOption(new Option("-r, --repository <string>", "package repo path"))
    .addOption(new Option("-g, --no-git", "generate without git init"))
    .addOption(
      new Option("-m, --manager <npm|yarn>", "package manager to use")
        .choices(["npm", "yarn"])
        .default(defaults.manager)
    )
    .addOption(
      new Option(
        "-t, --template <default|typescript|flow>",
        "package template to use"
      )
        .choices(["default", "typescript"])
        .default(defaults.template)
    )
    .parse(args);

  const opts = program.opts();

  const options = {
    description: opts.desc,
    author: opts.author,
    license: opts.license,
    repository: opts.repository,
    manager: opts.manager,
    template: opts.template,
    templatePath: opts.templatePath,
    skipPrompts: opts.skipPrompts,
    git: opts.git,
  };

  if (program.args.length === 1) {
    options.name = program.args[0];
  } else if (program.args.length > 1) {
    throw new Error("Invalid arguments");
  }
  return options;
};

const copyTemplateFiles = async ({ file, source, destination, options }) => {
  console.log(`file->`, file);

  const fileRelativePath = path.relative(source, file).replace(/\\/g, "/");
  if (fileRelativePath.startsWith(".git")) {
    return;
  }

  const destFilePath = path.join(destination, fileRelativePath);
  const destFileDir = path.parse(destFilePath).dir;

  await mkdirp(destFileDir);

  if (templateBlacklist.has(fileRelativePath)) {
    const content = fs.readFileSync(file);
    fs.writeFileSync(destFilePath, content);
  } else {
    const template = handlebars.compile(fs.readFileSync(file, "utf8"));
    const content = template({
      ...options,
      yarn: options.manager === "yarn",
    });

    fs.writeFileSync(destFilePath, content, "utf8");
  }

  return fileRelativePath;
};

exports.prepareLibraryFiles = async (options) => {
  const { manager, template, name, templatePath, git } = options;

  // handle scoped package names
  const parts = name.split("/");
  console.log(`parts->`, parts);
  options.shortName = parts[parts.length - 1];

  const destination = path.join(process.cwd(), options.shortName);
  options.destination = destination;
  console.log(`destination->`, destination);

  const source = path.join(__dirname, "..", "src", "templates", template);

  console.log(`source->`, source);
  const files = await globby(source.replace(/\\/g, "/"), {
    dot: true,
  });

  console.log(`files->`, files);
  const promise = pEachSeries(files, async (file) => {
    return copyTemplateFiles({
      file,
      source,
      destination,
      options,
    });
  });

  const tasks = new Listr([
    {
      title: `Copying ${template} template to ${destination}`,
      task: () => promise,
    },
  ]);

  await tasks.run();
};
