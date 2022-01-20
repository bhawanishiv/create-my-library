const { program, Option } = require("commander");
const globby = require("globby");
const pEachSeries = require("p-each-series");
const mkdirp = require("make-dir");
const handlebars = require("handlebars");
const execa = require("execa");
const Listr = require("listr");

const fs = require("fs");
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

const installPackages = ({ manager, destination }) => {
  return execa(manager, ["install"], { cwd: destination });
};

const initializeGit = ({ destination }) => {
  const gitIgnorePath = path.join(destination, ".gitignore");
  fs.writeFileSync(
    gitIgnorePath,
    `
# See https://help.github.com/ignore-files/ for more about ignoring files.
# dependencies
node_modules
# builds
build
dist
.rpt2_cache
# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`,
    "utf8"
  );

  return execa("git", ["init"], { cwd: destination });
};

exports.prepareLibraryFiles = async (options) => {
  const { manager, template, name, git } = options;

  // handle scoped package names
  const parts = name.split("/");
  options.shortName = parts[parts.length - 1];

  const destination = path.join(process.cwd(), options.shortName);
  options.destination = destination;

  const source = path.join(__dirname, "..", "src", "templates", template);

  const files = await globby(source.replace(/\\/g, "/"), {
    dot: true,
  });

  const promise = pEachSeries(files, async (file) => {
    return copyTemplateFiles({
      file,
      source,
      destination,
      options,
    });
  });

  const tasks = [
    {
      title: `Copying ${template} template to ${destination}`,
      task: () => promise,
    },
    {
      title: `Installing dependencies using ${manager}`,
      task: () => installPackages(options),
    },
  ];

  if (git) {
    tasks.push({
      title: "Initializing Git",
      task: () => initializeGit(options),
    });
  }

  const task = new Listr(tasks);

  await task.run();
};
