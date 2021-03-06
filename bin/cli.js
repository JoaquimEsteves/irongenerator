#!/usr/bin/env node

'use strict';

const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const log = console.log;
const questions = require('./questions');
const createApplication = require('./../lib/create-app');
const { version: VERSION } = require('./../package');
const { merge } = require('lodash');

const normalizeAppName = name =>
  name
    .replace(/[^A-Za-z0-9.-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase();

const terminate = () => {
  console.log('Terminating ironmaker');
  process.exit(0);
};

process.on('SIGINT', terminate);
process.on('SIGTERM', terminate);

log('\n', `${chalk.cyan('Welcome to ironmaker!')}  ${chalk.grey('v.' + VERSION)}`, '\n');

const defaultOptions = {
  architecture: 'mvc',
  template: null,
  style: null,
  database: false,
  authentication: { enabled: false, mechanism: null },
  strict: false,
  linting: false
};

inquirer
  .prompt(questions)
  .then(async answers => {
    const name = normalizeAppName(answers.name);
    const options = merge(
      {
        ...defaultOptions,
        name,
        directory: path.resolve(process.cwd(), name),
        verbose: true
      },
      answers
    );
    console.log('\n');
    await createApplication(options);
  })
  .catch(error => {
    if (error.message === 'NO_OVERRIDE') {
      process.exit();
    } else {
      console.log('There was an error generating your app.');
      console.error(error);
      process.exit(1);
    }
  });
